import React from 'react';
import { transformerArticle } from '@/data/interactive-article.data';
import { MixedContentRenderer } from '@/components/MixedContentRenderer';

const InteractiveArticlePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-transparent">
      {/* 页面头部 */}
      <div className="max-w-3xl mx-auto mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl dark:text-gray-50">
          Transformer 架构详解
        </h1>
        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
          交互式学习演示：请在阅读过程中完成闪卡挑战。
        </p>
      </div>

      {/* 核心渲染器 */}
      <div className="max-w-3xl mx-auto">
          <MixedContentRenderer content={transformerArticle} />
      </div>
      
      {/* 底部调试信息 (可选) */}
      <div className="max-w-3xl mx-auto mt-8 text-center text-sm text-gray-400">
        <p>Server-Driven UI Protocol Demo</p>
      </div>
    </div>
  );
};

export default InteractiveArticlePage;