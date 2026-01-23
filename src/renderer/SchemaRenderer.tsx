import React, { useEffect, useMemo, useState } from "react";
import { registry, type Block, type PageSchema, type RegistryKey } from "./registry";
import { EditableBlock } from "../components/editor/EditableBlock";
import { SidebarNav } from "../components/layout/SidebarNav";
import { cn } from "../lib/utils";

function flattenBlocksFromSections(schema: any): Block[] {
  const secs = schema?.sections;
  if (!Array.isArray(secs)) return [];

  const out: any[] = [];
  for (const s of secs) {
    const blocks = s?.blocks;
    if (Array.isArray(blocks)) out.push(...blocks);
  }
  return out as Block[];
}

function normalizeSchema(raw: any, pageId: string): PageSchema {
  const data = raw ?? {};

  // 兜底：schema 未给 page_id 就用传入的
  if (!data.page_id) data.page_id = pageId;

  // 兼容：v1 用 components；v2 用 sections[].blocks；两者都给时优先 components
  const components: Block[] = Array.isArray(data.components)
    ? (data.components as Block[])
    : flattenBlocksFromSections(data);

  if (!Array.isArray(components)) {
    throw new Error("Invalid schema: neither components nor sections.blocks is a valid array");
  }

  // 写回 components，保证后续渲染只认一个入口
  data.components = components;

  return data as PageSchema;
}

