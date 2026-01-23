// src/renderer/registry.tsx

import React from "react";
import { CodePlayground } from "../components/blocks/CodePlayground";

/** =========================
 *  Schema Types (v1/v2 compatible)
 * ========================= */

import type { FlashcardContent } from "@/types/interactive-content";

export type HeroBlock = {
  type: "Hero";
  role?: string;
  content: {
    title: string;
    subtitle?: string;
    features?: string[];
  };
};

export type CardGridItem = {
  title?: string;
  name?: string;
  description?: string;
  year?: string;
  label?: string;
  keywords?: string[];
  common_misconceptions?: string[];
  subdomain?: string;
};

export type CardGridBlock = {
  type: "CardGrid";
  role?: string;
  content: {
    title?: string;
    items: CardGridItem[];
  };
  render?: {
    variant?: string;
    items_icon?: string[];
    item_class_names?: string[];
  };
};

export type TimelineItem = {
  year?: string;
  label?: string;
  title: string;
  description?: string;
  keywords?: string[];
  common_misconceptions?: string[];
  subdomain?: string;
};

export type TimelineBlock = {
  type: "Timeline";
  role?: string;
  content: {
    title?: string;
    items: TimelineItem[];
  };
  render?: {
    variant?: string;
  };
};

// New Block Types
export type MarkdownBlock = {
  type: "Markdown";
  content: string;
};

export type FlashcardBlock = Omit<FlashcardContent, 'type'> & { type: "Flashcard" };

export type ClozeBlock = {
  type: "Cloze";
  content: string;
};

export type FlashcardGridBlock = {
  type: "FlashcardGrid";
  role?: string;
  content: {
    title?: string;
    cards: FlashcardBlock[];
  };
};

export type CodePlaygroundBlock = {
  type: "CodePlayground";
  role?: string;
  content: {
    mode: 'tokenizer' | 'hyperparameter';
    initialText?: string;
    codeTemplate?: string;
  };
};

export type Block = HeroBlock | CardGridBlock | TimelineBlock | MarkdownBlock | FlashcardBlock | ClozeBlock | FlashcardGridBlock | CodePlaygroundBlock;

export type SectionV2 = {
  section_id?: string;
  sectionType?: string;
  title?: string;
  backgroundText?: string;
  layoutIntent?: string;
  pedagogicalGoal?: string;
  blocks: Block[];
};

export type PageSchema = {
  page_id: string;

  // v2 optional fields
  pageMode?: string;
  title?: string;
  summary?: string;
  sections?: SectionV2[];

  // v1 field (and also normalized for v2)
  components: Block[];
};

/** =========================
 *  Import template components
 * ========================= */

import HeroMatrix from "../components/HeroMatrix.jsx";
import BentoGrid from "../components/BentoGrid.jsx";
import VerticalChronicle from "../components/VerticalChronicle.jsx";
import { Flashcard } from "../components/Flashcard.tsx";
import FlashcardGrid from "../components/FlashcardGrid.jsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ClozeBlock from "../components/blocks/ClozeBlock.jsx";


/** =========================
 *  KnowledgePoint-like shape (what your template expects)
 * ========================= */

type KnowledgePointLike = {
  knowledge_id: string;
  name: string;
  description: string;

  domain: string;
  subdomain: string;

  keywords: string[];
  common_misconceptions: string[];

  difficulty?: number;
  importance?: number;
  abstraction?: number;
  estimated_time?: number;
  is_key_point?: boolean;
  is_difficult?: boolean;
};

function safeStr(x: unknown, fallback = ""): string {
  return typeof x === "string" ? x : fallback;
}

function safeStrArr(x: unknown): string[] {
  return Array.isArray(x) ? x.filter((v) => typeof v === "string") : [];
}

function makeKnowledgePoint(opts: {
  pageId: string;
  groupTitle: string;
  idx: number;
  name: string;
  description: string;
  domain?: string;
  subdomain?: string;
  keywords?: unknown;
  common_misconceptions?: unknown;
}): KnowledgePointLike {
  const pageId = opts.pageId || "page";
  const groupTitle = opts.groupTitle || "default";

  const name = safeStr(opts.name, `Item ${opts.idx + 1}`).trim();
  const description = safeStr(opts.description, "");

  const domain = safeStr(opts.domain, "");
  const subdomain = safeStr(opts.subdomain, groupTitle || "default");

  const knowledge_id = `${pageId}::${subdomain}::${opts.idx}`;

  return {
    knowledge_id,
    name,
    description,
    domain,
    subdomain,
    keywords: safeStrArr(opts.keywords),
    common_misconceptions: safeStrArr(opts.common_misconceptions),
    difficulty: 0,
    importance: 0,
    abstraction: 0,
    estimated_time: 0,
    is_key_point: opts.idx === 0,
    is_difficult: false,
  };
}

