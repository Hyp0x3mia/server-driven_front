import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ClozeBlock = ({ text }) => {
  // 解析文本，提取 {{}} 包裹的内容
  const parseText = (text) => {
    const parts = [];
    let lastIndex = 0;
    const regex = /\{\{([^}]+)\}\}/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // 添加普通文本
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }

      // 添加填空部分
      parts.push({
        type: 'cloze',
        content: match[1],
        id: `${match.index}-${match[1]}`
      });

      lastIndex = regex.lastIndex;
    }

    // 添加剩余的普通文本
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex)
      });
    }

    return parts;
  };

  const [revealedIds, setRevealedIds] = useState(new Set());

  const toggleReveal = (id) => {
    const newRevealed = new Set(revealedIds);
    if (newRevealed.has(id)) {
      newRevealed.delete(id);
    } else {
      newRevealed.add(id);
    }
    setRevealedIds(newRevealed);
  };

  const parts = parseText(text || '');

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="text-xl leading-relaxed text-center text-slate-800 dark:text-slate-200">
        {parts.map((part, index) => {
          if (part.type === 'text') {
            return (
              <span key={`text-${index}`} className="inline">
                {part.content}
              </span>
            );
          }

          const isRevealed = revealedIds.has(part.id);

          return (
            <span
              key={`cloze-${index}`}
              className="inline mx-1 align-middle"
            >
              <motion.button
                onClick={() => toggleReveal(part.id)}
                className={`
                  relative px-3 py-1 rounded-lg font-medium transition-all duration-300
                  ${isRevealed
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-slate-200 text-transparent dark:bg-slate-700'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  {isRevealed ? (
                    <motion.span
                      key="revealed"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {part.content}
                    </motion.span>
                  ) : (
                    <motion.span
                      key="hidden"
                      className="inline-block"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {/* 隐藏时显示的提示 */}
                      <span className="select-none text-sm">
                        {part.content.length <= 4
                          ? '🔒'
                          : '▢'.repeat(Math.min(part.content.length, 6))
                        }
                      </span>
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* 底部提示线 */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-current opacity-30"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isRevealed ? 1 : 0 }}
                  transition={{ delay: isRevealed ? 0.1 : 0 }}
                />
              </motion.button>
            </span>
          );
        })}
      </div>

      {/* 交互提示 */}
      {parts.some(p => p.type === 'cloze') && (
        <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          点击灰色区域显示答案
        </div>
      )}
    </div>
  );
};

export default ClozeBlock;
