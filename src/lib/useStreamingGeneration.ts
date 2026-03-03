import { useState, useCallback, useRef } from 'react';
import { registry, type Block } from '../renderer/registry';

// Backend API types
interface GenerationRequestAPI {
  topic: string;
  target_audience: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  max_sections?: number;
  include_interactive?: boolean;
}

// SSE Event types from backend
interface StreamingEvent {
  task_id: string;
  type: 'stage_start' | 'stage_complete' | 'skeleton_ready' | 'block_ready'
       | 'heartbeat' | 'progress' | 'section_complete' | 'complete' | 'error';
  stage?: string;
  data?: any;
  timestamp: number;
}

// Skeleton structure
interface SkeletonSection {
  section_id: string;
  title: string;
  node_count: number;
}

interface PageSkeleton {
  sections: SkeletonSection[];
  estimated_blocks: number;
}

// Streaming state
interface StreamingState {
  // Skeleton structure
  skeleton: PageSkeleton | null;

  // Content blocks
  blocks: Block[];

  // Status
  isComplete: boolean;
  currentStage: string;
  error: string | null;

  // Progress tracking
  metadata: {
    totalBlocks: number;
    receivedBlocks: number;
    elapsed_time: number;
    estimated_remaining: number;
    stages: Record<string, { started?: number; completed?: number; duration?: number }>;
  };

  // UI state
  lastHeartbeat: string;
  progress: string;  // "5/12 (42%)"
}

export function useStreamingGeneration(request: GenerationRequestAPI) {
  const [state, setState] = useState<StreamingState>({
    skeleton: null,
    blocks: [],
    isComplete: false,
    currentStage: 'idle',
    error: null,
    metadata: {
      totalBlocks: 0,
      receivedBlocks: 0,
      elapsed_time: 0,
      estimated_remaining: 0,
      stages: {}
    },
    lastHeartbeat: '',
    progress: ''
  });

  const [controller, setController] = useState<AbortController | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const isStreamingRef = useRef<boolean>(false);

  const startStreaming = useCallback(async () => {
    // Prevent duplicate requests
    if (isStreamingRef.current) {
      console.log('⚠️ Streaming already in progress, skipping duplicate request');
      return;
    }

    console.log('🚀 Starting streaming generation for:', request.topic);

    const ctrl = new AbortController();
    setController(ctrl);
    isStreamingRef.current = true;
    startTimeRef.current = Date.now();

    try {
      console.log('📡 Sending request to: http://localhost:8000/generate/stream');
      const response = await fetch('http://localhost:8000/generate/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: ctrl.signal
      });

      console.log('📡 Response received:', response.status, response.statusText);
      console.log('📡 Response headers:', response.headers);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No response body');

      console.log('✅ Reader created, starting to read SSE stream...');

      let buffer = '';
      let eventCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log(`✅ Stream ended. Total events received: ${eventCount}`);
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        console.log(`📦 Received chunk: ${value.length} bytes, buffer size: ${buffer.length}`);

        // Process SSE events
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          // Parse SSE format:
          // event: stage_start
          // data: {...}

          const lines_splitted = line.split('\n');
          let eventData = null;

          for (const l of lines_splitted) {
            if (l.startsWith('data: ')) {
              try {
                eventData = JSON.parse(l.slice(6));
              } catch (e) {
                console.error('Failed to parse data JSON:', l);
              }
            }
          }

          if (!eventData) continue;

          try {
            const event: StreamingEvent = eventData;
            eventCount++;
            const elapsed = (Date.now() - startTimeRef.current) / 1000;

            // Debug logging
            console.log(`📨 Event #${eventCount}:`, event.type, event.stage);

            setState(prev => {
              const newState = { ...prev };
              newState.metadata.elapsed_time = elapsed;

              switch (event.type) {
                case 'stage_start':
                  newState.currentStage = event.stage || 'unknown';
                  newState.metadata.stages[event.stage!] = {
                    ...prev.metadata.stages[event.stage!],
                    started: event.timestamp
                  };
                  break;

                case 'stage_complete':
                  const started = newState.metadata.stages[event.stage!]?.started || event.timestamp;
                  newState.metadata.stages[event.stage!] = {
                    ...newState.metadata.stages[event.stage!],
                    completed: event.timestamp,
                    duration: event.timestamp - started
                  };

                  // Estimate remaining time based on stages
                  const completed_stages = Object.values(newState.metadata.stages).filter(s => s.duration);
                  if (completed_stages.length >= 2) {
                    const avg_stage_time = completed_stages.reduce((a, b) => a + (b.duration || 0), 0) / completed_stages.length;
                    const remaining_stages = 4 - completed_stages.length;  // 4 total stages
                    newState.metadata.estimated_remaining = avg_stage_time * remaining_stages;
                  }
                  break;

                case 'skeleton_ready':
                  console.log('🦴 Setting skeleton:', event.data);
                  newState.skeleton = event.data;
                  newState.metadata.totalBlocks = event.data?.estimated_blocks || 0;
                  break;

                case 'block_ready':
                  const newBlock = event.data?.block;
                  console.log('🧱 Adding block:', newBlock?.type, newBlock?.title);
                  if (newBlock) {
                    newState.blocks = [...prev.blocks, newBlock];
                    newState.metadata.receivedBlocks++;
                    newState.progress = event.data?.progress || '';
                  }

                  // Update ETA based on blocks
                  if (newState.metadata.receivedBlocks > 0 && newState.metadata.totalBlocks > 0) {
                    const time_per_block = elapsed / newState.metadata.receivedBlocks;
                    const remaining_blocks = newState.metadata.totalBlocks - newState.metadata.receivedBlocks;
                    newState.metadata.estimated_remaining = time_per_block * remaining_blocks;
                  }
                  break;

                case 'heartbeat':
                  newState.lastHeartbeat = event.data?.message || '';
                  break;

                case 'complete':
                  newState.isComplete = true;
                  newState.metadata.totalBlocks = event.data?.total_blocks || 0;
                  newState.metadata.estimated_remaining = 0;
                  console.log(`✅ Saved to: ${event.data?.saved_to}`);
                  break;

                case 'error':
                  newState.error = event.data?.error || 'Unknown error';
                  newState.isComplete = true;
                  break;
              }

              return newState;
            });
          } catch (e) {
            console.error('Failed to parse SSE event:', e);
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setState(prev => ({ ...prev, error: error.message, isComplete: true }));
      }
    } finally {
      // Reset streaming flag when done
      isStreamingRef.current = false;
    }
  }, [request]);

  const cancel = useCallback(() => {
    controller?.abort();
    isStreamingRef.current = false;
  }, [controller]);

  return { state, startStreaming, cancel };
}

export type { GenerationRequestAPI, StreamingState, StreamingEvent, PageSkeleton };
