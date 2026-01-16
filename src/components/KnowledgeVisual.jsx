import React from 'react';
import { motion } from 'framer-motion';

// --- Sub-components for different visual types ---

const ConceptCards = ({ cards }) => (
  <div className="flex justify-around items-center h-full gap-4 p-4">
    {cards.map((card, index) => (
      <motion.div
        key={index}
        className="flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-300">
          {React.cloneElement(card.icon, { className: "w-8 h-8" })}
        </div>
        <h4 className="mt-3 font-bold text-slate-100">{card.title}</h4>
        <p className="text-xs text-slate-400">{card.description}</p>
      </motion.div>
    ))}
  </div>
);

const EraCards = ({ eras }) => (
  <div className="flex justify-center items-center h-full gap-8 p-4">
    {eras.map((era, index) => (
      <div key={index} className="flex flex-col items-center text-center">
        <div className="text-2xl font-bold text-amber-400">{era.year}</div>
        <div className="text-sm font-semibold text-slate-200 mt-1">{era.title}</div>
        <div className="text-xs text-slate-500">{era.description}</div>
      </div>
    ))}
  </div>
);

const ParadigmComparison = ({ paradigms }) => (
    <div className="flex justify-around items-stretch h-full gap-6 p-4">
        {paradigms.map((p, i) => (
            <div key={i} className="w-1/2 bg-slate-900/50 rounded-lg p-4 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-sky-500/20 rounded-full flex items-center justify-center text-sky-300 mb-3">
                    {React.cloneElement(p.icon, { className: "w-7 h-7" })}
                </div>
                <h4 className="font-bold text-slate-100">{p.title}</h4>
                <p className="text-sm text-slate-400 mt-1 flex-grow">{p.description}</p>
            </div>
        ))}
    </div>
);

const CapabilityCards = ({ capabilities }) => (
    <div className="flex justify-around items-center h-full gap-4 p-4">
        {capabilities.map((cap, index) => (
            <div key={index} className="flex flex-col items-center text-center p-2 rounded-lg bg-slate-900/40">
                <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center text-teal-300">
                    {React.cloneElement(cap.icon, { className: "w-7 h-7" })}
                </div>
                <h4 className="mt-2 font-semibold text-sm text-slate-200">{cap.name}</h4>
            </div>
        ))}
    </div>
);

const FallbackVisual = ({ icon, title }) => (
  <div className="flex flex-col justify-center items-center h-full gap-2 text-slate-500">
    {React.cloneElement(icon, { className: "w-10 h-10" })}
    <p className="text-sm font-semibold">{title}</p>
  </div>
);


// --- Main Dispatcher Component ---

const KnowledgeVisual = ({ visualData }) => {
  const renderVisual = () => {
    if (!visualData || !visualData.type) {
      return <FallbackVisual icon={<Zap />} title="No data" />;
    }

    switch (visualData.type) {
      case 'concept_cards':
        return <ConceptCards cards={visualData.cards} />;
      case 'era_cards':
        return <EraCards eras={visualData.eras} />;
      case 'paradigm_comparison':
        return <ParadigmComparison paradigms={visualData.paradigms} />;
      case 'capability_cards':
        return <CapabilityCards capabilities={visualData.capabilities} />;
      case 'fallback':
      default:
        return <FallbackVisual icon={visualData.icon} title={visualData.title} />;
    }
  };

  return <div className="flex justify-center items-center w-full h-full">{renderVisual()}</div>;
};

export default KnowledgeVisual;
