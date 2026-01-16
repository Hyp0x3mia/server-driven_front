import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Lightbulb, BookOpen, Target } from 'lucide-react';

const ConceptDeckModule = ({ items = [] }) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [mythToggle, setMythToggle] = useState({});

  const toggleMyth = (itemId) => {
    setMythToggle(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const getCardIcon = (item) => {
    if (!item || !item.name) return <BookOpen className="w-8 h-8" />;
    
    if (item.name.includes('属性')) return <Target className="w-8 h-8" />;
    if (item.name.includes('概念') || item.name.includes('认识')) return <Lightbulb className="w-8 h-8" />;
    if (item.name.includes('理论') || item.name.includes('基础')) return <BookOpen className="w-8 h-8" />;
    return <BookOpen className="w-8 h-8" />;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 1: return 'text-green-400';
      case 2: return 'text-yellow-400';
      case 3: return 'text-orange-400';
      case 4: return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  // 如果没有数据，显示空状态
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 text-lg">暂无概念卡片数据</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, index) => {
        if (!item || !item.knowledge_id) {
          return null;
        }

        return (
          <motion.div
            key={item.knowledge_id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative group"
          >
            <motion.div
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 h-full cursor-pointer hover:border-indigo-500/50 transition-all duration-300 relative overflow-hidden"
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={() => setSelectedCard(selectedCard === item.knowledge_id ? null : item.knowledge_id)}
            >
              {/* 背景水印图标 */}
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                {getCardIcon(item)}
              </div>
              
              {/* 难度指示器 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                    {getCardIcon(item)}
                  </div>
                  <span className={`text-sm font-medium ${getDifficultyColor(item.difficulty)}`}>
                    难度 {item.difficulty || 1}
                  </span>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-3 text-slate-100 leading-tight">
                {item.name || '未知标题'}
              </h3>
              
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                {item.description || '暂无描述'}
              </p>
              
              {/* 关键词标签 */}
              <div className="flex flex-wrap gap-2 mb-4">
                {(item.keywords || []).slice(0, 3).map((keyword, idx) => (
                  <span key={idx} className="px-2 py-1 bg-slate-700/50 text-xs text-slate-300 rounded">
                    {keyword}
                  </span>
                ))}
              </div>
              
              {/* 常见误解切换器 */}
              {item.common_misconceptions && Array.isArray(item.common_misconceptions) && item.common_misconceptions.length > 0 && (
                <div className="border-t border-slate-700 pt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMyth(item.knowledge_id);
                    }}
                    className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors text-sm"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>常见误解</span>
                  </button>
                  
                  {mythToggle[item.knowledge_id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg"
                    >
                      <div className="space-y-2">
                        {item.common_misconceptions.map((misconception, idx) => (
                          <div key={idx} className="text-xs text-amber-200">
                            • {misconception}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ConceptDeckModule;
