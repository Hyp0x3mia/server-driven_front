import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from "@/lib/utils";
import type { FlashcardContent } from "@/types/interactive-content";

interface FlashcardProps {
  data: FlashcardContent | any;
  className?: string;
}

export function Flashcard({ data, className }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!data || !data.front || !data.back) {
    return (
      <div className="p-8 bg-red-900/50 border-2 border-red-500 rounded-xl">
        <h2 className="text-xl font-bold text-red-300 mb-2">Flashcard 数据错误</h2>
      </div>
    );
  }

  const frontData = data.front;
  const backData = data.back;

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <style>{`
        .flashcard-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .flashcard-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .flashcard-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .flashcard-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>

      <motion.div
        className="relative rounded-2xl overflow-hidden transition-all duration-300"
        whileHover={{ y: -6, boxShadow: "0 30px 60px -12px rgba(0,0,0,0.5)" }}
        style={{
          minHeight: '520px',
          maxHeight: '620px',
          boxShadow: "0 20px 40px -12px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)"
        }}
      >
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            // 正面 - 深色玻璃态卡片
            <motion.div
              key="front"
              initial={{ opacity: 0, rotateY: -10 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <div
                className="absolute w-full h-full flex flex-col rounded-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                {/* 顶部内容滚动区 */}
                <div className="flex-1 overflow-y-auto flashcard-scrollbar p-6">
                  {/* Badge */}
                  <div className="flex justify-center mb-6">
                    <span
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                      }}
                      className="px-4 py-2 text-white text-xs font-bold rounded-full uppercase tracking-wider"
                    >
                      {frontData.title || "问题"}
                    </span>
                  </div>

                  {/* 核心内容 */}
                  <div className="prose prose-invert prose-sm max-w-none mb-6 text-center">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({node, ...props}) => <p className="mb-4 text-slate-300 leading-relaxed" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-white" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 text-white" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-3 text-white" {...props} />,
                        code: ({node, className, children, ...props }: any) => {
                          const inline = !className?.includes('language-');
                          if (!inline) {
                            const match = /language-(\w+)/.exec(className || '');
                            const language = match ? match[1] : 'text';
                            return (
                              <div className="rounded-xl overflow-hidden my-4 text-left" style={{ border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(0, 0, 0, 0.3)' }}>
                                {/* Mac 窗口头 */}
                                <div className="h-8 flex items-center px-4 space-x-1.5" style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                  <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                                  <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                                  <span className="ml-auto text-xs font-medium text-slate-500 uppercase tracking-wider">{language}</span>
                                </div>
                                {/* 代码内容 */}
                                <div className="p-4 overflow-x-auto">
                                  <SyntaxHighlighter
                                    language={language}
                                    style={oneDark}
                                    PreTag="div"
                                    className="!bg-transparent !m-0 !p-0 text-sm"
                                    customStyle={{
                                      fontSize: '0.875rem',
                                      lineHeight: '1.714',
                                      background: 'transparent',
                                      padding: '0',
                                      margin: '0'
                                    }}
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                </div>
                              </div>
                            );
                          }
                          // 行内代码 - 渐变高亮
                          return (
                            <code
                              style={{
                                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
                                border: '1px solid rgba(236, 72, 153, 0.3)'
                              }}
                              className="rounded px-1.5 py-0.5 text-sm font-mono text-pink-400"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                        pre: ({node, children }: any) => <div className="text-left">{children}</div>,
                        ul: ({node, ...props}) => <ul className="text-left inline-block space-y-2 text-left" {...props} />,
                        ol: ({node, ...props}) => <ol className="text-left inline-block space-y-2 text-left" {...props} />,
                      }}
                    >
                      {frontData.content || "点击编辑内容"}
                    </ReactMarkdown>
                  </div>

                  {/* 底部留白 */}
                  <div className="h-4"></div>
                </div>

                {/* 底部固定操作栏 */}
                <div className="flex-none p-4" style={{ background: 'rgba(0, 0, 0, 0.3)', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <motion.button
                    onClick={() => setIsFlipped(true)}
                    className="w-full flex items-center justify-center space-x-2 py-3 rounded-full font-medium transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                    }}
                    whileHover={{ scale: 1.02, boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="text-white">查看答案</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : (
            // 反面 - 深色玻璃态卡片
            <motion.div
              key="back"
              initial={{ opacity: 0, rotateY: 10 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <div
                className="absolute w-full h-full flex flex-col rounded-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                {/* 顶部内容滚动区 */}
                <div className="flex-1 overflow-y-auto flashcard-scrollbar p-6">
                  {/* Badge */}
                  <div className="flex justify-center mb-6">
                    <span
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                      }}
                      className="px-4 py-2 text-white text-xs font-bold rounded-full uppercase tracking-wider"
                    >
                      {backData.title || "答案解析"}
                    </span>
                  </div>

                  {/* 核心内容 */}
                  <div className="prose prose-invert prose-sm max-w-none mb-6 text-center">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({node, ...props}) => <p className="mb-4 text-slate-300 leading-relaxed" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-white" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 text-white" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-3 text-white" {...props} />,
                        code: ({node, className, children, ...props }: any) => {
                          const inline = !className?.includes('language-');
                          if (!inline) {
                            const match = /language-(\w+)/.exec(className || '');
                            const language = match ? match[1] : 'text';
                            return (
                              <div className="rounded-xl overflow-hidden my-4 text-left" style={{ border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(0, 0, 0, 0.3)' }}>
                                {/* Mac 窗口头 */}
                                <div className="h-8 flex items-center px-4 space-x-1.5" style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                  <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                                  <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                                  <span className="ml-auto text-xs font-medium text-slate-500 uppercase tracking-wider">{language}</span>
                                </div>
                                {/* 代码内容 */}
                                <div className="p-4 overflow-x-auto">
                                  <SyntaxHighlighter
                                    language={language}
                                    style={oneDark}
                                    PreTag="div"
                                    className="!bg-transparent !m-0 !p-0 text-sm"
                                    customStyle={{
                                      fontSize: '0.875rem',
                                      lineHeight: '1.714',
                                      background: 'transparent',
                                      padding: '0',
                                      margin: '0'
                                    }}
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                </div>
                              </div>
                            );
                          }
                          // 行内代码
                          return (
                            <code
                              style={{
                                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
                                border: '1px solid rgba(236, 72, 153, 0.3)'
                              }}
                              className="rounded px-1.5 py-0.5 text-sm font-mono text-pink-400"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                        pre: ({node, children }: any) => <div className="text-left">{children}</div>,
                        ul: ({node, ...props}) => <ul className="text-left inline-block space-y-2 text-left" {...props} />,
                        ol: ({node, ...props}) => <ol className="text-left inline-block space-y-2 text-left" {...props} />,
                      }}
                    >
                      {backData.content || "暂无答案"}
                    </ReactMarkdown>
                  </div>

                  {/* 底部留白 */}
                  <div className="h-4"></div>
                </div>

                {/* 底部固定操作栏 */}
                <div className="flex-none p-4" style={{ background: 'rgba(0, 0, 0, 0.3)', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <motion.button
                    onClick={() => setIsFlipped(false)}
                    className="w-full flex items-center justify-center space-x-2 py-3 rounded-full font-medium transition-all duration-200 text-slate-300"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                    whileHover={{ scale: 1.02, background: 'rgba(255, 255, 255, 0.1)' }}
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
