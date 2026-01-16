import React from 'react';
import MarkdownBlock from './MarkdownBlock';
import FlashcardBlock from './FlashcardBlock';
import ClozeBlock from './ClozeBlock';

const SectionRenderer = ({ section }) => {
  if (!section || !section.blocks) {
    return null;
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      {section.blocks.map((block, index) => {
        switch (block.type) {
          case 'Markdown':
            return <MarkdownBlock key={index} content={block.content} />;
          case 'Flashcard':
            return <FlashcardBlock key={block.id || index} id={block.id} front={block.front} back={block.back} />;
          case 'Cloze':
            return <ClozeBlock key={index} text={block.content} />;
          default:
            console.warn(`Unknown block type: ${block.type}`);
            return null;
        }
      })}
    </section>
  );
};

export default SectionRenderer;
