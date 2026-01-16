// src/components/MixedContentRenderer.tsx

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { InteractiveArticle } from "@/types/interactive-content";
import { Flashcard } from "@/components/Flashcard";

interface MixedContentRendererProps {
  content: InteractiveArticle;
}

export function MixedContentRenderer({ content }: MixedContentRendererProps) {
  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-12">
      {content.map((item, index) => {
        switch (item.type) {
          case "markdown":
            return (
              <div
                key={index}
                className="prose prose-lg prose-slate dark:prose-invert max-w-none mb-10 tracking-wide leading-loose text-slate-300"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {item.content}
                </ReactMarkdown>
              </div>
            );
          case "flashcard":
            return (
              // 这里的 perspective-1000 其实可以去掉了，因为 Flashcard 内部加了
              <div key={item.id} className="w-full flex justify-center my-16">
                <Flashcard data={item} />
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}