# 基于知识路径的内容生成指南

## 🎯 概述

现在你可以基于**知识路径**（Knowledge Path）生成完整的学习页面，而不是简单的一个主题。这样生成的内容更符合实际教学需求，更系统地覆盖知识点。

## 📊 输入数据格式

### 1. 知识路径（Knowledge Path）

知识路径是一个知识点数组，每个知识点包含：

```typescript
interface KnowledgePoint {
  knowledge_id: string;          // 知识点ID
  name: string;                  // 知识点名称
  description: string;           // 描述
  domain: string;                // 领域
  subdomain: string;             // 子领域
  difficulty: number;            // 难度 1-5
  cognitive_level: string;       // 认知层次
  importance: number;            // 重要度 0-1
  abstraction: number;           // 抽象层级
  estimated_time: number;        // 预估时间（分钟）
  is_key_point: boolean;         // 是否重点
  is_difficult: boolean;         // 是否难点
  prerequisites: string[];       // 前置知识点
  successors: string[];          // 后续知识点
  keywords: string[];            // 关键词
  application_scenarios: string[]; // 应用场景
  common_misconceptions: string[];  // 常见误区
  mastery_criteria: string;      // 掌握标准
}
```

### 2. 推荐资源（可选）

```typescript
interface Resource {
  id: string;
  title: string;
  url: string;
  cover_image: string;
  description: string;
  type: 'video' | 'article' | 'book' | 'course' | 'practice';
}
```

## 🚀 使用方法

### 方法 1：浏览器控制台（推荐）

**1. 配置 API（如果还没配置）**
```javascript
llm.configure({
  apiKey: 'sk-your-api-key',
  baseURL: 'https://your-api.com/v1',
  model: 'gpt-3.5-turbo'
})
```

**2. 准备你的知识路径**
```javascript
const knowledgePath = [
  {
    "knowledge_id": "D02-M01-K008",
    "name": "自然语言处理概述",
    "description": "自然语言处理是人工智能十分重要的研究领域...",
    "domain": "自然语言处理",
    "subdomain": "领域概述",
    "difficulty": 1,
    "cognitive_level": "COG_L1",
    "importance": 0.8,
    "abstraction": 4,
    "estimated_time": 15,
    "is_key_point": true,
    "is_difficult": false,
    "prerequisites": [],
    "successors": [],
    "keywords": ["自然语言处理", "人工智能", "大语言模型"],
    "application_scenarios": ["文本分析", "信息处理"],
    "common_misconceptions": [],
    "mastery_criteria": "能够概述自然语言处理的定义、历史地位及主要技术方向"
  },
  // ... 更多知识点
]
```

**3. 生成内容**
```javascript
const data = await llm.generateFromPath({
  knowledge_path: knowledgePath
})

// 下载
llm.download(data, 'nlp-overview.json')
```

**4. 生成并转换**
```javascript
const { simplified, converted } = await llm.generateFromPathAndConvert({
  knowledge_path: knowledgePath,
  style: 'comprehensive'
})

// 下载转换后的格式
llm.download(converted, 'nlp-overview-system-format.json')
```

### 方法 2：带资源和自定义选项

```javascript
const resources = [
  {
    id: 'res1',
    title: 'NLP 入门视频',
    url: 'https://example.com/video1',
    cover_image: 'https://example.com/cover1.jpg',
    description: '快速了解 NLP 基础概念',
    type: 'video'
  },
  // ... 更多资源
]

const { simplified, converted } = await llm.generateFromPathAndConvert({
  knowledge_path: knowledgePath,
  resources: resources,
  focus_points: ['D02-M01-K008', 'D02-M02-K002'], // 重点讲解这些知识点
  style: 'comprehensive' // 或 'concise', 'practice-oriented'
})

llm.download(converted, 'nlp-with-resources.json')
```

## 🎨 生成选项

### style（内容风格）

- **`comprehensive`**（默认）：全面详细，每个知识点都深入讲解
- **`concise`**：精简扼要，突出核心要点
- **`practice-oriented`**：实践导向，强调应用和练习

### focus_points（重点关注）

指定需要重点讲解的知识点 ID：

```javascript
{
  knowledge_path: path,
  focus_points: ['D02-M01-K008', 'D02-M02-K002'] // 这些知识点会更详细
}
```

## 📝 Prompt 在哪里调整？

### 1. 修改系统提示

位置：`src/lib/path-based-generator.ts` 的 `buildSystemPrompt()` 方法

```typescript
private buildSystemPrompt(style?: string): string {
  let basePrompt = `你是一个专业的教育内容创作专家...

  // 👈 在这里修改系统提示
  `;

  // 根据风格调整
  if (style === 'comprehensive') {
    // 👈 调整全面风格的提示
  }
}
```

### 2. 修改用户提示模板

位置：`src/lib/path-based-generator.ts` 的 `buildMessages()` 方法

```typescript
private buildMessages(
  options: PathBasedGenerationOptions,
  analysis: any
): ChatMessage[] {
  // 👈 在这里构建用户提示
  // 可以调整如何呈现知识路径信息
  // 可以调整生成要求

  return [systemMessage, userMessage];
}
```

### 3. 调整知识路径分析

位置：`src/lib/path-based-generator.ts` 的 `analyzePath()` 方法

```typescript
private analyzePath(options: PathBasedGenerationOptions) {
  // 👈 在这里调整如何分析知识路径
  // 可以添加新的分析维度
  // 可以调整分组逻辑

  return {
    byDifficulty,
    keyPoints,
    difficultPoints,
    // ...
  };
}
```

## 🎯 完整示例

### 示例 1：生成 NLP 概述页面

```javascript
// 1. 配置（如果需要）
llm.configure({
  apiKey: 'sk-...',
  baseURL: 'https://api.openai.com/v1',
  model: 'gpt-3.5-turbo'
})

// 2. 准备知识路径
const nlpPath = [
  {
    knowledge_id: "K001",
    name: "NLP 定义",
    description: "自然语言处理是...",
    domain: "自然语言处理",
    subdomain: "基础概念",
    difficulty: 1,
    importance: 0.9,
    estimated_time: 15,
    is_key_point: true,
    is_difficult: false,
    keywords: ["NLP", "AI"],
    mastery_criteria: "能够定义 NLP"
  },
  {
    knowledge_id: "K002",
    name: "NLP 历史",
    description: "NLP 的发展分为四个阶段...",
    domain: "自然语言处理",
    subdomain: "历史发展",
    difficulty: 2,
    importance: 0.8,
    estimated_time: 20,
    is_key_point: true,
    is_difficult: false,
    keywords: ["历史", "发展阶段"],
    mastery_criteria: "能够列举四个阶段"
  }
]

// 3. 生成
const data = await llm.generateFromPath({
  knowledge_path: nlpPath,
  style: 'comprehensive'
})

// 4. 查看结果
console.log(data)

// 5. 下载
llm.download(data, 'nlp-intro.json')
```

### 示例 2：带资源的完整页面

```javascript
const knowledgePath = [...] // 你的知识路径

const resources = [
  {
    id: 'r1',
    title: '斯坦福 NLP 课程',
    url: 'https://online.stanford.edu/courses/',
    cover_image: 'https://example.com/nlp-course.jpg',
    description: '斯坦福大学的 NLP 在线课程，涵盖基础到前沿',
    type: 'course'
  },
  {
    id: 'r2',
    title: 'NLP 论文精选',
    url: 'https://arxiv.org/list/cs.CL/recent',
    cover_image: 'https://example.com/papers.jpg',
    description: '最新的 NLP 研究论文',
    type: 'article'
  }
]

const { simplified, converted } = await llm.generateFromPathAndConvert({
  knowledge_path: knowledgePath,
  resources: resources,
  style: 'comprehensive',
  focus_points: ['K001'] // K001 会被重点讲解
})

// 下载系统格式
llm.download(converted, 'nlp-complete.json')
```

## 🔍 生成内容说明

### 会生成哪些组件？

LLM 会根据知识路径智能生成以下组件：

1. **Hero**：页面标题、副标题、核心特点（3-5个）
2. **Markdown**：按子领域组织的知识讲解
3. **CardGrid**：每个子领域的知识点卡片
4. **Timeline**：如果有历史发展知识，添加时间线
5. **Flashcard**：关键概念自测卡片（3-5个）
6. **FlashcardGrid**：难点的代码/实例深入卡片

### 内容组织逻辑

- 按照子领域分组
- 先易后难，循序渐进
- 重点知识点（`is_key_point=true`）更详细
- 难点（`is_difficult=true`）有额外示例
- 包含常见误区和正确理解
- 在适当位置添加自测题

## ⚙️ 高级定制

### 1. 修改 Prompt

编辑 `src/lib/path-based-generator.ts`：

```typescript
// 在 buildSystemPrompt() 中修改
private buildSystemPrompt(style?: string): string {
  return `你的自定义系统提示...

  可以在这里：
  - 调整教学风格
  - 修改内容要求
  - 添加特殊规则
  `;
}
```

### 2. 调整生成逻辑

```typescript
// 在 buildMessages() 中修改
private buildMessages(options, analysis) {
  // 可以：
  // 1. 改变知识路径的呈现方式
  // 2. 添加额外的生成要求
  // 3. 调整组件生成规则

  return [systemMessage, userMessage];
}
```

### 3. 自定义分析维度

```typescript
// 在 analyzePath() 中添加新的分析
private analyzePath(options) {
  return {
    // 现有的分析...

    // 添加新的分析维度
    learningPath: this.extractLearningPath(path),
    conceptMap: this.buildConceptMap(path),
    difficultyProgression: this.analyzeDifficulty(path)
  };
}
```

## 💡 最佳实践

### 1. 知识路径设计

- 按逻辑顺序组织（从基础到高级）
- 使用 `is_key_point` 标记核心内容
- 使用 `is_difficult` 标记难点
- 填写 `prerequisites` 和 `successors` 表示依赖关系
- 提供详细的 `mastery_criteria`

### 2. 资源选择

- 每个子领域 1-2 个资源
- 优先选择高质量资源
- 提供准确的封面图 URL
- 简洁描述资源价值

### 3. 生成策略

- 少量知识点（< 5）：使用 `comprehensive`
- 中等数量（5-10）：使用 `comprehensive` + `focus_points`
- 大量知识点（> 10）：分批生成或使用 `concise`

### 4. 成本优化

- 先用小路径测试 Prompt
- 使用 `gpt-3.5-turbo` 测试，确认后再用 `gpt-4`
- 大路径可以分批生成

## 🆘 故障排查

### 生成内容不完整

**原因**：Token 限制或 Prompt 不清晰

**解决**：
- 减少 `knowledge_path` 长度
- 使用 `focus_points` 重点关注
- 尝试 `style: 'concise'`

### JSON 解析失败

**原因**：LLM 返回格式不正确

**解决**：
- 在 Prompt 中强调 JSON 格式
- 提供更多示例
- 尝试不同的模型（如 GPT-4）

### 内容质量不佳

**原因**：Prompt 需要优化

**解决**：
- 查看 `buildSystemPrompt()` 和 `buildMessages()`
- 添加更具体的要求
- 调整 `style` 参数

## 📚 相关文档

- [LLM_INTEGRATION.md](./LLM_INTEGRATION.md) - LLM 集成总览
- [LLM_CONFIG_GUIDE.md](./LLM_CONFIG_GUIDE.md) - 配置指南
- [AUTOMATED_TESTING.md](./AUTOMATED_TESTING.md) - 测试指南

## 🎉 开始使用

```javascript
// 配置 API
llm.configure({ apiKey: 'sk-...' })

// 准备知识路径
const path = [...] // 从你的上游系统获取

// 生成
const data = await llm.generateFromPath({
  knowledge_path: path,
  style: 'comprehensive'
})

// 下载
llm.download(data, 'learning-page.json')
```

祝你生成愉快！🚀
