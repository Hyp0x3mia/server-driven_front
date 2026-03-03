// src/renderer/JsonRenderPOC/comparison.tsx
//
// Side-by-side comparison page for json-render POC
// Focus: Testing json-render streaming with jitter simulation

import { useState, useCallback, useMemo } from 'react';
import { JsonRenderRenderer } from './JsonRenderRenderer';

type ComponentType = 'flashcard' | 'cloze' | 'codeplayground' | 'all';

interface ComparisonMetrics {
  renderTime: number;
  validationTime: number;
  errorCount: number;
  renderCount: number;
}

export function ComparisonPage() {
  console.log('[ComparisonPage] Component mounted');

  const [selectedComponent, setSelectedComponent] = useState<ComponentType>('cloze');
  const [isStreaming, setIsStreaming] = useState(false);

  const [metrics, setMetrics] = useState<ComparisonMetrics>({
    renderTime: 0,
    validationTime: 0,
    errorCount: 0,
    renderCount: 0,
  });

  const componentDescriptions: Record<ComponentType, string> = {
    flashcard: 'Flashcard - Test flip state preservation',
    cloze: 'Cloze (Fill-in-the-blank) - Test input preservation during streaming',
    codeplayground: 'CodePlayground - Test deeply nested JSON with test cases',
    all: 'All Components - Full integration test',
  };

  const handleAction = useCallback((action: any, result: any) => {
    console.log('[Comparison] Action triggered:', action, 'Result:', result);

    // Update metrics when actions complete
    setMetrics(prev => ({
      ...prev,
      renderCount: prev.renderCount + 1,
    }));
  }, []);

  const handleStreamingChange = useCallback((streaming: boolean) => {
    setIsStreaming(streaming);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                json-render Streaming Test
              </h1>
              <p className="text-sm text-slate-400">
                Testing character-by-character streaming with jitter simulation
              </p>
            </div>

            {/* Component selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-400">Test Component:</label>
              <select
                value={selectedComponent}
                onChange={(e) => setSelectedComponent(e.target.value as ComponentType)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="flashcard">Flashcard</option>
                <option value="cloze">Cloze (Fill-in-the-blank)</option>
                <option value="codeplayground">Code Playground</option>
                <option value="all">All Components</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Metrics panel */}
        <div className="mb-8 p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
          <h2 className="text-lg font-semibold text-white mb-4">Performance Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-slate-400">Actions Triggered</div>
              <div className="text-2xl font-bold text-emerald-400">{metrics.renderCount}</div>
            </div>
            <div>
              <div className="text-slate-400">Streaming Status</div>
              <div className={`text-2xl font-bold ${isStreaming ? 'text-amber-400 animate-pulse' : 'text-green-400'}`}>
                {isStreaming ? 'Active' : 'Idle'}
              </div>
            </div>
            <div>
              <div className="text-slate-400">React Version</div>
              <div className="text-2xl font-bold text-blue-400">18</div>
            </div>
            <div>
              <div className="text-slate-400">Test Component</div>
              <div className="text-lg font-bold text-purple-400">{selectedComponent}</div>
            </div>
          </div>
        </div>

        {/* json-render POC */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              json-render with Jitter Simulation
            </h2>
            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full">
              Streaming from backend
            </span>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 min-h-[600px]">
            <JsonRenderRenderer
              componentType={selectedComponent}
              onAction={handleAction}
            />
          </div>

          {/* json-render info */}
          <div className="p-4 bg-slate-800/50 rounded-lg text-xs text-slate-400 space-y-1">
            <div>✅ Character-by-character streaming from <code className="text-emerald-400">/api/generate/json-render-stream</code></div>
            <div>✅ Jitter simulation: 30ms base delay, 5% burst pauses, nested structure delays</div>
            <div>✅ Zod runtime validation for component props</div>
            <div>⚠️ State preservation: Test by interacting while component streams in</div>
            <div>⚠️ React 18 with --legacy-peer-deps (may affect concurrent features)</div>
          </div>
        </div>

        {/* Test scenarios guide */}
        <div className="mt-8 p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
          <h2 className="text-lg font-semibold text-white mb-4">🧪 Test Scenarios</h2>
          <div className="space-y-3 text-sm text-slate-300">
            <div>
              <strong className="text-emerald-400">1. State Preservation Test (Critical!)</strong>
              <p className="text-slate-400 mt-1">
                Start typing answers in the <strong>Cloze</strong> component while it's still streaming in.
                Check if your input is preserved when the stream completes. This tests json-render's reconciliation!
              </p>
            </div>
            <div>
              <strong className="text-emerald-400">2. Deep Nesting Test</strong>
              <p className="text-slate-400 mt-1">
                Select <strong>Code Playground</strong> to test deeply nested JSON (4+ levels).
                Watch for parser errors or UI freezes during nested structure pauses.
              </p>
            </div>
            <div>
              <strong className="text-emerald-400">3. Action System Test</strong>
              <p className="text-slate-400 mt-1">
                Submit answers in Cloze or evaluate code in Code Playground.
                Verify backend actions work correctly with the mock handlers.
              </p>
            </div>
            <div>
              <strong className="text-amber-400">4. Jitter Resilience Test</strong>
              <p className="text-slate-400 mt-1">
                Watch the streaming indicator - the backend intentionally adds delays at nested structures.
                Check if json-render's character-by-character parser handles these gracefully.
              </p>
            </div>
          </div>
        </div>

        {/* Component description */}
        <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
          <p className="text-sm text-blue-200">
            <strong>Current Test:</strong> {componentDescriptions[selectedComponent]}
          </p>
        </div>

        {/* Evaluation matrix */}
        <div className="mt-8 p-6 bg-slate-900/50 border border-slate-800 rounded-xl overflow-x-auto">
          <h2 className="text-lg font-semibold text-white mb-4">📊 Evaluation Checklist</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Feature</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium">Test Result</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              <tr className="border-b border-slate-800">
                <td className="py-3 px-4">Streaming works</td>
                <td className="text-center py-3 px-4 text-yellow-400">⏳ Testing</td>
                <td className="py-3 px-4 text-slate-500 text-xs">Check if streaming indicator appears</td>
              </tr>
              <tr className="border-b border-slate-800">
                <td className="py-3 px-4">State preserved during stream</td>
                <td className="text-center py-3 px-4 text-yellow-400">⏳ Testing</td>
                <td className="py-3 px-4 text-slate-500 text-xs">Type in Cloze gaps while streaming</td>
              </tr>
              <tr className="border-b border-slate-800">
                <td className="py-3 px-4">Deep nesting handled</td>
                <td className="text-center py-3 px-4 text-yellow-400">⏳ Testing</td>
                <td className="py-3 px-4 text-slate-500 text-xs">Try Code Playground component</td>
              </tr>
              <tr className="border-b border-slate-800">
                <td className="py-3 px-4">Actions work correctly</td>
                <td className="text-center py-3 px-4 text-yellow-400">⏳ Testing</td>
                <td className="py-3 px-4 text-slate-500 text-xs">Submit answers/evaluate code</td>
              </tr>
              <tr className="border-b border-slate-800">
                <td className="py-3 px-4">Jitter resilience</td>
                <td className="text-center py-3 px-4 text-yellow-400">⏳ Testing</td>
                <td className="py-3 px-4 text-slate-500 text-xs">Watch for parser errors during pauses</td>
              </tr>
              <tr>
                <td className="py-3 px-4">React 18 compatibility</td>
                <td className="text-center py-3 px-4 text-yellow-400">⏳ Testing</td>
                <td className="py-3 px-4 text-slate-500 text-xs">Using --legacy-peer-deps flag</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Backend endpoint info */}
        <div className="mt-8 p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
          <h2 className="text-lg font-semibold text-white mb-4">🔗 Backend Endpoint</h2>
          <div className="space-y-2 text-sm text-slate-400">
            <div>
              <strong className="text-emerald-400">Streaming Endpoint:</strong>
              <code className="ml-2 text-xs bg-slate-800 px-2 py-1 rounded">
                GET http://localhost:8000/api/generate/json-render-stream?component_type={selectedComponent}
              </code>
            </div>
            <div>
              <strong className="text-emerald-400">Test Specs Endpoint:</strong>
              <code className="ml-2 text-xs bg-slate-800 px-2 py-1 rounded">
                GET http://localhost:8000/api/json-render/test-specs
              </code>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Backend server must be running on port 8000 for streaming to work.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>json-render POC - Testing Vercel Labs' json-render for educational content platform</p>
          <p className="mt-1">
            <a
              href="https://github.com/vercel-labs/json-render"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300"
            >
              json-render on GitHub
            </a>
            {' • '}
            <a
              href="https://json-render.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300"
            >
              Live Demo
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
