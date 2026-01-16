import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from "@/lib/utils";
import type { FlashcardContent } from "@/types/interactive-content";

interface FlashcardProps {
  data: FlashcardContent | any;
  className?: string;
}

// Mac-style window dots component
const MacWindowDots = () => (
  <div className="flex gap-1.5 mb-3">
    <div className="w-2.5 h-2.5 rounded-full bg-red-400 hover:bg-red-500 transition-colors" />
    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors" />
    <div className="w-2.5 h-2.5 rounded-full bg-green-400 hover:bg-green-500 transition-colors" />
  </div>
);

export function Flashcard({ data, className }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!data || !data.front || !data.back) {
    return (
      <div className="p-8 bg-red-100 border-2 border-red-500 rounded-xl">
        <h2 className="text-xl font-bold text-red-700 mb-2">Flashcard 数据错误</h2>
      </div>
    );
  }

  const frontData = data.front;
  const backData = data.back;

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <motion.div
        className="relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-300"
        whileHover={{ y: -8, boxShadow: "0 20px 40px rgb(0,0,0,0.2)" }}
        style={{ minHeight: '480px' }}
      >
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            // 正面
            <motion.div
              key="front"
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 90 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <div className="h-full bg-gradient-to-br from-white to-gray-50 border border-gray-100/80 ring-1 ring-black/5 rounded-3xl overflow-hidden">
                {/* Badge */}
                <div className="text-center pt-8 pb-6">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 text-xs font-bold uppercase tracking-[0.2em] rounded-full border border-blue-100/50 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    {frontData.title || "Question"}
                  </span>
                </div>

                {/* 内容区域 */}
                <div className="px-8 pb-24">
                  <div className="text-center max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({node, ...props}) => <p className="mb-3 text-gray-700 leading-relaxed" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-gray-900 text-center" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 text-gray-900 text-center" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-3 text-gray-900 text-center" {...props} />,
                        code: ({node, className, children, ...props }: any) => {
                          const inline = !className?.includes('language-');
                          if (!inline) {
                            const match = /language-(\w+)/.exec(className || '');
                            const language = match ? match[1] : 'text';
                            return (
                              <div className="my-4">
                                {/* Mac-style window header */}
                                <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-t-xl px-4 py-2.5 border-b border-gray-200">
                                  <div className="flex items-center justify-between">
                                    <MacWindowDots />
                                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{language}</span>
                                    <div className="w-16" />
                                  </div>
                                </div>
                                {/* Code block */}
                                <div className="bg-slate-50 rounded-b-xl border border-t-0 border-gray-200 overflow-hidden">
                                  <SyntaxHighlighter
                                    language={language}
                                    style={oneLight}
                                    PreTag="div"
                                    className="!bg-transparent !p-4 !m-0 text-sm"
                                    customStyle={{
                                      fontSize: '0.875rem',
                                      lineHeight: '1.714',
                                      background: 'transparent',
                                      padding: '1rem',
                                      margin: '0'
                                    }}
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                </div>
                              </div>
                            );
                          }
                          return (
                            <code className="bg-gradient-to-br from-slate-100 to-slate-50 text-slate-700 px-2 py-1 rounded-lg text-sm font-mono border border-slate-200 shadow-sm" {...props}>
                              {children}
                            </code>
                          );
                        },
                        pre: ({node, children }: any) => <div>{children}</div>,
                        ul: ({node, ...props}) => <ul className="text-left inline-block space-y-1.5" {...props} />,
                        ol: ({node, ...props}) => <ol className="text-left inline-block space-y-1.5" {...props} />,
                      }}
                    >
                      {frontData.content || "点击编辑内容"}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* 底部按钮 */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent border-t border-gray-100">
                  <motion.button
                    onClick={() => setIsFlipped(true)}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>查看答案</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : (
            // 反面
            <motion.div
              key="back"
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -90 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <div className="h-full bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-700/50 ring-1 ring-white/10 rounded-3xl overflow-hidden">
                {/* Badge */}
                <div className="text-center pt-8 pb-6">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-900/40 to-green-900/40 text-emerald-400 text-xs font-bold uppercase tracking-[0.2em] rounded-full border border-emerald-800/50 shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {backData.title || "Answer"}
                  </span>
                </div>

                {/* 内容区域 */}
                <div className="px-8 pb-24">
                  <div className="text-center max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({node, ...props}) => <p className="mb-3 text-gray-300 leading-relaxed" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-white text-center" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 text-white text-center" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-3 text-white text-center" {...props} />,
                        code: ({node, className, children, ...props }: any) => {
                          const inline = !className?.includes('language-');
                          if (!inline) {
                            const match = /language-(\w+)/.exec(className || '');
                            const language = match ? match[1] : 'text';
                            return (
                              <div className="my-4">
                                {/* Mac-style window header */}
                                <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-t-xl px-4 py-2.5 border-b border-slate-600">
                                  <div className="flex items-center justify-between">
                                    <MacWindowDots />
                                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{language}</span>
                                    <div className="w-16" />
                                  </div>
                                </div>
                                {/* Code block */}
                                <div className="bg-slate-950/50 rounded-b-xl border border-t-0 border-slate-700 overflow-hidden">
                                  <SyntaxHighlighter
                                    language={language}
                                    style={oneDark}
                                    PreTag="div"
                                    className="!bg-transparent !p-4 !m-0 text-sm"
                                    customStyle={{
                                      fontSize: '0.875rem',
                                      lineHeight: '1.714',
                                      background: 'transparent',
                                      padding: '1rem',
                                      margin: '0'
                                    }}
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                </div>
                              </div>
                            );
                          }
                          return (
                            <code className="bg-gradient-to-br from-white/10 to-white/5 text-amber-300 px-2 py-1 rounded-lg text-sm font-mono border border-white/10 shadow-lg" {...props}>
                              {children}
                            </code>
                          );
                        },
                        pre: ({node, children }: any) => <div>{children}</div>,
                        ul: ({node, ...props}) => <ul className="text-left inline-block space-y-1.5" {...props} />,
                        ol: ({node, ...props}) => <ol className="text-left inline-block space-y-1.5" {...props} />,
                      }}
                    >
                      {backData.content || "暂无答案"}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* 底部按钮 */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent border-t border-slate-700/50">
                  <motion.button
                    onClick={() => setIsFlipped(false)}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-slate-200 font-medium transition-all duration-200 shadow-lg hover:shadow-xl border border-slate-500/50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    <span>返回问题</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
