import React from 'react';
import GlassmorphismCard from '@/components/GlassmorphismCard';
import MythBuster from '@/components/MythBuster';
import { Badge } from '@/components/ui/badge';
import { BlockMath } from 'react-katex';
import { Copy, Terminal } from 'lucide-react';

import { generateMockCode } from '@/lib/chartUtils.jsx';

const SplitPaneLab = ({ items }) => {
    return (
        <div className="space-y-16">
            {items.map(item => {
                const code = generateMockCode(item);
                return (
                    <GlassmorphismCard key={item.knowledge_id} className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Left Pane: Text & Formulas */}
                            <div>
                                <h3 className="text-3xl font-bold text-white mb-4">{item.name}</h3>
                                <p className="text-slate-300 text-lg leading-relaxed mb-6">{item.description}</p>
                                
                                <div className="bg-slate-900/50 rounded-lg p-6 my-6">
                                    <h4 className="text-sm font-medium text-indigo-400 mb-4">核心公式</h4>
                                    <div className="text-slate-200">
                                        {item.name.includes('图灵') ? <BlockMath math="M = (Q, \Sigma, \Gamma, \delta, q_0, B, F)" /> : <BlockMath math="P(A|B) = \frac{P(B|A)P(A)}{P(B)}" />}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    {(item.keywords || []).map(kw => <Badge key={kw} className="border-indigo-500/50 text-indigo-300 bg-indigo-500/10">{kw}</Badge>)}
                                </div>
                                
                                <MythBuster misconceptions={item.common_misconceptions} />
                            </div>

                            {/* Right Pane: Mock IDE */}
                            <div className="sticky top-24 h-full">
                                <div className="bg-[#282c34] rounded-lg border border-slate-700 h-full flex flex-col">
                                    <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1.5">
                                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            </div>
                                            <span className="text-sm text-slate-400 ml-2">main.py</span>
                                        </div>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(code)}
                                            className="flex items-center gap-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm text-slate-300 transition-colors"
                                        >
                                            <Copy className="w-4 h-4" />
                                            <span>Copy</span>
                                        </button>
                                    </div>
                                    <div className="p-4 text-sm text-slate-300 font-mono overflow-auto flex-grow">
                                        <pre><code>{code}</code></pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GlassmorphismCard>
                )
            })}
        </div>
    );
};

export default SplitPaneLab;
