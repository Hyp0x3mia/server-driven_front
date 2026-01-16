import React from 'react';
import ReactMarkdown from 'react-markdown';

const MarkdownBlock = ({ content }) => {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default MarkdownBlock;
