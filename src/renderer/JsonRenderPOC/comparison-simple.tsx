// 简化版comparison页面 - 用于调试
import { useState } from 'react';

export function ComparisonPage() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toISOString();
    setLogs(prev => [...prev, `[${timestamp}] ${msg}`]);
    console.log(`[ComparisonPage] ${msg}`);
  };

  const testBackendConnection = async () => {
    addLog('开始测试后端连接...');
    try {
      const response = await fetch('/api/json-render/test-specs');
      const data = await response.json();
      addLog(`✅ 后端连接成功! 收到: ${JSON.stringify(Object.keys(data))}`);
    } catch (error) {
      addLog(`❌ 后端连接失败: ${error}`);
    }
  };

  const testStreaming = async () => {
    addLog('开始测试流式端点...');
    try {
      const response = await fetch('/api/generate/json-render-stream?component_type=cloze');
      addLog(`✅ 流式端点响应! Status: ${response.status}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        addLog('开始读取流...');
        let chunkCount = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            addLog(`✅ 流读取完成! 总共 ${chunkCount} 个chunks`);
            break;
          }
          chunkCount++;
          if (chunkCount % 50 === 0) {
            addLog(`读取进度: ${chunkCount} chunks`);
          }
        }
      }
    } catch (error) {
      addLog(`❌ 流式测试失败: ${error}`);
    }
  };

  return (
    <div style={{ padding: '20px', background: '#0f172a', color: '#e2e8f0', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        json-render POC 调试页面
      </h1>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={testBackendConnection}
          style={{
            padding: '10px 20px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          测试后端连接
        </button>

        <button
          onClick={testStreaming}
          style={{
            padding: '10px 20px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          测试流式端点
        </button>

        <button
          onClick={() => setLogs([])}
          style={{
            padding: '10px 20px',
            background: '#64748b',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          清空日志
        </button>
      </div>

      <div style={{
        background: '#1e293b',
        padding: '15px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        maxHeight: '400px',
        overflow: 'auto'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#94a3b8' }}>
          日志输出:
        </h3>
        {logs.length === 0 ? (
          <p style={{ color: '#64748b' }}>暂无日志</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{ marginBottom: '5px', color: '#cbd5e1' }}>
              {log}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#1e293b', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#94a3b8' }}>
          调试信息:
        </h3>
        <p style={{ color: '#cbd5e1' }}>如果看到这个页面，说明React路由正常工作。</p>
        <p style={{ color: '#cbd5e1' }}>点击上面的按钮来测试后端连接和流式端点。</p>
      </div>
    </div>
  );
}
