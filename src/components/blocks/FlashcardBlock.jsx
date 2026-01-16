import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

export default function FlashcardBlock(props) {
  // 1. 尝试多种方式获取 front/back，防止父组件传参格式不同
  // 可能是直接解构 {...block}，也可能是 data={block}
  const frontData = props.front || props.data?.front || props.block?.front;
  const backData = props.back || props.data?.back || props.block?.back;

  const [isFlipped, setIsFlipped] = useState(false);

  // 2. 如果完全拿不到数据，显示红色的调试面板
  if (!frontData) {
    return (
      <div className="my-12 p-8 bg-red-100 border-2 border-red-500 rounded-xl">
        <h2 className="text-2xl font-bold text-red-700 mb-4">🔴 FlashcardBlock 调试面板</h2>
        <p className="text-red-600 mb-4">组件未接收到 front 数据！</p>

        <div className="bg-white p-4 rounded mb-4">
          <h3 className="font-bold mb-2">接收到的所有 Props：</h3>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(props, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-4 rounded">
          <h3 className="font-bold mb-2">尝试解析的数据：</h3>
          <ul className="list-disc list-inside text-sm">
            <li>props.front: {props.front ? '✅ 存在' : '❌ 不存在'}</li>
            <li>props.data?.front: {props.data?.front ? '✅ 存在' : '❌ 不存在'}</li>
            <li>props.block?.front: {props.block?.front ? '✅ 存在' : '❌ 不存在'}</li>
          </ul>
        </div>
      </div>
    );
  }

  // 3. 正常渲染尝试
  return (
    <div className="group h-[400px] w-full perspective-1000 my-12 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
      <motion.div
        className="relative h-full w-full transition-all duration-500 transform-style-3d"
        animate={{ rotateX: isFlipped ? 180 : 0 }}
      >
        {/* ============ 正面 ============ */}
        <div className="absolute inset-0 h-full w-full backface-hidden rounded-xl bg-white shadow-xl p-8 flex flex-col justify-center items-center text-center border-2 border-gray-200">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
            {frontData?.title || "Question"}
          </div>
          <div className="prose prose-lg max-w-none">
            {frontData?.content ? <ReactMarkdown>{frontData.content}</ReactMarkdown> : "No Content"}
          </div>
        </div>

        {/* ============ 反面 ============ */}
        <div
          className="absolute inset-0 h-full w-full backface-hidden rounded-xl bg-slate-900 text-white shadow-xl p-8 flex flex-col justify-center items-center text-center"
          style={{ transform: "rotateX(180deg)" }}
        >
          <div className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-4">
            {backData?.title || "Answer"}
          </div>
          <div className="prose prose-invert prose-lg">
            {backData?.content ? <ReactMarkdown>{backData.content}</ReactMarkdown> : "No Content"}
          </div>
        </div>
      </motion.div>

      {/* 在组件下方显示 Raw Data 用于核对 */}
      <details className="mt-4 text-xs text-gray-400">
        <summary>点击查看接收到的原始数据 (Debug)</summary>
        <pre className="p-2 bg-gray-100 mt-2 rounded">
          {JSON.stringify({ front: frontData, back: backData }, null, 2)}
        </pre>
      </details>
    </div>
  );
}
