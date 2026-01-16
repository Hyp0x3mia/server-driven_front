import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Tabs = ({ tabs = [] }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!Array.isArray(tabs) || tabs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 text-lg">暂无选项卡数据</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="flex border-b border-slate-700 mb-6">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === index
                ? 'text-indigo-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab.title}
            {activeTab === index && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400"
                layoutId="activeTab"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {tabs[activeTab].content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Tabs;
