import React from 'react';
import { motion } from 'framer-motion';

const StickyDotNav = ({ groupedData, activeSection, onSectionChange }) => {
  const sections = React.useMemo(() => {
    if (!groupedData) return [];
    
    const dynamicSections = Object.keys(groupedData).map(subdomain => ({
      id: subdomain.toLowerCase().replace(/\s+/g, '-'),
      label: subdomain,
    }));

    return [
      { id: 'overview', label: 'Overview' },
      { id: 'component-showcase', label: 'Component Showcase' },
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
      className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:block"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 1.5 }}
    >
      <nav className="flex flex-col items-center gap-4">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className="group relative w-6 h-6 flex items-center justify-center"
            aria-label={`Scroll to ${section.label}`}
          >
            <span
              className={`block w-2 h-2 rounded-full transition-all duration-300 ${ 
                activeSection === section.id ? 'bg-indigo-400 scale-150' : 'bg-slate-600 group-hover:bg-slate-300'
              }`}
            />
            <span className="absolute right-full mr-4 px-3 py-1 bg-slate-800 text-slate-200 text-xs font-semibold rounded-md opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 origin-right pointer-events-none">
              {section.label}
            </span>
          </button>
        ))}
      </nav>
    </motion.div>
  );
};

export default StickyDotNav;
