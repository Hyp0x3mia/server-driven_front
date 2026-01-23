# LLM 内容生成集成指南

## 📖 概述

本项目已集成真实的 LLM API，支持自动生成教育内容。你可以使用 OpenAI GPT、Anthropic Claude 或本地 Ollama 模型来生成类似 test.json 的学习内容。

## ✨ 功能特性

- 🤖 **多 Agent 支持**：知识讲解、代码练习、测验生成
- 🔌 **多提供商支持**：OpenAI、Anthropic、Azure OpenAI、Ollama（本地）
- 🔄 **自动 Schema 转换**：简化格式 → 系统格式
- ⚡ **错误重试机制**：自动处理网络错误和速率限制
- 📊 **使用量追踪**：Token 使用统计和耗时监控
- 💾 **一键下载**：生成的内容可直接下载为 JSON 文件

## 🚀 快速开始

### 方法一：浏览器控制台（推荐）

1. **启动应用**
   ```bash
   npm run dev
   ```

2. **打开浏览器控制台**（F12）

3. **配置 LLM API**

   **使用 OpenAI:**
   ```javascript
   llm.configure({
     apiKey: 'sk-your-openai-api-key',
     provider: 'openai',
     model: 'gpt-3.5-turbo'
   })
   ```

   **使用 Anthropic Claude:**
   ```javascript
   llm.configure({
     apiKey: 'sk-ant-your-anthropic-api-key',
     provider: 'anthropic',
     model: 'claude-3-sonnet-20240229'
   })
   ```

   **使用本地 Ollama（无需 API Key）:**
   ```javascript
   llm.configure({
     provider: 'ollama',
     model: 'llama3'
   })
   ```

4. **生成内容**

   ```javascript
   // 生成知识讲解内容
   const data = await llm.generate({
     topic: '自然语言处理基础',
     agentType: 'knowledge',
     difficulty: 'intermediate'
   })

   // 查看结果
   console.log(data)

   // 下载为 JSON
   llm.download(data, 'nlp-basics.json')
   ```

5. **生成并转换为系统格式**

   ```javascript
   // 生成并自动转换
   const { simplified, converted } = await llm.generateAndConvert({
     topic: 'React Hooks 深入解析',
     agentType: 'code',
     difficulty: 'advanced'
   })

   // 下载转换后的格式（可直接用于系统）
   llm.download(converted, 'react-hooks.json')
   ```

### 方法二：编程方式

你也可以在自己的代码中使用 LLM 生成器：

```typescript
import { createAgentGenerator } from './lib/agent-generator';

// 创建生成器
const generator = createAgentGenerator({
  apiKey: 'sk-your-api-key',
  provider: 'openai',
  model: 'gpt-3.5-turbo'
});

// 生成内容
const result = await generator.generate({
  topic: '机器学习基础',
  agentType: 'knowledge',
  difficulty: 'beginner'
});

if (result.success) {
  console.log('生成成功:', result.data);
  console.log('使用 tokens:', result.metadata?.tokensUsed);
}
```

## 🎯 Agent 类型

### 1. 知识讲解 Agent (knowledge)

生成概念讲解和理论学习内容。

**包含组件**：Hero、Markdown、CardGrid、Timeline、Flashcard

```javascript
const data = await llm.generate({
  topic: '深度学习的历史发展',
  agentType: 'knowledge'
})
```

### 2. 代码练习 Agent (code)

生成编程示例和代码练习。

**包含组件**：Hero、Markdown、FlashcardGrid（代码卡片）

```javascript
const data = await llm.generate({
  topic: 'JavaScript 闭包详解',
  agentType: 'code'
})
```

### 3. 测验生成 Agent (quiz)

生成测验和练习题。

**包含组件**：Hero、Flashcard、Cloze

```javascript
const data = await llm.generate({
  topic: 'Python 基础语法',
  agentType: 'quiz'
})
```

## 📋 API 参考

### llm.configure(config)

配置 LLM API 连接。

**参数**：
- `apiKey` (string): API 密钥（Ollama 不需要）
- `provider` (string): 提供商 - `'openai'` | `'anthropic'` | `'ollama'` | `'azure-openai'`
- `model` (string, 可选): 模型名称
- `baseURL` (string, 可选): 自定义 API 地址

### llm.generate(options)

生成教育内容。

**参数**：
- `topic` (string): 生成主题
- `agentType` (string, 可选): Agent 类型 - `'knowledge'` | `'code'` | `'quiz'`，默认 `'knowledge'`
- `difficulty` (string, 可选): 难度 - `'beginner'` | `'intermediate'` | `'advanced'`，默认 `'intermediate'`
- `additionalInstructions` (string, 可选): 额外指令

**返回**：SimplifiedPage 对象

### llm.generateAndConvert(options)

生成内容并转换为系统格式。

**参数**：同 `llm.generate()`

