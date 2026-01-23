import React, { useEffect, useMemo, useState } from "react";
import { registry, type Block, type PageSchema, type RegistryKey } from "./registry";
import { EditableBlock } from "../components/editor/EditableBlock";
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

export function SchemaRenderer(props: { pageId: string }) {
  const { pageId } = props;

  const [schema, setSchema] = useState<PageSchema | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    let cancelled = false;
    setSchema(null);
    setError(null);

    loadPageSchema(pageId)
      .then((s) => {
        if (!cancelled) {
          setSchema(s);
          const cs = s?.components ?? [];
          setBlocks(cs.filter(shouldRenderBlock));
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? String(e));
      });

    return () => {
      cancelled = true;
    };
  }, [pageId]);

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
      {/* 编辑模式开关 */}
      <div className="fixed top-4 right-4 z-50 bg-slate-900/90 backdrop-blur border border-slate-700 p-2 rounded-full flex items-center space-x-2 shadow-2xl">
        <span className="text-xs text-slate-400 pl-2 font-mono">EDIT MODE</span>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={cn(
            "w-12 h-6 rounded-full transition-colors flex items-center px-1",
            isEditing ? "bg-indigo-600 justify-end" : "bg-slate-700 justify-start"
          )}
        >
          <div className="w-4 h-4 bg-white rounded-full shadow-md" />
        </button>
      </div>

      {/* 内容区域 */}
      <div className="space-y-16 pb-32">
        {blocks.map((block, idx) => {
          if (!isRegistryKey(block.type)) return null;
          const Comp = registry[block.type] as any;

          return (
            <EditableBlock
              key={`${block.type}-${idx}`}
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
          );
        })}
      </div>
    </>
  );
}
