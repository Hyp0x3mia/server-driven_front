# 🎉 LLM 集成配置完成！

## 快速开始（3 步配置）

### 1️⃣ 创建配置文件

```bash
cp .env.example .env
```

### 2️⃣ 编辑 `.env` 文件

**使用 OpenAI 兼容 API（推荐）：**
```env
VITE_LLM_PROVIDER=customOpenAI
VITE_CUSTOM_API_KEY=sk-your-api-key-here
VITE_CUSTOM_BASE_URL=https://your-api-endpoint.com/v1
VITE_CUSTOM_MODEL=gpt-3.5-turbo
```

**或使用本地 Ollama（免费）：**
```env
VITE_LLM_PROVIDER=ollama
```

### 3️⃣ 启动并使用

```bash
npm run dev
```

打开浏览器控制台（F12），直接开始生成：

```javascript
const data = await llm.generate({ topic: '你感兴趣的主题' })
llm.download(data, 'output.json')
```

## 📁 文件说明

### 核心文件

| 文件 | 说明 |
|------|------|
| [`src/lib/llm-config.ts`](src/lib/llm-config.ts:1) | **主要配置文件** - 在这里直接配置 API |
| [`.env.example`](.env.example:1) | 环境变量模板 |
| [`src/lib/llm-helper.ts`](src/lib/llm-helper.ts:1) | 浏览器控制台接口 |
| [`src/lib/llm-client.ts`](src/lib/llm-client.ts:1) | LLM 客户端类型定义 |
| [`src/lib/llm-client-impl.ts`](src/lib/llm-client-impl.ts:1) | LLM 客户端实现 |
| [`src/lib/agent-generator.ts`](src/lib/agent-generator.ts:1) | Agent 生成器 |

### 文档

| 文件 | 说明 |
|------|------|
| [`LLM_CONFIG_GUIDE.md`](LLM_CONFIG_GUIDE.md:1) | **配置指南** - 详细的配置说明 |
| [`LLM_INTEGRATION.md`](LLM_INTEGRATION.md:1) | 使用指南 - API 参考 |
| [`AUTOMATED_TESTING.md`](AUTOMATED_TESTING.md:1) | 测试指南 |

## 🎯 两种配置方式

### 方式 A：使用 .env 文件（推荐）

1. 复制 `.env.example` 为 `.env`
2. 填入你的 API 配置
3. 刷新页面自动加载

**优点：**
- ✅ 不需要改代码
- ✅ 安全（不会被提交到 Git）
- ✅ 支持多环境

### 方式 B：直接修改代码

编辑 [`src/lib/llm-config.ts`](src/lib/llm-config.ts:62)：

```typescript
export function getCurrentLLMConfig() {
  const provider = 'customOpenAI';  // 👈 改这里

  return llmConfig[provider] || llmConfig.openai;
}
```

然后在 `llmConfig` 中填入你的 API 信息：

```typescript
customOpenAI: {
  apiKey: 'sk-真实密钥',        // 👈 填这里
  baseURL: 'https://真实地址/v1',  // 👈 填这里
  model: 'gpt-3.5-turbo'
}
```

**优点：**
- ✅ 简单直接
- ✅ 适合快速测试

## 🔌 OpenAI 兼容 API 配置

### 通用格式

任何兼容 OpenAI API 格式的服务都可以使用：

```typescript
{
  apiKey: 'your-api-key',
  baseURL: 'https://api-endpoint.com/v1',  // 关键
  model: 'model-name'
}
```

### 常见服务配置

| 服务 | baseURL | model |
|------|---------|-------|
| **OpenAI** | `https://api.openai.com/v1` | `gpt-3.5-turbo` |
| **OneAPI** | `https://your-oneapi.com/v1` | `gpt-3.5-turbo` |
| **DeepSeek** | `https://api.deepseek.com/v1` | `deepseek-chat` |
| **Moonshot** | `https://api.moonshot.cn/v1` | `moonshot-v1-8k` |
| **智谱 AI** | `https://open.bigmodel.cn/api/paas/v4` | `glm-4` |
| **Ollama** | `http://localhost:11434` | `llama3` |

## 🚀 使用示例

### 基础使用

```javascript
// 1. 配置（如果用 .env 则自动配置）
llm.configure({
  apiKey: 'sk-...',
  baseURL: 'https://api.xxx.com/v1',
  model: 'gpt-3.5-turbo'
})

// 2. 生成
const data = await llm.generate({
  topic: '机器学习基础',
  agentType: 'knowledge'
})

// 3. 下载
llm.download(data, 'ml-basics.json')
```

### 高级使用

```javascript
// 生成并转换
const { simplified, converted } = await llm.generateAndConvert({
  topic: 'React Hooks',
  agentType: 'code',
  difficulty: 'advanced',
  additionalInstructions: '包含 useMemo, useCallback 示例'
})

// 下载转换后的格式
llm.download(converted, 'react-hooks-converted.json')
```

## ⚠️ 重要提示

### 安全性

- ❌ **不要**将 `.env` 文件提交到 Git
- ✅ **使用**环境变量或 secrets 服务
- ✅ **定期**轮换 API Key

### .gitignore 配置

确保 `.gitignore` 包含：
```gitignore
.env
.env.local
.env.production
```

### 验证配置

启动后检查浏览器控制台：
```
✅ 检测到配置文件，正在自动配置...
✅ LLM 配置成功
   提供商: customOpenAI
   模型: gpt-3.5-turbo
✅ 自动配置成功！
```

## 📞 需要帮助？

1. **查看配置指南**：[LLM_CONFIG_GUIDE.md](LLM_CONFIG_GUIDE.md:1)
2. **查看使用文档**：[LLM_INTEGRATION.md](LLM_INTEGRATION.md:1)
3. **检查错误信息**：浏览器控制台

## 🎊 现在开始使用！

```bash
# 1. 配置
cp .env.example .env
# 编辑 .env 填入你的 API

# 2. 启动
npm run dev

# 3. 打开浏览器控制台，运行：
const data = await llm.generate({ topic: '测试' })
```

祝你使用愉快！🚀
