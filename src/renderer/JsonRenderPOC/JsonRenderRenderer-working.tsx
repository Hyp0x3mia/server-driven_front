// src/renderer/JsonRenderPOC/JsonRenderRenderer-working.tsx
//
// 工作版本 - 使用手动fetch处理流式JSON

import { Renderer, defineRegistry, JSONUIProvider } from '@json-render/react';
import { catalog } from './catalog';
import { Flashcard } from '../../components/Flashcard';
import { CodePlayground } from '../../components/blocks/CodePlayground';
import { useState, useEffect, useCallback } from 'react';

// ============ Define Registry ============
export const { registry } = defineRegistry(catalog, {
  components: {
    Flashcard: ({ props }) => {
      const flashcardData = {
        type: 'flashcard',
        id: props.id || 'flashcard-1',
        front: {
          title: '问题',
          content: props.content?.front || 'No front content',
        },
        back: {
          title: '答案解析',
          content: props.content?.back || 'No back content',
        },
      };
      return <Flashcard data={flashcardData} />;
    },

    Cloze: ({ props, bindings }) => {
      const [answers, setAnswers] = useState<Record<string, string>>({});

      const parseContent = (text: string) => {
        const regex = /\{\{([^}]+)\}\}/g;
        const parts: any[] = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
          if (match.index > lastIndex) {
            parts.push({
              type: 'text',
              content: text.slice(lastIndex, match.index),
            });
          }

          const gapInfo = props.gaps?.find((g: any) => g.gap_id === match[1]);

          parts.push({
            type: 'input',
            gapId: match[1],
            hint: gapInfo?.hint || '',
            correctAnswer: gapInfo?.correct_answer || '',
          });

          lastIndex = regex.lastIndex;
        }

        if (lastIndex < text.length) {
          parts.push({
            type: 'text',
            content: text.slice(lastIndex),
          });
        }

        return parts;
      };

      const parts = parseContent(props.content || '');

      const handleSubmit = async () => {
        console.log('[json-render Cloze] Submitting answers:', answers);
        try {
          const result = await catalog.actions.verify_cloze_answer.handler({
            cloze_id: props.id,
            user_answers: answers,
            timestamp: new Date().toISOString(),
          });
          alert(`Score: ${result.overall_score}%`);
        } catch (error) {
          console.error('[json-render Cloze] Verification error:', error);
        }
      };

      return (
        <div className="w-full max-w-4xl mx-auto my-8 p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="text-xl leading-relaxed text-center text-slate-200">
            {parts.map((part, index) => {
              if (part.type === 'text') {
                return (
                  <span key={`text-${index}`} className="inline">
                    {part.content}
                  </span>
                );
              }

              return (
                <span key={`cloze-${index}`} className="inline mx-1 align-middle">
                  <input
                    type="text"
                    value={answers[part.gapId] || ''}
                    onChange={(e) =>
                      setAnswers({ ...answers, [part.gapId]: e.target.value })
                    }
                    placeholder={part.hint || 'Enter answer'}
                    className="px-3 py-1 rounded-lg border border-slate-600 bg-slate-700 text-slate-200 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 w-32"
                  />
                </span>
              );
            })}
          </div>

          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length === 0}
              className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              Submit Answers
            </button>
          </div>
        </div>
      );
    },

    CodePlayground: ({ props, bindings }) => {
      const [code, setCode] = useState(props.content?.code_template || '');
      const [evaluationResults, setEvaluationResults] = useState<any[]>([]);

      const handleEvaluate = async () => {
        console.log('[json-render CodePlayground] Evaluating code:', code);

        try {
          const result = await catalog.actions.submit_code_evaluation.handler({
            playground_id: props.id,
            user_code: code,
            test_cases: props.test_cases || [],
          });

          console.log('[json-render CodePlayground] Evaluation result:', result);
          setEvaluationResults(result.results || []);
        } catch (error) {
          console.error('[json-render CodePlayground] Evaluation error:', error);
          setEvaluationResults([
            {
              test_case_id: 'error',
              passed: false,
              actual_output: String(error),
              error_message: 'Evaluation failed',
            },
          ]);
        }
      };

      return (
        <div className="json-render-code-playground-wrapper">
          <CodePlayground
            type={props.content?.mode || 'tokenizer'}
            initialText={code}
            codeTemplate={props.content?.code_template}
          />

          <button
            onClick={handleEvaluate}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Evaluate Code
          </button>

          {evaluationResults.length > 0 && (
            <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <h3 className="text-sm font-semibold text-slate-300 mb-2">
                Evaluation Results
              </h3>
              {evaluationResults.map((result, index) => (
                <div
                  key={index}
                  className={`text-xs ${result.passed ? 'text-green-400' : 'text-red-400'}`}
                >
                  {result.test_case_id}: {result.passed ? '✅ Pass' : '❌ Fail'}
                  {result.error_message && ` - ${result.error_message}`}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    },
  },
  actions: {},
});

// ============ Main JsonRenderRenderer Component ============

interface JsonRenderRendererProps {
  schema?: any;
  componentType?: 'flashcard' | 'cloze' | 'codeplayground' | 'all';
  onStreamUpdate?: (update: any) => void;
  onAction?: (action: any, result: any) => void;
  className?: string;
}

export function JsonRenderRenderer({
  schema,
  componentType = 'all',
  onStreamUpdate,
  onAction,
  className,
}: JsonRenderRendererProps) {
  const [tree, setTree] = useState<any>(null);
  const [streamStatus, setStreamStatus] = useState<'idle' | 'streaming' | 'complete' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState({ charsReceived: 0, chunksReceived: 0 });

  const streamComponentType = componentType ||
    (schema?.components?.[0]?.type === 'Flashcard' ? 'flashcard' :
     schema?.components?.[0]?.type === 'Cloze' ? 'cloze' :
     schema?.components?.[0]?.type === 'CodePlayground' ? 'codeplayground' : 'all');

  const startStreaming = useCallback(async () => {
    console.log('[JsonRenderRenderer] Starting streaming for', streamComponentType);
    setStreamStatus('streaming');
    setError(null);
    setDebugInfo({ charsReceived: 0, chunksReceived: 0 });
    setTree(null);

    try {
      const response = await fetch(`/api/generate/json-render-stream?component_type=${streamComponentType}`);
      console.log('[JsonRenderRenderer] Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let sseBuffer = ''; // SSE data buffer
      let jsonBuffer = ''; // Accumulated JSON string

      if (!reader) {
        throw new Error('No reader available');
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log('[JsonRenderRenderer] Streaming complete, parsing final JSON...');
          break;
        }

        // Decode chunk
        const chunk = decoder.decode(value, { stream: true });
        sseBuffer += chunk;

        // Parse SSE format: "data: X\n\n"
        const lines = sseBuffer.split('\n\n');
        sseBuffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const char = line.slice(6); // Remove "data: " prefix
            jsonBuffer += char; // Accumulate JSON characters

            setDebugInfo(prev => ({
              charsReceived: prev.charsReceived + 1,
              chunksReceived: prev.chunksReceived + 1
            }));
          }
        }
      }

      // After streaming complete, parse the accumulated JSON
      console.log('[JsonRenderRenderer] Parsing JSON from', jsonBuffer.length, 'characters');

      try {
        const parsed = JSON.parse(jsonBuffer);
        console.log('[JsonRenderRenderer] ✅ Successfully parsed JSON spec:', parsed);
        setTree(parsed);
        setStreamStatus('complete');
      } catch (parseError) {
        console.error('[JsonRenderRenderer] ❌ JSON parse error:', parseError);
        console.error('[JsonRenderRenderer] JSON buffer (first 200 chars):', jsonBuffer.slice(0, 200));
        console.error('[JsonRenderRenderer] JSON buffer (last 200 chars):', jsonBuffer.slice(-200));
        setError(`Failed to parse JSON: ${parseError}`);
        setStreamStatus('error');
      }

    } catch (err) {
      console.error('[JsonRenderRenderer] Streaming error:', err);
      setError(String(err));
      setStreamStatus('error');
    }
  }, [streamComponentType]);

  // Auto-start streaming on mount
  useEffect(() => {
    startStreaming();
  }, [startStreaming]);

  if (error) {
    return (
      <div className="p-6 bg-red-900/50 border border-red-500 rounded-xl">
        <h2 className="text-xl font-bold text-red-300 mb-2">json-render Streaming Error</h2>
        <p className="text-red-200">{error}</p>
        <p className="text-red-300 text-sm mt-2">
          Make sure the backend is running on http://localhost:8000
        </p>
      </div>
    );
  }

  return (
    <div className={`json-render-wrapper ${className || ''}`}>
      {/* Streaming status indicator */}
      {streamStatus === 'streaming' && (
        <div className="sticky top-0 z-50 p-3 mb-4 bg-amber-900/50 border border-amber-500/50 rounded-lg flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
          <span className="text-sm text-amber-200">
            ⚡ json-render streaming active (with jitter simulation)...
            <span className="ml-2 text-xs">({debugInfo.charsReceived} chars received)</span>
          </span>
        </div>
      )}

      {/* THE ACTUAL JSON-RENDER RENDERER */}
      {tree && (
        <JSONUIProvider>
          <Renderer spec={tree} registry={registry} />
        </JSONUIProvider>
      )}

      {!tree && streamStatus !== 'error' && (
        <div className="p-8 text-center text-slate-500">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-4"></div>
          <p>Waiting for json-render spec...</p>
        </div>
      )}

      {/* Debug info */}
      {import.meta.env.DEV && (
        <div className="mt-8 p-4 bg-slate-900/50 rounded-lg border border-slate-800 text-xs text-slate-500 font-mono">
          <div className="font-semibold text-slate-400 mb-2">
            json-render Streaming Debug
          </div>
          <div>Stream Status: {streamStatus}</div>
          <div>Component Type: {streamComponentType}</div>
          <div>Chars Received: {debugInfo.charsReceived}</div>
          <div>Chunks Received: {debugInfo.chunksReceived}</div>
          {tree && (
            <>
              <div>Root Element: {tree.root}</div>
              <div>Total Elements: {Object.keys(tree.elements || {}).length}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
