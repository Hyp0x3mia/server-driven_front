import React, { useEffect, useMemo, useState } from "react";
import { registry, type Block, type PageSchema, type RegistryKey } from "./registry";

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

  useEffect(() => {
    let cancelled = false;
    setSchema(null);
    setError(null);

    loadPageSchema(pageId)
      .then((s) => {
        if (!cancelled) setSchema(s);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? String(e));
      });

    return () => {
      cancelled = true;
    };
  }, [pageId]);

  const blocks = useMemo(() => {
    const cs = schema?.components ?? [];
    return cs.filter(shouldRenderBlock);
  }, [schema]);

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

  return (
    <>
      {blocks.map((block, idx) => {
        if (!isRegistryKey(block.type)) return null;
        const Comp = registry[block.type] as any;
        return <Comp key={`${block.type}-${idx}`} block={block} pageId={effectivePageId} />;
      })}
    </>
  );
}
