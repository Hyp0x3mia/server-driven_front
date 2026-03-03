// src/renderer/JsonRenderPOC/comparison-working.tsx
//
// 工作版本的comparison页面 - 使用手动流处理

import { useState } from 'react';
import { JsonRenderRenderer } from './JsonRenderRenderer-working';

type ComponentType = 'flashcard' | 'cloze' | 'codeplayground' | 'all';

export function ComparisonPage() {
  const [selectedComponent, setSelectedComponent] = useState<ComponentType>('cloze');

  const componentDescriptions: Record<ComponentType, string> = {
    flashcard: 'Flashcard - Test flip state preservation',
    cloze: 'Cloze (Fill-in-the-blank) - Test input preservation during streaming',
    codeplayground: 'CodePlayground - Test deeply nested JSON with test cases',
    all: 'All Components - Full integration test',
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                json-render Streaming Test ✅
              </h1>
              <p className="text-sm text-slate-400">
                工作版本 - 使用手动fetch处理流式JSON
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
        {/* Test scenarios guide */}
        <div className="mb-8 p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
          <h2 className="text-lg font-semibold text-white mb-4">🧪 Test Scenarios</h2>
          <div className="space-y-3 text-sm text-slate-300">
            <div>
              <strong className="text-emerald-400">1. State Preservation Test (Critical!)</strong>
              <p className="text-slate-400 mt-1">
                Start typing answers in the <strong>Cloze</strong> component while it's still streaming in.
                Check if your input is preserved when the stream completes.
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
              <strong className="text-amber-400">3. Jitter Resilience Test</strong>
              <p className="text-slate-400 mt-1">
                Watch the streaming indicator - the backend intentionally adds delays at nested structures.
                The streaming status will show real-time character count.
              </p>
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
              Manual fetch streaming
            </span>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 min-h-[600px]">
            <JsonRenderRenderer componentType={selectedComponent} />
          </div>

          {/* json-render info */}
          <div className="p-4 bg-slate-800/50 rounded-lg text-xs text-slate-400 space-y-1">
            <div>✅ Character-by-character streaming from <code className="text-emerald-400">/api/generate/json-render-stream</code></div>
            <div>✅ Jitter simulation: 30ms base delay, 5% burst pauses, nested structure delays</div>
            <div>✅ Zod runtime validation for component props</div>
            <div>✅ Real-time character count in streaming indicator</div>
            <div>⚠️ State preservation: Test by interacting while component streams in</div>
          </div>
        </div>

        {/* Component description */}
        <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
          <p className="text-sm text-blue-200">
            <strong>Current Test:</strong> {componentDescriptions[selectedComponent]}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>json-render POC - Manual streaming implementation (working version)</p>
          <p className="mt-1">
            <a
              href="https://github.com/vercel-labs/json-render"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300"
            >
              json-render on GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
