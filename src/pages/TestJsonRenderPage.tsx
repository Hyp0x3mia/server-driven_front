// 最简单的json-render测试页面
import { useState, useEffect } from 'react';

export default function TestJsonRenderPage() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    console.log('[TestJsonRenderPage] Component mounted');
    setMessage('Component mounted successfully');

    // 测试fetch是否能到达后端
    fetch('/api/json-render/test-specs')
      .then(res => res.json())
      .then(data => {
        console.log('[TestJsonRenderPage] Backend response:', data);
        setMessage('Backend is reachable!');
      })
      .catch(err => {
        console.error('[TestJsonRenderPage] Fetch error:', err);
        setMessage('Backend error: ' + err.message);
      });
  }, []);

  return (
    <div style={{ padding: '20px', background: '#1e293b', color: 'white', minHeight: '100vh' }}>
      <h1>json-render 测试页面</h1>
      <p>状态: {message}</p>
      <p>如果你看到这个页面，说明路由配置正确。</p>
      <p>请检查浏览器Console的日志。</p>
    </div>
  );
}