async function loadPageSchema(pageId: string): Promise<PageSchema> {
  const res = await fetch(`/pages/${encodeURIComponent(pageId)}.json`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load schema: ${res.status} ${res.statusText}`);

  const raw = await res.json();
  const data = normalizeSchema(raw, pageId);

  // 最小校验：components 必须是数组
  if (!data || !Array.isArray(data.components)) {
    throw new Error("Invalid schema: components missing or not an array");
  }
  return data;
}

function shouldRenderBlock(block: Block): boolean {
  if (block.type === "CardGrid") return (block.content?.items?.length ?? 0) >= 2;
  if (block.type === "Timeline") return (block.content?.items?.length ?? 0) >= 2;
  return true;
}

function isRegistryKey(x: string): x is RegistryKey {
  return x in registry;
}

/**
 * 生成 URL 友好的 slug
 */
function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // 分离重音
    .replace(/[\u0300-\u036f]/g, '') // 移除重音
    .replace(/[^\w\s-]/g, '') // 移除非单词字符
    .replace(/[\s_-]+/g, '-') // 将空格和下划线替换为连字符
    .replace(/^-+|-+$/g, ''); // 移除首尾连字符
}

/**
 * 为 block 生成唯一 ID
 */
function getBlockId(block: Block, index: number): string {
  if (block.id) return block.id;
  if (block.title) return `section-${generateSlug(block.title)}`;
  return `block-${index}`;
}

/**
 * 提取导航项（从有标题的 block 中）
 */
function extractNavItems(blocks: Block[]): Array<{ id: string; title: string; type: string }> {
  return blocks
    .filter(block => {
      // 检查顶层 title 或 content.title
      const hasTitle = block.title || (block.content as any)?.title;
      // 扩展到所有有标题的 block 类型，不仅仅是 Hero 和 Markdown
      return hasTitle && (
        block.type === 'Hero' ||
        block.type === 'Markdown' ||
        block.type === 'CardGrid' ||
        block.type === 'Timeline' ||
        block.type === 'FlashcardGrid' ||
        block.type === 'Cloze'
      );
    })
    .map((block, index) => ({
      id: getBlockId(block, index),
      // 优先使用顶层 title，其次使用 content.title
      title: block.title || (block.content as any)?.title || `Section ${index + 1}`,
      type: block.type
    }));
}

export function SchemaRenderer(props: { pageId: string; isEditing?: boolean; setIsEditing?: (value: boolean) => void }) {
  const { pageId, isEditing: externalIsEditing, setIsEditing: externalSetIsEditing } = props;

  const [schema, setSchema] = useState<PageSchema | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Use external isEditing state if provided, otherwise use local state
  const [internalIsEditing, setInternalIsEditing] = useState(false);
  const isEditing = externalIsEditing !== undefined ? externalIsEditing : internalIsEditing;
  const setIsEditing = externalSetIsEditing || setInternalIsEditing;
  const [blocks, setBlocks] = useState<Block[]>([]);

  // 提取导航项（移到顶部，遵守 Hooks 规则）
  const navItems = useMemo(() => {
    const items = extractNavItems(blocks);
    console.log('📋 [DEBUG] Extracted navigation items:', items.length, items);
    return items;
  }, [blocks]);

  // 加载 Schema 数据（必须在所有 hooks 之后，conditional returns 之前）
  useEffect(() => {
    async function loadSchema() {
      try {
        console.log('🔍 [DEBUG] Starting to load page:', pageId);
        const data = await loadPageSchema(pageId);
        console.log('📄 [DEBUG] Schema loaded:', data);
        console.log('📊 [DEBUG] Components array:', data.components);
        console.log('📏 [DEBUG] Number of components:', data.components?.length || 0);

        // Trace shouldRenderBlock filtering
        const passedBlocks = (data.components || []).filter((block: Block) => shouldRenderBlock(block));
        const filteredBlocks = (data.components || []).filter((block: Block) => !shouldRenderBlock(block));
        console.log('✅ [DEBUG] Blocks passing shouldRenderBlock:', passedBlocks.length, passedBlocks.map((b: Block) => b.type));
        console.log('❌ [DEBUG] Blocks filtered by shouldRenderBlock:', filteredBlocks.length, filteredBlocks.map((b: Block) => ({ type: b.type, reason: getFilterReason(b) })));

        setSchema(data);
        setBlocks(data.components || []);
      } catch (err) {
        console.error('❌ Schema load error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load schema');
      }
    }
    loadSchema();
  }, [pageId]);

  // Helper function to explain why a block was filtered
  function getFilterReason(block: Block): string {
    if (block.type === "CardGrid") {
      const itemCount = block.content?.items?.length ?? 0;
      return `CardGrid has only ${itemCount} items (needs >= 2)`;
    }
    if (block.type === "Timeline") {
      const itemCount = block.content?.items?.length ?? 0;
      return `Timeline has only ${itemCount} items (needs >= 2)`;
    }
    return "Unknown reason";
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 p-4">
        <div className="font-semibold mb-1">Schema load error</div>
        <div className="text-sm opacity-80">{error}</div>
      </div>
    );
  }

  if (!schema) {
    return <div className="opacity-70">Loading...</div>;
  }

  const effectivePageId = schema.page_id || pageId;

  // 更新单个 block 的处理函数
  const handleUpdateBlock = (index: number, newData: any) => {
    const newBlocks = [...blocks];
    newBlocks[index] = newData;
    setBlocks(newBlocks);

    // 同时更新 schema 中的 components
    if (schema) {
      const updatedSchema = {
        ...schema,
        components: newBlocks
      };
      setSchema(updatedSchema);

      // 保存到 LocalStorage
      try {
        localStorage.setItem(`pages/${pageId}.json`, JSON.stringify(updatedSchema));
        console.log('✅ 已更新到 LocalStorage');
      } catch (e) {
        console.warn('⚠️  保存到 LocalStorage 失败:', e);
      }
    }
  };

  // 删除单个 block 的处理函数
  const handleDeleteBlock = (index: number) => {
    if (confirm('确定要删除这个模块吗？')) {
      const newBlocks = blocks.filter((_, i) => i !== index);
      setBlocks(newBlocks);

      if (schema) {
        const updatedSchema = {
          ...schema,
          components: newBlocks
        };
        setSchema(updatedSchema);

        try {
          localStorage.setItem(`pages/${pageId}.json`, JSON.stringify(updatedSchema));
          console.log('✅ 已删除模块');
        } catch (e) {
          console.warn('⚠️  保存失败:', e);
        }
      }
    }
  };

  // AI 重写单个 block 的处理函数
  const handleRegenerateBlock = async (index: number) => {
    const block = blocks[index];

    // 询问用户指令
    const instruction = prompt(
      `请输入优化指令（留空使用默认指令）：\n\n当前模块: ${block.type}\n${block.title ? `标题: ${block.title}` : ''}`,
      '优化这个模块的内容，使其更清晰、专业'
    );

    if (instruction === null) {
      // 用户点击了取消
      return;
    }

    try {
      // 调用 llm helper 的 regenerateBlock 方法
      const llmHelper = (window as any).llm;
      if (!llmHelper || !llmHelper.pathGenerator) {
        alert('LLM Helper 未初始化，请刷新页面重试');
        return;
      }

      console.log('🔄 开始 AI 优化...');
      const optimizedBlock = await llmHelper.pathGenerator.regenerateBlock(
        block,
        instruction || '优化这个模块的内容，使其更清晰、专业'
      );

      // 更新 block
      handleUpdateBlock(index, optimizedBlock);
      console.log('✅ AI 优化完成！');
    } catch (error) {
      console.error('❌ AI 优化失败:', error);
      alert(`AI 优化失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  return (
    <>
      {/* 双栏布局：左侧导航 + 右侧内容 */}
      <div className="w-full lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12 items-start">

        {/* 左侧：固定侧边栏（仅大屏显示，靠左对齐） */}
        <aside className="hidden lg:block sticky top-24 self-start h-fit px-6">
          <SidebarNav items={navItems} />
        </aside>

        {/* 右侧：主要内容流（限制最大宽度） */}
        <div className="px-6 lg:px-0">
          <div className="max-w-4xl mx-auto space-y-16 pb-32">
          {blocks.map((block, idx) => {
            if (!isRegistryKey(block.type)) return null;
            const Comp = registry[block.type] as any;
            const blockId = getBlockId(block, idx);

            return (
              <div
                key={`${block.type}-${idx}`}
                id={blockId}
                className="scroll-mt-24" // 防止跳转时被顶部导航遮挡
              >
                <EditableBlock
                  isEditing={isEditing}
                  data={block}
                  onUpdate={(newData) => handleUpdateBlock(idx, newData)}
                  onRegenerate={() => handleRegenerateBlock(idx)}
                  onEdit={() => {
                    // TODO: 打开 JSON 编辑器
                    alert(`JSON 编辑器\n\n${JSON.stringify(block, null, 2)}`);
                  }}
                  onDelete={() => handleDeleteBlock(idx)}
                >
                  <Comp block={block} pageId={effectivePageId} />
                </EditableBlock>
              </div>
            );
          })}
          </div>
        </div>

      </div>
    </>
  );
}
