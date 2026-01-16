import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Brain, Zap, Globe, ChevronRight } from 'lucide-react';

const TableOfContents = ({ groupedData, activeSection, onSectionChange }) => {
  const sections = React.useMemo(() => {
    if (!groupedData) return [];
    
    // Add the initial overview section
    const dynamicSections = Object.keys(groupedData).map(subdomain => ({
      id: subdomain.toLowerCase().replace(/\\s+/g, '-'),
      label: subdomain,
      icon: <BookOpen className="w-4 h-4" /> // Generic icon, can be improved
    }));

    return [
      { id: 'overview', label: '页面导览', icon: <Globe className="w-4 h-4" /> },
      ...dynamicSections
    ];
  }, [groupedData]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      onSectionChange(sectionId);
    }
  };

  return (
    <motion.div
      className="fixed left-6 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
    >
      <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-xl p-4 w-64">
        <h3 className="text-sm font-semibold text-slate-300 mb-4 px-3">目录导航</h3>
        <nav className="space-y-1">
          {sections.map((section) => (
            <motion.button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors text-left ${
                activeSection === section.id
                  ? 'text-indigo-300 bg-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`p-1.5 rounded-lg ${activeSection === section.id ? 'bg-indigo-500/30' : 'bg-slate-800/80'}`}>
                {section.icon}
              </div>
              <span className="text-sm font-medium">{section.label}</span>
              {activeSection === section.id && (
                <motion.div layoutId="toc-active-indicator" className="ml-auto">
                  <ChevronRight className="w-5 h-5" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </nav>
      </div>
    </motion.div>
  );
};

export default TableOfContents;
