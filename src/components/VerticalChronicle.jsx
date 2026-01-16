import React from 'react';
import GlassmorphismCard from '@/components/GlassmorphismCard';
import { Badge } from '@/components/ui/badge';
import MythBuster from '@/components/MythBuster';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

import { generateVisual } from '@/lib/chartUtils.jsx';
import KnowledgeVisual from '@/components/KnowledgeVisual';

const VerticalChronicle = ({ items }) => {
  // Function to extract year from description
  const extractYear = (description) => {
    const match = description.match(/\b(19|20)\d{2}\b/);
    return match ? match[0] : null;
  };

  return (
    <div className="relative container mx-auto py-12">
      {/* Central Line */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-0.5 bg-slate-700" />

      {items.map((item, index) => {
        const isOdd = index % 2 !== 0;
        const year = extractYear(item.description);

        return (
          <div key={item.knowledge_id} className="relative grid grid-cols-1 lg:grid-cols-2 items-center mb-16">
            {/* Glowing Node */}
            <div className="absolute left-1/2 top-8 lg:top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-indigo-500 rounded-full border-2 border-slate-950 shadow-[0_0_15px_rgba(132,142,255,0.8)]" />

            <div className={`my-4 lg:my-0 ${isOdd ? 'lg:col-start-2' : 'lg:col-start-1 lg:pr-16'}`}>
              <motion.div
                initial={{ opacity: 0, x: isOdd ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={`lg:flex ${isOdd ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`w-full lg:max-w-md ${isOdd ? 'lg:pl-16' : ''}`}>
                  <GlassmorphismCard className="p-6">
                    {year && (
                      <div className="flex items-center gap-2 text-sm text-amber-400 font-semibold mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>{year}</span>
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-white mb-3">{item.name}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed mb-4">{item.description}</p>
                    
                    <div className="h-24 bg-slate-900/50 rounded-lg p-2 my-4">
                      <KnowledgeVisual visualData={generateVisual(item, item.subdomain)} />
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {(item.keywords || []).map(kw => <Badge key={kw} className="border-amber-500/50 text-amber-300 bg-amber-500/10">{kw}</Badge>)}
                    </div>

                    <MythBuster misconceptions={item.common_misconceptions} />
                  </GlassmorphismCard>
                </div>
              </motion.div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VerticalChronicle;
