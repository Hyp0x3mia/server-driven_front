import React from 'react';
import { motion } from 'framer-motion';

const Marquee = ({ items = [], speed = 20 }) => {
  return (
    <div className="overflow-hidden py-4">
      <motion.div
        className="flex gap-8"
        animate={{ x: [0, -1000] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: speed,
            ease: "linear"
          }
        }}
      >
        {[...items, ...items].map((item, index) => (
          <div
            key={index}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700"
          >
            {item.icon}
            <span className="text-slate-300 text-sm">{item.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default Marquee;
