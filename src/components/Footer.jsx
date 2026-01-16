import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Target, Zap } from 'lucide-react';

const Footer = () => {
  const learningPaths = [
    {
      title: '基础概念',
      description: '掌握AI的基本概念和属性',
      progress: 85,
      icon: <BookOpen className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: '历史发展',
      description: '了解AI的发展历程和里程碑',
      progress: 70,
      icon: <Target className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: '技术原理',
      description: '深入理解AI的技术实现',
      progress: 45,
      icon: <Zap className="w-5 h-5" />,
      color: 'from-orange-500 to-red-500'
    }
  ];

  const nextTopics = [
    '机器学习算法详解',
    '深度学习网络架构',
    '自然语言处理技术',
    '计算机视觉应用',
    '强化学习原理'
  ];

  return (
    <footer className="bg-slate-900/50 backdrop-blur-sm border-t border-slate-800">
      <div className="container mx-auto px-6 py-16">
        {/* 学习进度地图 */}
        <div className="mb-16">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
          >
            学习进度地图
          </motion.h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {learningPaths.map((path, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 bg-gradient-to-r ${path.color} rounded-lg text-white`}>
                    {path.icon}
                  </div>
                  <h4 className="text-lg font-semibold text-slate-100">{path.title}</h4>
                </div>
                
                <p className="text-slate-300 text-sm mb-4">{path.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">进度</span>
                    <span className="text-slate-300">{path.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <motion.div
                      className={`h-2 bg-gradient-to-r ${path.color} rounded-full`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${path.progress}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 下一步学习建议 */}
        <div className="mb-12">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl font-bold text-center mb-6 text-slate-100"
          >
            接下来学什么？
          </motion.h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {nextTopics.map((topic, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 p-3 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-indigo-500/50 transition-all duration-300 group"
              >
                <span className="text-sm text-slate-300 group-hover:text-slate-100">{topic}</span>
                <ArrowRight className="w-4 h-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* 底部信息 */}
        <div className="text-center pt-8 border-t border-slate-800">
          <p className="text-slate-400 text-sm">
            © 2024 人工智能导论 - 构建系统化的AI认知框架
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
