import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { FlashcardContent } from "@/types/interactive-content";

interface FlashcardProps {
  data: FlashcardContent;
  className?: string;
}

export function Flashcard({ data, className }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const frontData = data.front;
  const backData = data.back;

  // 通用的卡片样式类 - 注意 pb-20 防止内容被底部按钮遮挡
  const cardBaseClass = "absolute inset-0 backface-hidden rounded-2xl border shadow-xl flex flex-col items-center justify-center p-8 pb-20 text-center overflow-hidden transition-colors duration-300";

  return (
    // 1. 外层容器：增加 my-20 拉开与上下组件的距离
    <div className={cn("relative w-full max-w-2xl mx-auto h-96 my-20", className)}>
      <motion.div
        className="relative w-full h-full transition-all duration-500 transform-style-3d cursor-pointer"
        initial={false}
        animate={{ rotateX: isFlipped ? 180 : 0 }}
        onClick={() => setIsFlipped(!isFlipped)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* ============ 正面 (Front) ============ */}
        <div
          className={`${cardBaseClass} bg-white border-gray-200 hover:border-blue-300`}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* 顶部标签 */}
          <div className="absolute top-6">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest rounded-full">
              {frontData.title || "Question"}
            </span>
          </div>

          {/* 核心内容区 */}
          <div className="prose prose-lg prose-slate max-w-none select-none flex-grow flex items-center justify-center">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({node, ...props}) => <p className="mb-2" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props} />,
                ul: ({node, ...props}) => <ul className="text-left inline-block" {...props} />,
                ol: ({node, ...props}) => <ol className="text-left inline-block" {...props} />,
              }}
            >
              {frontData.content || "点击编辑内容"}
            </ReactMarkdown>
          </div>

          {/* 底部按钮 (胶囊样式) */}
          <div className="absolute bottom-6 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-400 text-sm font-medium rounded-full flex items-center gap-2 transition-colors border border-gray-100">
            <span>点击查看答案</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {/* ============ 反面 (Back) ============ */}
        <div
          className={`${cardBaseClass} bg-slate-900 border-slate-700 text-white`}
          style={{ backfaceVisibility: "hidden", transform: "rotateX(180deg)" }}
        >
          {/* 顶部标签 */}
          <div className="absolute top-6">
            <span className="px-3 py-1 bg-green-900/50 text-green-400 text-xs font-bold uppercase tracking-widest rounded-full border border-green-800">
              {backData.title || "Answer"}
            </span>
          </div>

          {/* 核心内容区 */}
          <div className="prose prose-lg prose-invert max-w-none flex-grow flex items-center justify-center overflow-y-auto">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({node, ...props}) => <p className="mb-2" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                code: ({node, ...props}) => <code className="bg-white/10 text-yellow-300 rounded px-1.5 py-0.5 text-sm" {...props} />,
                ul: ({node, ...props}) => <ul className="text-left inline-block" {...props} />,
                ol: ({node, ...props}) => <ol className="text-left inline-block" {...props} />,
              }}
            >
              {backData.content || "暂无答案"}
            </ReactMarkdown>
          </div>

          {/* 底部按钮 (反面) */}
          <div className="absolute bottom-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm font-medium rounded-full flex items-center gap-2 transition-colors border border-slate-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>点击返回问题</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
