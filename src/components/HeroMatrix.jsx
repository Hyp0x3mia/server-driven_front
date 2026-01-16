import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Globe } from 'lucide-react';

const HeroMatrix = () => {
  return (
    <section id="overview" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0B1120] py-20">
      {/* Background Animated Grid */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
        />
        <div 
          className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_300px,#3b82f633,transparent)]"
        />
      </div>

      {/* Glow Orb */}
      <motion.div
        className="absolute inset-0 z-10"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/30 rounded-full blur-3xl" />
      </motion.div>


      <div className="text-center z-20 max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex justify-center items-center gap-4 mb-6">
            <Brain className="w-12 h-12 text-indigo-300" />
            <Zap className="w-8 h-8 text-purple-300" />
            <Globe className="w-10 h-10 text-blue-300" />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-slate-100 via-slate-300 to-indigo-300 bg-clip-text text-transparent">
            人工智能导论
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 mb-8 leading-relaxed">
            一个交互式的学习体验，旨在探索人工智能的本质、历史演进与核心技术原理，助您构建系统化的现代AI认知框架。
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 text-sm text-slate-400"
        >
          <span className="px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full">
            📚 30+ 核心知识点
          </span>
          <span className="px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full">
            🧠 交互式图表与代码
          </span>
          <span className="px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full">
            ⚡ 动态内容布局
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroMatrix;