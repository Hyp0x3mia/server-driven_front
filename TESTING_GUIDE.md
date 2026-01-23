# 快速开始指南

## 📚 系统概述

这是一个**纯前端的学习资源生成系统**，支持：

- ✅ 基于**知识路径**（Knowledge Path）生成完整学习页面
- ✅ 多种内容类型：Hero、Markdown、CardGrid、Flashcard、Timeline、Cloze
- ✅ **自动 Schema 转换**（简化格式 → 系统格式）
- ✅ **增强的 JSON 解析**（容错机制处理各种 LLM 输出问题）
- ✅ 本地存储和下载功能

---

## 🚀 三步快速开始

### 步骤 1: 配置 API

编辑 `.env` 文件：

```bash
# 选择提供商
VITE_LLM_PROVIDER=customOpenAI

# 自定义 API 配置（SiliconFlow / DeepSeek 示例）
VITE_CUSTOM_API_KEY=sk-your-api-key
VITE_CUSTOM_BASE_URL=https://api.siliconflow.cn/v1
VITE_CUSTOM_MODEL=deepseek-ai/DeepSeek-V3.2
```

### 步骤 2: 重启开发服务器

```bash
npm run dev
```

**重要**：修改 `.env` 后必须重启！

### 步骤 3: 在浏览器控制台测试

打开浏览器后，在控制台运行：

```javascript
// 快速测试（使用内置测试脚本）
fetch('/test-generation.js')
  .then(r => r.text())
  .then(eval)

// 或者手动测试
const data = await llm.generateFromPath({
  knowledge_path: [
    {
      knowledge_id: "K001",
      name: "React Hooks",
      description: "React Hooks 简介",
      domain: "前端开发",
      subdomain: "React",
      difficulty: 2,
      importance: 0.9,
      estimated_time: 10,
      is_key_point: true,
      is_difficult: false,
      prerequisites: [],
      successors: [],
      keywords: ["React", "Hooks"],
      application_scenarios: [],
      common_misconceptions: [],
      mastery_criteria: "理解 Hooks 基本概念"
    }
  ],
  style: 'comprehensive'
})

llm.download(data, 'test.json')
```

---

## 📖 详细文档

### 核心功能

| 文档 | 说明 |
|------|------|
| [PATH_BASED_GENERATION.md](./PATH_BASED_GENERATION.md) | 基于知识路径的生成完整指南 |
| [JSON_PARSING_FIX.md](./JSON_PARSING_FIX.md) | JSON 解析增强说明和调试技巧 |
| [PATH_GENERATOR_OPTIMIZATION.md](./PATH_GENERATOR_OPTIMIZATION.md) | 已应用的优化（剪枝、Schema 升级） |

### 配置和使用

| 文档 | 说明 |
|------|------|
| [LLM_INTEGRATION.md](./LLM_INTEGRATION.md) | LLM 集成总览 |
| [LLM_CONFIG_GUIDE.md](./LLM_CONFIG_GUIDE.md) | 配置指南 |

### 测试和验证

| 文档 | 说明 |
|------|------|
| [AUTOMATED_TESTING.md](./AUTOMATED_TESTING.md) | 自动化测试指南 |

---

## 🎯 常见问题

### Q1: 如何调整 Prompt？

**位置**: `src/lib/path-based-generator.ts`

- **系统提示**: 修改 `buildSystemPrompt()` 方法 (line 369)
- **用户提示**: 修改 `buildMessages()` 方法 (line 189)
- **知识路径分析**: 修改 `analyzePath()` 方法 (line 141)

### Q2: 如何使用自己的知识路径？

```javascript
const myPath = [
  {
    knowledge_id: "xxx",
    name: "知识点名称",
    description: "详细描述",
    // ... 其他必需字段
  }
]

const data = await llm.generateFromPath({
  knowledge_path: myPath
})
```

