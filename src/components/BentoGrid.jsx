import React from 'react';
import GlassmorphismCard from '@/components/GlassmorphismCard';
import { Badge } from '@/components/ui/badge';
import MythBuster from '@/components/MythBuster';
import Marquee from '@/components/Marquee';
import { motion } from 'framer-motion';
import { Cpu, Zap, Brain, Layers, Globe, Code } from 'lucide-react';

const iconMap = {
  "技术原理": <Cpu className="w-8 h-8 text-sky-400" />,
  "机器学习与深度学习": <Layers className="w-8 h-8 text-teal-400" />,
  "神经网络基础": <Brain className="w-8 h-8 text-emerald-400" />,
  "大模型技术": <Zap className="w-8 h-8 text-rose-400" />,
  "default": <Code className="w-8 h-8 text-slate-400" />,
};

import { generateVisual } from '@/lib/chartUtils.jsx';
import KnowledgeVisual from '@/components/KnowledgeVisual';

const BentoGrid = ({ items, marqueeItems }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item, index) => {
          // Mark first item as key point to span 2 columns
          const isKeyPoint = index === 0;
          const icon = iconMap[item.subdomain] || iconMap.default;

          return (
            <motion.div
              key={item.knowledge_id}
              className={isKeyPoint ? 'md:col-span-2' : ''}
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <GlassmorphismCard className="p-4 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-2">
                  {icon}
                  <h3 className="text-lg font-bold text-white">{item.name}</h3>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed mb-3 flex-grow">{item.description}</p>
                
                <div className="h-32 bg-slate-900/50 rounded-lg p-1 my-2">
                  {item && item.subdomain ? (
                    <KnowledgeVisual visualData={generateVisual(item, item.subdomain)} />
                  ) : (
                    <div className="h-full w-full rounded-lg bg-slate-800/40" />
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mt-auto">
                  {(item.keywords || []).map(kw => <Badge key={kw} className="border-sky-500/50 text-sky-300 bg-sky-500/10 text-xs">{kw}</Badge>)}
                </div>

              </GlassmorphismCard>
            </motion.div>
          );
        })}
      </div>
      {marqueeItems && marqueeItems.length > 0 && (
        <div className="mt-12">
          <Marquee items={marqueeItems} />
        </div>
      )}
    </>
  );
};

export default BentoGrid;
