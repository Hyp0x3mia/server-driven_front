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

  // 基础卡片样式：使用 Flex 布局管理垂直空间
  const cardBaseClass = "absolute inset-0 backface-hidden rounded-2xl shadow-xl border flex flex-col items-center p-8 transition-colors duration-300 overflow-hidden";

  return (
    // Layer 1: 占位容器 (移除 my-24，由父级 space-y-16 控制间距)
    <div className={cn("relative w-full max-w-2xl mx-auto h-96", className)}>
      {/* Layer 2: 动画层 (开启 GPU 加速) */}
      <motion.div
        className="relative w-full h-full transform-style-3d cursor-pointer"
        initial={false}
        animate={{ rotateX: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        onClick={() => setIsFlipped(!isFlipped)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{ willChange: "transform", transformStyle: "preserve-3d" }} // 🚀 关键：修复卡顿
      >
        {/* ============ 正面 (Front) ============ */}
        <div
          className={`${cardBaseClass} bg-white border-gray-200 hover:border-blue-300`}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* 1. 顶部：标题 (固定高度) */}
          <div className="flex-none mb-4">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest rounded-full">
              {frontData.title || "Question"}
            </span>
          </div>

          {/* 2. 中间：内容 (Flex Grow 自动占据剩余空间) */}
          <div className="flex-grow flex items-center justify-center w-full">
            <div className="prose prose-lg prose-slate max-w-none text-center select-none">
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
          </div>

          {/* 3. 底部：按钮 (固定底部) */}
          <div className="flex-none mt-auto pt-6">
            <div className="px-5 py-2 bg-gray-50 text-gray-400 text-sm font-medium rounded-full flex items-center gap-2 border border-gray-100 transition-colors group-hover:bg-blue-50 group-hover:text-blue-500">
              <span>点击查看答案</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>

        {/* ============ 反面 (Back) ============ */}
        <div
          className={`${cardBaseClass} bg-slate-900 border-slate-700 text-white`}
          style={{ backfaceVisibility: "hidden", transform: "rotateX(180deg)" }}
        >
          {/* 1. 顶部 */}
          <div className="flex-none mb-4">
            <span className="px-3 py-1 bg-green-900/50 text-green-400 text-xs font-bold uppercase tracking-widest rounded-full border border-green-800">
              {backData.title || "Answer"}
            </span>
          </div>

          {/* 2. 中间 (允许内容过多时滚动) */}
          <div className="flex-grow flex items-center justify-center w-full overflow-y-auto">
            <div className="prose prose-lg prose-invert max-w-none text-center">
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
          </div>

          {/* 3. 底部 */}
          <div className="flex-none mt-auto pt-6">
            <div className="px-5 py-2 bg-slate-800 text-slate-400 text-sm font-medium rounded-full flex items-center gap-2 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>点击返回问题</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