**返回**：
- `simplified`: 简化格式（LLM 生成）
- `converted`: 系统格式（可直接使用）

### llm.download(data, filename)

下载 JSON 文件。

**参数**：
- `data` (any): 要下载的数据
- `filename` (string): 文件名

### llm.status()

查看当前状态。

**返回**：
```javascript
{ configured: boolean }
```

## 🔧 配置示例

### OpenAI GPT-3.5

```javascript
llm.configure({
  apiKey: 'sk-...',
  provider: 'openai',
  model: 'gpt-3.5-turbo'
})
```

### OpenAI GPT-4

```javascript
llm.configure({
  apiKey: 'sk-...',
  provider: 'openai',
  model: 'gpt-4-turbo-preview'
})
```

### Anthropic Claude 3 Sonnet

```javascript
llm.configure({
  apiKey: 'sk-ant-...',
  provider: 'anthropic',
  model: 'claude-3-sonnet-20240229'
})
```

### 本地 Ollama

首先启动 Ollama 服务：
```bash
ollama serve
```

然后配置：
```javascript
llm.configure({
  provider: 'ollama',
  model: 'llama3'
})
```

### 自定义 API 端点

```javascript
llm.configure({
  apiKey: 'your-key',
  provider: 'openai',
  baseURL: 'https://your-custom-endpoint.com/v1',
  model: 'your-model'
})
```

## 💡 使用技巧

### 1. 批量生成多个主题

```javascript
const topics = [
  '机器学习基础',
  '深度学习入门',
  '自然语言处理'
];

for (const topic of topics) {
  const data = await llm.generate({ topic });
  llm.download(data, `${topic}.json`);
  await new Promise(r => setTimeout(r, 1000)); // 避免速率限制
}
```

### 2. 添加额外要求

```javascript
const data = await llm.generate({
  topic: 'React 性能优化',
  agentType: 'code',
  additionalInstructions: '请包含 useMemo, useCallback, React.memo 的示例'
});
```

### 3. 检查生成结果

```javascript
const { simplified, converted } = await llm.generateAndConvert({
  topic: 'TypeScript 泛型'
});

// 查看生成的 blocks
console.log('Blocks:', simplified.blocks.map(b => b.type));
console.log('总数:', simplified.blocks.length);

// 验证转换
console.log('转换后 sections:', converted.sections.length);
```

## 🔒 安全性

- API Key 不会存储或发送到任何地方，仅用于直接调用 LLM API
- 所有 API 调用都在浏览器中直接进行，不经过中间服务器
- 建议在本地开发环境使用，生产环境请自行评估安全性

## ⚠️ 注意事项

### 1. API Key 安全

- 不要在公开代码中硬编码 API Key
- 生产环境应从环境变量或安全配置服务获取
- 定期轮换 API Key

### 2. 速率限制

- OpenAI 免费账号有速率限制
- 如遇到 429 错误，系统会自动重试
- 批量生成时建议添加延迟

### 3. Token 使用

- 每次生成消耗的 tokens 取决于内容长度
- GPT-3.5 较便宜，GPT-4 和 Claude 3 Opus 较贵
- 建议先用 GPT-3.5 测试，确认无误后再用 GPT-4

### 4. 内容质量

- LLM 生成的内容可能需要人工审核和调整
- 技术准确性建议由专业人士验证
- 可以通过 `additionalInstructions` 调整生成风格

## 🐛 故障排查

### 问题：API Key 无效

**错误**：`API Key is required`

**解决**：
1. 检查 API Key 是否正确
2. 确认 API Key 有足够的额度
3. 尝试重新生成 API Key

### 问题：网络错误

**错误**：`Network error`

**解决**：
1. 检查网络连接
2. 如果使用 Ollama，确认服务已启动
3. 检查防火墙设置

### 问题：生成失败

**错误**：`Failed to parse LLM response`

**解决**：
1. LLM 可能未返回有效 JSON
2. 尝试更换模型（如从 GPT-3.5 换到 GPT-4）
3. 简化主题描述

### 问题：速率限制

**错误**：`Rate limit exceeded`

**解决**：
1. 等待一段时间后重试
2. 系统会自动重试最多 3 次
3. 考虑升级 API 套餐

## 📚 更多资源

- [OpenAI API 文档](https://platform.openai.com/docs)
- [Anthropic Claude 文档](https://docs.anthropic.com)
- [Ollama 文档](https://ollama.ai/docs)
- [AUTOMATED_TESTING.md](./AUTOMATED_TESTING.md) - 测试指南
- [test.json](./public/pages/test.json) - 示例生成内容

## 🎉 开始使用

现在你已经了解了所有功能，开始生成你的第一个内容吧！

```javascript
// 配置
llm.configure({ apiKey: 'sk-...' })

// 生成
const data = await llm.generate({ topic: '你感兴趣的主题' })

// 下载
llm.download(data, 'my-first-content.json')
```

祝你使用愉快！🚀
