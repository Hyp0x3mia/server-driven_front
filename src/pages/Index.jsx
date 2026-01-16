import { motion } from 'framer-motion';
import React, { useMemo, useState } from 'react';
import 'katex/dist/katex.min.css';

// Data
import { knowledgeData } from '../data/knowledgeData';

// Layout Components
import HeroMatrix from '@/components/HeroMatrix';
import VerticalChronicle from '@/components/VerticalChronicle';
import DeepDiveZigZag from '@/components/DeepDiveZigZag';
import BentoGrid from '@/components/BentoGrid';
import SplitPaneLab from '@/components/SplitPaneLab';

// Common Components
import TableOfContents from '@/components/TableOfContents';
import StickyHeader from '@/components/StickyHeader';
import ComponentShowcase from '@/components/ComponentShowcase';
import StickyDotNav from '@/components/StickyDotNav';

import Layout from '@/components/Layout';
const Index = () => {
  const [activeSection, setActiveSection] = useState('overview');

  // 1. Group data by subdomain
  const groupedData = useMemo(() => {
    return knowledgeData.reduce((acc, item) => {
      const subdomain = item.subdomain;
      if (!acc[subdomain]) {
        acc[subdomain] = [];
      }
      acc[subdomain].push(item);
      return acc;
    }, {});
  }, []);

  // 2. Define the mapping from subdomain to layout component
  const getModuleType = (subdomain) => {
    // Vertical Chronicle
    if (subdomain.includes('发展历史')) return 'chronicle';
    
    // Split-Pane Lab
    if (subdomain.includes('计算理论基础')) return 'splitpane';
    
    // Bento Grid
    if (['技术原理', '机器学习与深度学习', '神经网络基础', '大模型技术'].some(keyword => subdomain.includes(keyword))) {
      return 'bento';
    }

    // Deep-Dive Zig-Zag (Default)
    return 'zigzag';
  };

  // 3. Render the correct layout component based on module type
  const renderModule = (subdomain, items) => {
    const moduleType = getModuleType(subdomain);

    switch (moduleType) {
      case 'chronicle':
        return <VerticalChronicle items={items} />;
      case 'splitpane':
        return <SplitPaneLab items={items} />;
      case 'bento':
        return <BentoGrid items={items} />;
      case 'zigzag':
      default:
        return <DeepDiveZigZag items={items} />;
    }
  };

  return (
    <Layout>
      {/* Navigation Elements */}
      <StickyHeader activeSection={activeSection} onSectionChange={setActiveSection} />
      <TableOfContents 
        groupedData={groupedData}
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      <StickyDotNav
        groupedData={groupedData}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      
      {/* Hero Section */}
      <HeroMatrix />
      
      {/* Main Content Body */}
      <motion.section
        id="component-showcase"
        onViewportEnter={() => setActiveSection('component-showcase')}
        className="mb-32"
      >
        <ComponentShowcase />
      </motion.section>

      {Object.entries(groupedData).map(([subdomain, items]) => (
        <motion.section
          key={subdomain}
          id={subdomain.toLowerCase().replace(/\s+/g, '-')}
          onViewportEnter={() => setActiveSection(subdomain.toLowerCase().replace(/\s+/g, '-'))}
          className="mb-32 relative"
        >
          {/* Watermark */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[12rem] font-black text-white/5 pointer-events-none">
            {subdomain.substring(0, 2)}
          </div>

          <motion.h2 
            className="relative text-4xl font-bold mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-cyan-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {subdomain}
          </motion.h2>
          
          {renderModule(subdomain, items)}
        </motion.section>
      ))}
    </Layout>
  );

};

export default Index;