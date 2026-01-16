import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Award, Cpu } from 'lucide-react';

const ChronicleModule = ({ items = [] }) => {
  const [selectedItem, setSelectedItem] = useState(null);

  // 提取年份的辅助函数，增加输入验证
  const extractYear = (text) => {
    if (!text || typeof text !== 'string') {
      return null;
    }
    const match = text.match(/(\d{4})年/);
    return match ? parseInt(match[1]) : null;
  };

  // 确保items是数组且不为空，然后按时间排序
  const sortedItems = React.useMemo(() => {
    if (!Array.isArray(items) || items.length === 0) {
      return [];
    }
    
    return [...items].sort((a, b) => {
      const yearA = extractYear(a?.name) || 0;
      const yearB = extractYear(b?.name) || 0;
      return yearA - yearB;
    });
  }, [items]);

  const getIcon = (item) => {
    if (!item || !item.name) return <Calendar className="w-6 h-6" />;
    
    if (item.name.includes('图灵')) return <User className="w-6 h-6" />;
    if (item.name.includes('会议') || item.name.includes('提出')) return <Award className="w-6 h-6" />;
    if (item.name.includes('模型') || item.name.includes('网络')) return <Cpu className="w-6 h-6" />;
    return <Calendar className="w-6 h-6" />;
  };

  // 如果没有数据，显示空状态
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 text-lg">暂无时间线数据</div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 中央时间线 */}
      <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
      
      <div className="space-y-12">
        {sortedItems.map((item, index) => {
          if (!item || !item.knowledge_id) {
            return null;
          }

          const year = extractYear(item.name);
          const isLeft = index % 2 === 0;
          
          return (
            <motion.div
              key={item.knowledge_id}
              initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`flex items-center ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
            >
              {/* 内容卡片 */}
              <div className={`w-5/12 ${isLeft ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                <motion.div
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 cursor-pointer hover:border-indigo-500/50 transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -5 }}
                  onClick={() => setSelectedItem(selectedItem === item.knowledge_id ? null : item.knowledge_id)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                      {getIcon(item)}
                    </div>
                    {year && (
                      <span className="text-2xl font-bold text-indigo-400">{year}</span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2 text-slate-100">{item.name || '未知标题'}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{item.description || '暂无描述'}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {(item.keywords || []).slice(0, 3).map((keyword, idx) => (
                      <span key={idx} className="px-2 py-1 bg-slate-700/50 text-xs text-slate-300 rounded">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </div>
              
              {/* 时间节点 */}
              <div className="relative z-10">
                <motion.div
                  className="w-4 h-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full border-4 border-slate-950"
                  whileHover={{ scale: 1.5 }}
                  animate={{ scale: selectedItem === item.knowledge_id ? 1.5 : 1 }}
                />
              </div>
              
              {/* 空白区域 */}
              <div className="w-5/12"></div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ChronicleModule;
