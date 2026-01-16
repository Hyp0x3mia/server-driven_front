import React, { useState } from 'react';
import GlassmorphismCard from '@/components/GlassmorphismCard';
import KnowledgeVisual from '@/components/KnowledgeVisual';
import MythBuster from '@/components/MythBuster';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Brain, Globe, Zap, Code, GitMerge } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateVisual, generateMockCode } from '@/lib/chartUtils.jsx';

const iconMap = {
  "人工智能概述": <Brain className="w-8 h-8 text-indigo-400" />,
  "基本概念": <BookOpen className="w-8 h-8 text-purple-400" />,
  "哲学基础": <Globe className="w-8 h-8 text-blue-400" />,
  "default": <Zap className="w-8 h-8 text-green-400" />,
};

const MockCodeBlock = ({ code }) => (
  <div className="bg-[#282c34] rounded-lg h-full p-4 overflow-auto">
    <pre className="text-sm text-slate-300 font-mono leading-relaxed">
      <code>{code}</code>
    </pre>
  </div>
);

const DeepDiveZigZag = ({ items }) => {
  const [viewModes, setViewModes] = useState({});

  const setViewMode = (id, mode) => {
    setViewModes(prev => ({ ...prev, [id]: mode }));
  };

  return (
    <div className="space-y-24">
      {items.map((item, index) => {
        const isReversed = index % 2 !== 0;
        const viewMode = viewModes[item.knowledge_id] || 'diagram';

        return (
          <div key={item.knowledge_id} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className={`lg:order-${isReversed ? 2 : 1}`}>
              <div className="flex items-center gap-4 mb-4">
                {iconMap[item.subdomain] || iconMap.default}
                <h3 className="text-3xl font-bold text-white">{item.name}</h3>
              </div>
              <p className="text-slate-300 text-lg leading-relaxed mb-6">{item.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {(item.keywords || []).map((keyword, idx) => (
                  <Badge key={idx} className="border-indigo-500/50 text-indigo-300 bg-indigo-500/10 text-sm">
                    {keyword}
                  </Badge>
                ))}
              </div>

              <MythBuster misconceptions={item.common_misconceptions} />
            </div>
            <div className={`lg:order-${isReversed ? 1 : 2}`}>
              <GlassmorphismCard className="h-96 flex flex-col">
                <div className="flex-shrink-0 p-2 border-b border-slate-700 flex items-center gap-2">
                   <button onClick={() => setViewMode(item.knowledge_id, 'diagram')} className={`px-3 py-1 text-xs rounded-md flex items-center gap-2 transition ${viewMode === 'diagram' ? 'bg-indigo-500/30 text-indigo-300' : 'text-slate-400 hover:bg-white/5'}`}>
                    <GitMerge className="w-4 h-4" />
                    Visual
                  </button>
                  <button onClick={() => setViewMode(item.knowledge_id, 'code')} className={`px-3 py-1 text-xs rounded-md flex items-center gap-2 transition ${viewMode === 'code' ? 'bg-sky-500/30 text-sky-300' : 'text-slate-400 hover:bg-white/5'}`}>
                    <Code className="w-4 h-4" />
                    Code
                  </button>
                </div>
                <div className="flex-grow p-4 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={viewMode}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full"
                    >
                      {viewMode === 'diagram' ? (
                        <KnowledgeVisual visualData={generateVisual(item, item.subdomain)} />
                      ) : (
                        <MockCodeBlock code={generateMockCode(item)} />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </GlassmorphismCard>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DeepDiveZigZag;