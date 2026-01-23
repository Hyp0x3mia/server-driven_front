import React, { useState, useMemo } from 'react';
import { Play, RefreshCw, Code2, Sliders } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CodePlaygroundProps {
  type: 'tokenizer' | 'hyperparameter';
  initialText?: string;
  codeTemplate?: string;
}

// ============ Token 颜色配置 ============
const TOKEN_COLORS = [
  'bg-blue-500/20 border-blue-500/40 text-blue-300',
  'bg-green-500/20 border-green-500/40 text-green-300',
  'bg-purple-500/20 border-purple-500/40 text-purple-300',
  'bg-orange-500/20 border-orange-500/40 text-orange-300',
];

// ============ 模式 A: Token 分词游乐场 ============
function TokenizerMode({ initialText = "Artificial Intelligence is fascinating." }: { initialText?: string }) {
  const [text, setText] = useState(initialText);

  // 简单的 Tokenization 逻辑（模拟 NLP 分词）
  const tokens = useMemo(() => {
    // 使用正则拆分：按空格、标点符号分割
    const words = text.split(/([\s,.!?;:()]+)/).filter(t => t.trim().length > 0);

    return words.map((word, index) => {
      // 生成模拟 ID（简单的 hash）
      const hash = Math.abs(word.split('').reduce((acc, char) => {
        return ((acc << 5) - acc) + char.charCodeAt(0);
      }, 0));

      return {
        id: hash.toString(16).toUpperCase(), // 十六进制显示
        text: word,
        colorClass: TOKEN_COLORS[index % TOKEN_COLORS.length],
        isPunctuation: /^[\s,.!?;:()]+$/.test(word)
      };
    });
  }, [text]);

  return (
    <div className="space-y-4">
      {/* 输入区域 */}
      <div className="bg-[#0f172a] rounded-xl border border-slate-700/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Code2 size={16} className="text-emerald-400" />
            <span className="font-mono">输入文本</span>
          </div>
          <button
            onClick={() => setText(initialText)}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
          >
            <RefreshCw size={12} />
            重置
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入要分词的文本..."
          className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 text-sm font-mono text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none"
          rows={3}
        />
      </div>

      {/* Token 输出区域 */}
      <div className="bg-[#0f172a] rounded-xl border border-slate-700/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="font-mono">Token 序列</span>
            <span className="text-xs text-slate-600">({tokens.length} tokens)</span>
          </div>
          <button
            onClick={() => {
              const tokenText = tokens.map(t => t.text).join(' ');
              navigator.clipboard.writeText(JSON.stringify(tokens, null, 2));
            }}
            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            复制 JSON
          </button>
        </div>

        {/* Token 流式布局 */}
        <div className="flex flex-wrap gap-2">
          {tokens.map((token, index) => (
            <div
              key={index}
              className={cn(
                "group relative px-3 py-2 rounded-lg border font-mono text-sm transition-all hover:scale-105 hover:shadow-lg",
                token.colorClass,
                token.isPunctuation && "opacity-50"
              )}
            >
              <div className="flex flex-col gap-1">
                <span className="font-semibold">{token.text}</span>
                <span className="text-[10px] opacity-70">ID: {token.id}</span>
              </div>

              {/* Hover tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-xs text-slate-300 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Token #{index}
              </div>
            </div>
          ))}
        </div>

        {/* 统计信息 */}
        <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-emerald-400">{tokens.length}</div>
            <div className="text-xs text-slate-500">Token 总数</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">
              {tokens.filter(t => !t.isPunctuation).length}
            </div>
            <div className="text-xs text-slate-500">有效词数</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">
              {Math.round(tokens.reduce((acc, t) => acc + t.text.length, 0) / tokens.length) || 0}
            </div>
            <div className="text-xs text-slate-500">平均长度</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ 模式 B: 超参数调优演示 ============
function HyperparameterMode({ codeTemplate }: { codeTemplate?: string }) {
  const [lr, setLr] = useState(0.01);
  const [momentum, setMomentum] = useState(0.5);

  // 生成模拟 Loss 曲线
  const lossCurve = useMemo(() => {
    const points = [];
    const numPoints = 100;

    for (let i = 0; i < numPoints; i++) {
      const x = i / numPoints;
      // 基础指数衰减
      let baseLoss = Math.exp(-3 * x);

      // LR 影响：lr 越大，下降越快但波动越大
      const lrEffect = (lr / 0.1) * 0.3 * Math.sin(20 * x);

      // Momentum 影响：momentum 越大，曲线越平滑
      const noise = (1 - momentum) * 0.15 * Math.sin(30 * x) * Math.random();

      const loss = baseLoss + lrEffect + noise;
      points.push({ x, y: Math.max(0.05, Math.min(1, loss)) });
    }

    return points;
  }, [lr, momentum]);

  // 生成 SVG Path
  const pathData = useMemo(() => {
    if (lossCurve.length === 0) return '';

    const width = 100; // SVG viewBox width
    const height = 60; // SVG viewBox height

    const firstPoint = lossCurve[0];
    let path = `M ${firstPoint.x * width} ${(1 - firstPoint.y) * height}`;

    for (let i = 1; i < lossCurve.length; i++) {
      const point = lossCurve[i];
      path += ` L ${point.x * width} ${(1 - point.y) * height}`;
    }

    return path;
  }, [lossCurve]);

  // 动态代码生成
  const code = codeTemplate || `optimizer = torch.optim.SGD(
  model.parameters(),
  lr=${lr.toFixed(3)},          # Learning Rate
  momentum=${momentum.toFixed(1)}  # Momentum
)`;

  return (
    <div className="space-y-4">
      {/* 代码显示区域 */}
      <div className="bg-[#0f172a] rounded-xl border border-slate-700/50 p-4">
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
          <Code2 size={16} className="text-purple-400" />
          <span className="font-mono">PyTorch 优化器配置</span>
        </div>

        <pre className="bg-slate-900/50 rounded-lg p-4 text-sm font-mono overflow-x-auto">
          <code dangerouslySetInnerHTML={{
            __html: code
              .replace(`lr=${lr.toFixed(3)}`, `<span class="text-emerald-400 font-bold">lr=${lr.toFixed(3)}</span>`)
              .replace(`momentum=${momentum.toFixed(1)}`, `<span class="text-purple-400 font-bold">momentum=${momentum.toFixed(1)}</span>`)
          }} />
        </pre>
      </div>

      {/* 控制面板 + Loss 曲线 */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* 超参数滑块 */}
        <div className="bg-[#0f172a] rounded-xl border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
            <Sliders size={16} className="text-emerald-400" />
            <span className="font-mono">超参数调优</span>
          </div>

          {/* Learning Rate */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <label className="text-sm text-slate-300 font-mono">Learning Rate</label>
              <span className="text-sm text-emerald-400 font-mono">{lr.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min={0.001}
              max={0.1}
              step={0.001}
              value={lr}
              onChange={(e) => setLr(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between mt-1 text-xs text-slate-600">
              <span>0.001</span>
              <span>0.1</span>
            </div>
          </div>

          {/* Momentum */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-slate-300 font-mono">Momentum</label>
              <span className="text-sm text-purple-400 font-mono">{momentum.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={0.9}
              step={0.1}
              value={momentum}
              onChange={(e) => setMomentum(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between mt-1 text-xs text-slate-600">
              <span>0.0</span>
              <span>0.9</span>
            </div>
          </div>
        </div>

        {/* Loss 曲线可视化 */}
        <div className="bg-[#0f172a] rounded-xl border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
            <span className="font-mono">Loss Curve</span>
            <span className="text-xs text-slate-600">(模拟)</span>
          </div>

          <div className="relative bg-slate-900/50 rounded-lg p-4">
            <svg viewBox="0 0 100 60" className="w-full h-auto">
              {/* 网格线 */}
              {[0, 0.25, 0.5, 0.75, 1].map((y, i) => (
                <line
                  key={i}
                  x1="0"
                  y1={y * 60}
                  x2="100"
                  y2={y * 60}
                  stroke="#334155"
                  strokeWidth="0.3"
                  strokeDasharray="2,2"
                />
              ))}

              {/* Loss 曲线 */}
              <path
                d={pathData}
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 渐变定义 */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>

              {/* 标注 */}
              <text
                x="5"
                y="8"
                fill="#64748b"
                fontSize="3"
                fontFamily="monospace"
              >
                Loss
              </text>
              <text
                x="85"
                y="58"
                fill="#64748b"
                fontSize="3"
                fontFamily="monospace"
              >
                Epochs →
              </text>
            </svg>

            {/* 图例 */}
            <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-gradient-to-r from-emerald-500 to-purple-500" />
                <span>训练损失</span>
              </div>
              <div>高波动 = LR 过大</div>
              <div>平滑 = Momentum 高</div>
            </div>
          </div>
        </div>
      </div>

      {/* 参数解释 */}
      <div className="bg-slate-900/30 rounded-lg p-3 text-xs text-slate-400 space-y-1">
        <div className="flex items-start gap-2">
          <span className="text-emerald-400 font-mono">LR</span>
          <span>控制每次参数更新的步长。值越大收敛越快，但可能不稳定。</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-purple-400 font-mono">Momentum</span>
          <span>利用历史梯度平滑更新路径，减少震荡，加速收敛。</span>
        </div>
      </div>
    </div>
  );
}

// ============ 主组件 ============
export function CodePlayground({ type, initialText, codeTemplate }: CodePlaygroundProps) {
  return (
    <div className="w-full">
      {/* 标题栏 */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Play size={18} className="text-emerald-400" />
            {type === 'tokenizer' ? 'Token 分词游乐场' : '超参数调优演示'}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {type === 'tokenizer'
              ? '探索 NLP 如何将文本拆分为可处理的 Token'
              : '实时观察超参数如何影响模型训练'}
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-mono">
          交互式
        </div>
      </div>

      {/* 内容区域 */}
      {type === 'tokenizer' ? (
        <TokenizerMode initialText={initialText} />
      ) : (
        <HyperparameterMode codeTemplate={codeTemplate} />
      )}
    </div>
  );
}
