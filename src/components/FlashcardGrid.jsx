import React from 'react';
import { Flashcard } from './Flashcard';

const FlashcardGrid = ({ cards }) => {
  if (!cards || cards.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {/* 响应式网格布局：移动端1列，平板2列，桌面3列 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div key={card.id || index} className="flex justify-center">
            <div className="w-full">
              <Flashcard data={card} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlashcardGrid;