/** =========================
 *  Adapters
 * ========================= */

export type AdapterProps<T extends Block> = {
  block: T;
  pageId: string;
};

const HeroAdapter: React.FC<AdapterProps<HeroBlock>> = ({ block }) => {
  return (
    <HeroMatrix
      title={safeStr(block.content.title)}
      subtitle={safeStr(block.content.subtitle)}
    />
  );
};

const CardGridAdapter: React.FC<AdapterProps<CardGridBlock>> = ({ block, pageId }) => {
  const groupTitle = safeStr(block.content.title, "default");
  const items = Array.isArray(block.content.items) ? block.content.items : [];

  const adaptedItems: KnowledgePointLike[] = items.map((it, idx) =>
    makeKnowledgePoint({
      pageId,
      groupTitle,
      idx,
      name: safeStr(it.title ?? it.name ?? `Item ${idx + 1}`),
      description: safeStr(it.description),
      subdomain: it.subdomain,
      keywords: it.keywords,
      common_misconceptions: it.common_misconceptions,
    })
  );

  return <BentoGrid items={adaptedItems} marqueeItems={[]} />;
};

const TimelineAdapter: React.FC<AdapterProps<TimelineBlock>> = ({ block, pageId }) => {
  const groupTitle = safeStr(block.content.title, "default");
  const items = Array.isArray(block.content.items) ? block.content.items : [];

  const adaptedItems: KnowledgePointLike[] = items.map((it, idx) => {
    const yearOrLabel = safeStr(it.year || it.label, "");
    const desc = safeStr(it.description);
    const mergedDesc = yearOrLabel && desc ? `${yearOrLabel}：${desc}` : (desc || yearOrLabel);

    return makeKnowledgePoint({
      pageId,
      groupTitle,
      idx,
      name: safeStr(it.title, `Stage ${idx + 1}`),
      description: mergedDesc,
      subdomain: it.subdomain,
      keywords: it.keywords,
      common_misconceptions: it.common_misconceptions,
    });
  });

  return <VerticalChronicle items={adaptedItems} />;
};

const MarkdownAdapter: React.FC<AdapterProps<MarkdownBlock>> = ({ block }) => {
  return (
    <div className="prose prose-lg prose-slate dark:prose-invert max-w-3xl mx-auto mb-10 tracking-wide leading-loose text-slate-300">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {block.content}
      </ReactMarkdown>
    </div>
  );
};

const FlashcardAdapter: React.FC<AdapterProps<FlashcardBlock>> = ({ block }) => {
  // 调试日志
  console.log("FlashcardAdapter received block:", block);

  // 数据验证
  if (!block) {
    return <div className="p-4 bg-red-100 text-red-700">FlashcardAdapter: No block data</div>;
  }

  // 移除 my-16，由父级 space-y-16 统一控制间距
  return (
    <div className="w-full flex justify-center relative z-10 py-8">
      <Flashcard data={block} />
    </div>
  );
};

const ClozeAdapter: React.FC<AdapterProps<ClozeBlock>> = ({ block }) => {
  return <ClozeBlock text={block.content} />;
};

const FlashcardGridAdapter: React.FC<AdapterProps<FlashcardGridBlock>> = ({ block }) => {
  return (
    <div className="w-full py-8">
      <FlashcardGrid cards={block.content.cards} />
    </div>
  );
};

const CodePlaygroundAdapter: React.FC<AdapterProps<CodePlaygroundBlock>> = ({ block }) => {
  return (
    <div className="w-full py-6">
      <CodePlayground
        type={block.content.mode}
        initialText={block.content.initialText}
        codeTemplate={block.content.codeTemplate}
      />
    </div>
  );
};

export const registry = {
  Hero: HeroAdapter,
  CardGrid: CardGridAdapter,
  Timeline: TimelineAdapter,
  Markdown: MarkdownAdapter,
  Flashcard: FlashcardAdapter,
  Cloze: ClozeAdapter,
  FlashcardGrid: FlashcardGridAdapter,
  CodePlayground: CodePlaygroundAdapter,
} as const;

export type RegistryKey = keyof typeof registry;

function isRegistryKey(x: string): x is RegistryKey {
  return x in registry;
}
