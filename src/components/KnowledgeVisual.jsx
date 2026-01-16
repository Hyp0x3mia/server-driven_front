import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, ArrowRight, Zap } from 'lucide-react';

// --- 模式 A: 极简终端 (The Mini Terminal) ---
const MiniTerminal = ({ title }) => {
  const codeLines = [
    { text: '> initializing...', color: 'text-emerald-400' },
    { text: '> loading models', color: 'text-sky-400' },
    { text: `> processing: ${title?.substring(0, 12)}...`, color: 'text-violet-400' },
    { text: '✓ complete', color: 'text-emerald-400' },
  ];

  return (
    <div className="w-full h-full bg-black rounded-lg overflow-hidden flex flex-col">
      {/* Window Controls */}
      <div className="h-6 bg-slate-900/50 flex items-center px-3 gap-1.5 border-b border-white/5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
      </div>
      {/* Terminal Content */}
      <div className="flex-1 p-3 font-mono text-xs space-y-1 overflow-hidden">
        {codeLines.map((line, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.15 }}
            className={line.color}
          >
            {line.text}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// --- 模式 B: 微缩架构图 (The Abstract Schematic) ---
const AbstractSchematic = ({ title }) => {
  return (
    <div className="w-full h-full flex items-center justify-center p-3">
      <div className="flex items-center gap-3 w-full">
        {/* Input Block */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 h-16 border border-indigo-400/30 bg-indigo-500/10 rounded-lg flex flex-col items-center justify-center p-2"
        >
          <div className="w-6 h-6 border-2 border-indigo-400/50 rounded mb-1"></div>
          <div className="text-[10px] text-indigo-300 font-semibold">输入</div>
        </motion.div>

        {/* Arrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-1"
        >
          <ArrowRight className="w-4 h-4 text-slate-500" />
          <div className="w-px h-6 border-l border-dashed border-slate-500"></div>
        </motion.div>

        {/* Process Block */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="flex-1 h-20 border border-violet-400/30 bg-violet-500/10 rounded-lg flex flex-col items-center justify-center p-2"
        >
          <div className="flex gap-1 mb-2">
            <div className="w-3 h-3 border-2 border-violet-400/50 rounded"></div>
            <div className="w-3 h-3 border-2 border-violet-400/50 rounded"></div>
            <div className="w-3 h-3 border-2 border-violet-400/50 rounded"></div>
          </div>
          <div className="text-[10px] text-violet-300 font-semibold">处理</div>
        </motion.div>

        {/* Arrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-1"
        >
          <ArrowRight className="w-4 h-4 text-slate-500" />
          <div className="w-px h-6 border-l border-dashed border-slate-500"></div>
        </motion.div>

        {/* Output Block */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="flex-1 h-16 border border-sky-400/30 bg-sky-500/10 rounded-lg flex flex-col items-center justify-center p-2"
        >
          <div className="w-6 h-6 border-2 border-sky-400/50 rounded-full mb-1"></div>
          <div className="text-[10px] text-sky-300 font-semibold">输出</div>
        </motion.div>
      </div>
    </div>
  );
};

// --- 模式 C: 霓虹图标 (The Neon Icon) ---
const NeonIcon = ({ icon: Icon, title }) => {
  return (
    <div className="w-full h-full flex items-center justify-center relative">
      {/* Glowing Backdrop */}
      <motion.div
        className="absolute w-20 h-20 bg-blue-500 rounded-full blur-xl"
        animate={{
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="relative z-10 flex flex-col items-center"
      >
        {Icon && React.cloneElement(Icon, { className: "w-12 h-12 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" })}
        <p className="text-[10px] text-slate-400 mt-2 font-semibold max-w-[120px] text-center line-clamp-2">
          {title}
        </p>
      </motion.div>
    </div>
  );
};

// --- Legacy Sub-components (保留用于兼容) ---

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
      // New visual modes
      case 'mini_terminal':
        return <MiniTerminal title={visualData.title} />;
      case 'abstract_schematic':
        return <AbstractSchematic title={visualData.title} />;
      case 'neon_icon':
        return <NeonIcon icon={visualData.icon} title={visualData.title} />;

      // Legacy visual modes (for compatibility)
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
