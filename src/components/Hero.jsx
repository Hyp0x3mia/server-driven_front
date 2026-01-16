import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Globe } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 背景动画元素 */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <div className="text-center z-10 max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex justify-center items-center gap-4 mb-6">
            <Brain className="w-12 h-12 text-indigo-400" />
            <Zap className="w-8 h-8 text-purple-400" />
            <Globe className="w-10 h-10 text-blue-400" />
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            人工智能导论
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
            探索人工智能的本质、历史演进与技术原理
            <br />
            构建系统化的认知框架
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 text-sm text-slate-400"
        >
          <span className="px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700">
            📚 27个核心知识点
          </span>
          <span className="px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700">
            🧠 多维度学习路径
          </span>
          <span className="px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700">
            ⚡ 动态内容适配
          </span>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
