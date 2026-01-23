import React, { useState } from 'react';
import { Play, BarChart3, FileCheck, Download } from 'lucide-react';
import {
  runAllTests,
  simulateAgentWorkflow,
  benchmarkConversion,
  TestReportGenerator
} from '@/lib/test-automation';

export const TestRunner = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const [selectedTest, setSelectedTest] = useState<'all' | 'workflow' | 'performance'>('all');

  const appendOutput = (line: string) => {
    setOutput(prev => [...prev, line]);
  };

  const clearOutput = () => {
    setOutput([]);
  };

  const runTestSuite = async () => {
    setIsRunning(true);
    clearOutput();

    // 重写 console.log 来捕获输出
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      const line = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      appendOutput(line);
      originalLog(...args); // 同时也输出到控制台
    };

    try {
      switch (selectedTest) {
        case 'all':
          await runAllTests();
          break;
        case 'workflow':
          simulateAgentWorkflow();
          break;
        case 'performance':
          benchmarkConversion();
          break;
      }
      appendOutput('\n✅ 测试完成！');
    } catch (error) {
      appendOutput(`\n❌ 测试失败: ${error}`);
    } finally {
      setIsRunning(false);
      console.log = originalLog;
    }
  };

  const downloadReport = () => {
    const reportText = output.join('\n');
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-300 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-3">
            🧪 自动化测试套件
          </h1>
          <p className="text-slate-400">
            端到端测试、性能基准、Agent 模拟
          </p>
        </div>

        {/* Test Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            选择测试类型
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setSelectedTest('all')}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                selectedTest === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Play className="w-4 h-4 mr-2" />
              全部测试
            </button>
            <button
              onClick={() => setSelectedTest('workflow')}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                selectedTest === 'workflow'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Agent 工作流
            </button>
            <button
              onClick={() => setSelectedTest('performance')}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                selectedTest === 'performance'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Download className="w-4 h-4 mr-2" />
              性能基准
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={runTestSuite}
            disabled={isRunning}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg"
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
                运行中...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                运行测试
              </>
            )}
          </button>

          <button
            onClick={clearOutput}
            disabled={isRunning || output.length === 0}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 text-slate-300 rounded-lg"
          >
            清空输出
          </button>

          <button
            onClick={downloadReport}
            disabled={output.length === 0}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 text-slate-300 rounded-lg"
          >
            <Download className="w-4 h-4 mr-2" />
            下载报告
          </button>
        </div>

        {/* Output */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-300">
              测试输出
            </h3>
            {output.length > 0 && (
              <span className="text-xs text-slate-500">
                {output.length} 行
              </span>
            )}
          </div>

          <div className="h-96 overflow-y-auto">
            {output.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500">
                <FileCheck className="w-12 h-12 mb-3 opacity-50" />
                <p>点击上方按钮运行测试</p>
              </div>
            ) : (
              <pre className="text-xs text-slate-400 font-mono whitespace-pre-wrap">
                {output.join('\n')}
              </pre>
            )}
          </div>
        </div>

        {/* Test Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900/30 border border-slate-800 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-400 mb-2">
              全部测试
            </h4>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• Schema 转换测试</li>
              <li>• Agent 模拟测试</li>
              <li>• 性能基准测试</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-900/30 border border-slate-800 rounded-lg">
            <h4 className="text-sm font-semibold text-purple-400 mb-2">
              Agent 工作流
            </h4>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• 知识讲解 Agent</li>
              <li>• 代码练习 Agent</li>
              <li>• 测验生成 Agent</li>
              <li>• Schema 转换验证</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-900/30 border border-slate-800 rounded-lg">
            <h4 className="text-sm font-semibold text-green-400 mb-2">
              性能基准
            </h4>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• 单次转换耗时</li>
              <li>• 批量转换吞吐量</li>
              <li>• 性能评级</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