完整字段列表见 [PATH_BASED_GENERATION.md](./PATH_BASED_GENERATION.md#10-34)

### Q3: JSON 解析失败怎么办？

1. **查看错误信息**：会包含 "Response preview" 帮助诊断
2. **尝试简化**：使用 `style: 'concise'` 减少内容
3. **减少知识点**：从少量开始测试
4. **检查文档**：参考 [JSON_PARSING_FIX.md](./JSON_PARSING_FIX.md)

### Q4: 如何调整生成内容类型？

在 `buildMessages()` 的 Prompt 要求中修改 (line 259-291)：

```typescript
4. **CardGrid 特别要求** ⭐:
   - visual_mode: "terminal" | "schematic" | "icon"
   - icon: Lucide React 图标名称（PascalCase）
```

---

## 🛠️ 测试工具

### 1. 内置测试脚本

```bash
# 方法 1: 在浏览器控制台
fetch('/test-generation.js').then(r => r.text()).then(eval)

# 方法 2: 直接打开文件
# 复制 public/test-generation.js 内容到控制台
```

测试脚本会自动：
- ✅ 检查配置
- ✅ 使用 3 个测试知识点生成内容
- ✅ 显示详细结果
- ✅ 自动下载生成的 JSON
- ✅ 失败时提供诊断建议

### 2. Schema 验证器

如果有 Agent 生成的 JSON，可以验证和预览：

```javascript
// TODO: 验证器组件开发中
// 参见 PLAN.md 中的 SchemaValidator 组件
```

---

## 📊 输入输出格式

### 输入：知识路径

```typescript
interface KnowledgePoint {
  knowledge_id: string;          // 知识点 ID
  name: string;                  // 名称
  description: string;           // 描述
  domain: string;                // 领域
  subdomain: string;             // 子领域
  difficulty: number;            // 难度 1-5
  cognitive_level: string;       // 认知层次
  importance: number;           // 重要度 0-1
  abstraction: number;          // 抽象层级
  estimated_time: number;       // 预估时间（分钟）
  is_key_point: boolean;        // 是否重点
  is_difficult: boolean;        // 是否难点
  prerequisites: string[];      // 前置知识点
  successors: string[];         // 后续知识点
  keywords: string[];           // 关键词
  application_scenarios: string[]; // 应用场景
  common_misconceptions: string[];  // 常见误区
  mastery_criteria: string;     // 掌握标准
}
```

### 输出：简化 Schema

```typescript
interface SimplifiedPage {
  page_id: string;
  title: string;
  summary: string;
  blocks: SimplifiedBlock[];
}

interface SimplifiedBlock {
  type: 'hero' | 'markdown' | 'flashcard' | 'cardgrid' | 'timeline' | 'cloze';
  title?: string;
  content: string | BlockContent;
  metadata?: {
    agent_type?: 'knowledge' | 'code' | 'quiz';
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    keywords?: string[];
    // ... 其他可选字段
  };
}
```

### 自动转换：系统 Schema

生成的简化格式会自动转换为系统完整格式：

```javascript
const { simplified, converted } = await llm.generateFromPathAndConvert({
  knowledge_path: myPath
})

// simplified: LLM 直接生成的简化格式
// converted: 转换后的系统格式（可直接用于前端渲染）
```

---

## 🎨 生成示例

### 示例 1：简单知识点

```javascript
const simplePath = [
  {
    knowledge_id: "K001",
    name: "React useState Hook",
    description: "useState 是 React 提供的 Hook，用于在函数组件中添加状态",
    domain: "前端开发",
    subdomain: "React",
    difficulty: 1,
    importance: 0.9,
    estimated_time: 10,
    is_key_point: true,
    is_difficult: false,
    prerequisites: [],
    successors: [],
    keywords: ["useState", "状态", "React"],
    application_scenarios: ["表单输入"],
    common_misconceptions: [],
    mastery_criteria: "能够使用 useState 管理组件状态"
  }
]

const data = await llm.generateFromPath({
  knowledge_path: simplePath,
  style: 'comprehensive'
})

// 生成包含：
// - Hero: React useState Hook
// - Markdown: useState 详解
// - CardGrid: useState 使用场景
// - Flashcard: useState 自测题
```

### 示例 2：多个知识点（推荐 5-10 个）

```javascript
const mediumPath = [
  { /* K001: 基础概念 */ },
  { /* K002: 核心功能 */ },
  { /* K003: 常见用法 */ },
  { /* K004: 注意事项 */ },
  { /* K005: 实战案例 */ }
]

const data = await llm.generateFromPath({
  knowledge_path: mediumPath,
  style: 'comprehensive',
  focus_points: ['K001', 'K005'] // 重点讲解这些
})

// focus_points 指定的知识点会获得更详细的讲解
```

### 示例 3：大型知识路径（分批生成）

```javascript
const largePath = [...] // 20+ 个知识点

// 分批生成
const batches = []
for (let i = 0; i < largePath.length; i += 7) {
  const batch = largePath.slice(i, i + 7)
  const result = await llm.generateFromPath({
    knowledge_path: batch,
    style: 'concise'
  })
  batches.push(result)
}

// 手动合并（如果需要）
const merged = {
  page_id: 'complete-course',
  title: '完整课程',
  summary: batches.map(b => b.summary).join('\n'),
  blocks: batches.flatMap(b => b.blocks)
}
```

---

## 🔧 高级用法

### 自定义剪枝策略

修改 `src/lib/path-based-generator.ts` line 220:

```typescript
// 更严格的剪枝（只对 key_point 详细）
const isImportant = kp.is_key_point;

// 更宽松的剪枝（所有都详细）
const isImportant = true;

// 添加自定义条件
const isImportant = kp.is_key_point ||
                    kp.is_difficult ||
                    kp.importance > 0.8 ||
                    isFocus;
```

### 添加新的内容类型

1. 在简化 Schema 中定义类型（`src/schemas/simplified.ts`）
2. 在转换器中添加转换逻辑（`src/lib/schema-converter.ts`）
3. 在 Prompt 中添加要求（`src/lib/path-based-generator.ts`）

### 使用 Agent 系统

参见 `src/prompts/agent-prompts.ts` 中的预定义模板：

- `KNOWLEDGE_AGENT_PROMPT` - 知识讲解
- `CODE_AGENT_PROMPT` - 代码练习
- `QUIZ_AGENT_PROMPT` - 测验生成
- `REVIEWER_AGENT_PROMPT` - 内容审核
- `ORCHESTRATOR_AGENT_PROMPT` - 内容规划

---

## 📈 性能优化

### Token 使用优化

已应用的优化（见 [PATH_GENERATOR_OPTIMIZATION.md](./PATH_GENERATOR_OPTIMIZATION.md)）：

1. **上下文剪枝**：非重点知识点只包含基本信息
   - 节省 ~57% tokens（对于 15 个知识点的路径）

2. **智能字段选择**：只对重要知识点包含详细字段

3. **Prompt 优化**：精简的 Schema 示例

### 建议的路径大小

| 知识点数量 | 推荐风格 | 预估 tokens | 成本（DeepSeek） |
|-----------|---------|------------|----------------|
| 1-5       | comprehensive | ~1000-2000 | 低 |
| 5-10      | comprehensive | ~2000-3500 | 中 |
| 10-15     | concise | ~2500-4000 | 中 |
| 15+       | 分批生成 | - | 高（建议分批） |

---

## ✅ 验证清单

使用前请确认：

- [ ] `.env` 文件已正确配置
- [ ] 开发服务器已重启（`npm run dev`）
- [ ] 控制台显示正确的配置信息
- [ ] 知识路径包含所有必需字段
- [ ] 知识点数量适中（建议 5-10 个）
- [ ] 已阅读相关文档

生成后请确认：

- [ ] 控制台显示 "✅ 生成完成"
- [ ] 生成的数据包含 `page_id`, `title`, `blocks`
- [ ] blocks 数组包含预期类型的内容
- [ ] 可以下载 JSON 文件
- [ ] JSON 文件格式正确

---

## 🆘 获取帮助

### 问题排查步骤

1. **查看控制台错误**：详细的错误信息是关键
2. **查阅相关文档**：
   - JSON 解析错误 → [JSON_PARSING_FIX.md](./JSON_PARSING_FIX.md)
   - 配置问题 → [LLM_CONFIG_GUIDE.md](./LLM_CONFIG_GUIDE.md)
   - 使用问题 → [PATH_BASED_GENERATION.md](./PATH_BASED_GENERATION.md)
3. **使用测试脚本**：`public/test-generation.js` 自动诊断
4. **简化测试**：从 1-2 个知识点开始

### 有用的调试命令

```javascript
// 检查配置
console.log(llm.config)

// 测试 API 连接
llm.generateFromPath({ knowledge_path: [testPoint] })

// 查看原始响应（在 path-based-generator.ts 中添加）
console.log('LLM 原始响应:', response.content)

// 测试 Schema 转换
import { SchemaConverter } from './lib/schema-converter'
const converted = SchemaConverter.convertPage(simplifiedData)
```

---

## 🎉 开始使用

现在你已经准备好了！按照以下步骤开始：

1. **配置 API**：编辑 `.env` 文件
2. **重启服务器**：`npm run dev`
3. **运行测试**：在浏览器控制台执行 `fetch('/test-generation.js').then(r => r.text()).then(eval)`
4. **查看结果**：生成的 JSON 会自动下载
5. **自定义内容**：使用你自己的知识路径

祝你生成愉快！🚀

---

**最后更新**: 2025-01-20
**相关文档**:
- [JSON_PARSING_FIX.md](./JSON_PARSING_FIX.md)
- [PATH_BASED_GENERATION.md](./PATH_BASED_GENERATION.md)
- [PATH_GENERATOR_OPTIMIZATION.md](./PATH_GENERATOR_OPTIMIZATION.md)
