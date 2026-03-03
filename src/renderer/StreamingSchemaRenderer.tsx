import React, { useMemo } from "react";
import { registry, type Block } from "./registry";
import { SidebarNav } from "../components/layout/SidebarNav";
import { cn } from "../lib/utils";
import type { PageSkeleton, StreamingState } from "../lib/useStreamingGeneration";

interface StreamingSchemaRendererProps {
  skeleton: PageSkeleton | null;
  blocks: Block[];
  isComplete: boolean;
  currentStage: string;
  error?: string | null;
  metadata: {
    totalBlocks: number;
    receivedBlocks: number;
    elapsed_time: number;
    estimated_remaining: number;
  };
  lastHeartbeat: string;
  progress: string;
}

// Stage display configuration
const STAGE_CONFIG: Record<string, {icon: string; label: string; color: string}> = {
  planner: {
    icon: '🏗️',
    label: 'Planning structure',
    color: 'blue'
  },
  content_expert: {
    icon: '📚',
    label: 'Generating content',
    color: 'purple'
  },
  visual_director: {
    icon: '🎨',
    label: 'Selecting components',
    color: 'pink'
  },
  assembler: {
    icon: '🔧',
    label: 'Assembling page',
    color: 'green'
  },
  idle: {
    icon: '⏳',
    label: 'Initializing...',
    color: 'gray'
  }
};

export function StreamingSchemaRenderer({
  skeleton,
  blocks,
  isComplete,
  currentStage,
  error,
  metadata,
  lastHeartbeat,
  progress
}: StreamingSchemaRendererProps) {
  const navItems = useMemo(() => extractNavItems(blocks), [blocks]);

  // Format time display
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  };

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-500/10 p-6">
        <div className="font-semibold mb-2">❌ Generation error</div>
        <div className="text-sm opacity-80 mb-4">{error}</div>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition">
          Try again
        </button>
      </div>
    );
  }

  // Initial loading state (before skeleton)
  if (!skeleton && !isComplete) {
    const stage = STAGE_CONFIG[currentStage] || STAGE_CONFIG.idle;

    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        <div className="text-center space-y-2">
          <div className="text-2xl">{stage.icon}</div>
          <div className="text-slate-300">{stage.label}...</div>
          {metadata.elapsed_time > 0 && (
            <div className="text-sm text-slate-500">
              Elapsed: {formatTime(metadata.elapsed_time)}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Skeleton preview (before blocks arrive)
  if (skeleton && blocks.length === 0 && !isComplete) {
    return (
      <div className="space-y-8">
        {/* Stage indicator */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-400">
                {STAGE_CONFIG.assembler.icon} {STAGE_CONFIG.assembler.label}
              </div>
              <div className="text-xs text-blue-300/70">
                Estimated {skeleton.estimated_blocks} components • ~{formatTime(metadata.estimated_remaining)} remaining
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton preview */}
        <div className="space-y-4">
          <div className="text-sm text-slate-400 mb-4">📋 Page structure:</div>
          {skeleton.sections.map((section, idx) => (
            <div key={section.section_id} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
              <div className="text-slate-500 text-sm w-6">{idx + 1}.</div>
              <div className="flex-1">
                <div className="text-slate-300">{section.title}</div>
                <div className="text-xs text-slate-500">{section.node_count} components</div>
              </div>
              <div className="animate-pulse text-slate-600">⏳</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Main streaming render
  return (
    <div className="space-y-8">
      {/* Progress header */}
      {!isComplete && (
        <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <div className="text-sm">
                <span className="text-blue-400 font-medium">
                  Generated {metadata.receivedBlocks}/{metadata.totalBlocks} components
                </span>
                {progress && (
                  <span className="text-slate-400 ml-2">({progress})</span>
                )}
              </div>
            </div>

            <div className="text-right text-xs text-slate-400 space-y-1">
              <div>Elapsed: {formatTime(metadata.elapsed_time)}</div>
              {metadata.estimated_remaining > 0 && (
                <div>ETA: ~{formatTime(metadata.estimated_remaining)}</div>
              )}
            </div>
          </div>

          {lastHeartbeat && (
            <div className="mt-2 text-xs text-slate-500">
              💓 {lastHeartbeat}
            </div>
          )}
        </div>
      )}

      {/* Two-column layout */}
      <div className="w-full lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12 items-start">
        {/* Sidebar navigation */}
        <aside className="hidden lg:block sticky top-24 self-start h-fit px-6">
          <SidebarNav items={navItems} />
        </aside>

        {/* Main content */}
        <div className="px-6 lg:px-0">
          <div className="max-w-4xl mx-auto space-y-16 pb-32">
            {blocks.map((block, idx) => {
              if (!isRegistryKey(block.type)) return null;
              const Comp = registry[block.type as keyof typeof registry];
              const blockId = getBlockId(block, idx);

              // Fade-in animation for recent blocks
              const isRecent = idx >= blocks.length - 2 && !isComplete;

              return (
                <div
                  key={`${block.type}-${idx}`}
                  id={blockId}
                  className={cn(
                    "scroll-mt-24",
                    isRecent && "animate-in fade-in slide-in-from-bottom-4 duration-700"
                  )}
                >
                  <Comp block={block} pageId="" />
                </div>
              );
            })}

            {/* Loading placeholder at bottom if not complete */}
            {!isComplete && (
              <div className="space-y-4 py-8">
                <div className="flex items-center gap-3 text-slate-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-500"></div>
                  <span className="text-sm">Generating next component...</span>
                </div>

                {/* Skeleton loader */}
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-700/50 rounded"></div>
                  <div className="h-4 bg-slate-700/50 rounded w-5/6"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions (extracted from SchemaRenderer)
function isRegistryKey(x: string): x is keyof typeof registry {
  return x in registry;
}

function generateSlug(text: string): string {
  return text.toString().toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
}

function getBlockId(block: Block, index: number): string {
  if (block.id) return block.id;
  if (block.title) return `section-${generateSlug(block.title)}-${index}`;
  return `block-${block.type}-${index}`;
}

function extractNavItems(blocks: Block[]): Array<{ id: string; title: string; type: string }> {
  return blocks
    .filter(block => block.title || (block.content as any)?.title)
    .map((block, index) => ({
      id: getBlockId(block, index),
      title: block.title || (block.content as any)?.title || `Section ${index + 1}`,
      type: block.type
    }));
}
