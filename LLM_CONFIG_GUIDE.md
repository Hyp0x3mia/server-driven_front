# LLM API 配置指南

## 🚀 快速配置（推荐）

### 方式 1：使用配置文件（最简单）

1. **复制示例配置文件**
   ```bash
   cp .env.example .env
   ```

2. **编辑 `.env` 文件，填入你的 API 配置**

   **使用 OpenAI 兼容 API（如 OneAPI、其他第三方服务）：**
   ```env
   VITE_LLM_PROVIDER=customOpenAI
   VITE_CUSTOM_API_KEY=your-api-key-here
   VITE_CUSTOM_BASE_URL=https://your-api-endpoint.com/v1
   VITE_CUSTOM_MODEL=gpt-3.5-turbo
   ```

   **使用 OpenAI 官方：**
   ```env
   VITE_LLM_PROVIDER=openai
   VITE_OPENAI_API_KEY=sk-your-openai-key-here
   ```

   **使用 DeepSeek：**
   ```env
   VITE_LLM_PROVIDER=deepseek
   VITE_DEEPSEEK_API_KEY=your-deepseek-key-here
   ```

3. **启动应用**
   ```bash
   npm run dev
   ```

4. **打开浏览器控制台**（F11），会看到：
   ```
   ✅ 检测到配置文件，正在自动配置...
   ✅ 自动配置成功！
   ```

5. **直接开始生成**
   ```javascript
   const data = await llm.generate({ topic: '机器学习基础' })
   llm.download(data, 'ml.json')
   ```

### 方式 2：直接在代码中配置

如果你不想用环境变量，可以直接修改配置文件：

**文件位置**：`src/lib/llm-config.ts`

```typescript
export function getCurrentLLMConfig(): LLMConfigType {
  // 直接在这里指定你想用的配置
  const provider = 'customOpenAI';  // 👈 改这里

  return llmConfig[provider] || llmConfig.openai;
}
```

然后在 `llmConfig` 中填入你的 API 信息：

```typescript
customOpenAI: {
  apiKey: 'sk-your-actual-api-key',  // 👈 填入真实的 API Key
  baseURL: 'https://your-actual-endpoint.com/v1',  // 👈 填入真实的 API 地址
  model: 'gpt-3.5-turbo'  // 👈 填入模型名称
}
```

### 方式 3：浏览器控制台手动配置（临时）

如果你只想快速测试，可以在浏览器控制台中：

```javascript
llm.configure({
  apiKey: 'sk-your-api-key',
  baseURL: 'https://your-api-endpoint.com/v1',
  model: 'gpt-3.5-turbo'
})
```

## 📝 OpenAI 兼容 API 配置示例

### OneAPI 配置

OneAPI 是一个支持多个 LLM 提供商的统一接口服务。

```env
VITE_LLM_PROVIDER=oneapi
VITE_ONEAPI_KEY=sk-your-oneapi-key
VITE_ONEAPI_BASE_URL=https://your-oneapi-domain.com/v1
```

或者直接在 `llm-config.ts` 中：

```typescript
oneapi: {
  apiKey: 'sk-your-oneapi-key',
  baseURL: 'https://your-oneapi-domain.com/v1',
  model: 'gpt-3.5-turbo'
}
```

### DeepSeek 配置

```env
VITE_LLM_PROVIDER=deepseek
VITE_DEEPSEEK_API_KEY=your-deepseek-key
```

或者：

```typescript
deepseek: {
  apiKey: 'your-deepseek-key',
  baseURL: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat'
}
```

### 其他 OpenAI 兼容 API

任何兼容 OpenAI API 格式的服务都可以使用：

```typescript
customOpenAI: {
  apiKey: 'your-api-key',
  baseURL: 'https://your-api-endpoint.com/v1',  // 关键：正确的 API 地址
  model: 'model-name'  // 改成该服务支持的模型名
}
```

**常见的 OpenAI 兼容服务：**
- OneAPI: `https://your-oneapi.com/v1`
- DeepSeek: `https://api.deepseek.com/v1`
- Moonshot: `https://api.moonshot.cn/v1`
- 智谱 AI (ChatGLM): `https://open.bigmodel.cn/api/paas/v4`
- 以及其他各种第三方 API 服务

### 本地 Ollama（完全免费）

如果你想使用本地模型，可以安装 Ollama：

1. **安装 Ollama**
   - 访问 https://ollama.ai
   - 下载并安装

2. **启动 Ollama**
   ```bash
   ollama serve
   ```

3. **下载模型**
   ```bash
   ollama pull llama3
   ```

4. **配置**
   ```typescript
   ollama: {
     baseURL: 'http://localhost:11434',
     model: 'llama3'
   }
   ```

5. **使用**
   - 无需 API Key
   - 完全免费
   - 数据本地处理

## 🔍 如何验证配置是否正确

### 1. 检查配置加载

启动应用后，打开浏览器控制台，应该看到：

```
✅ 检测到配置文件，正在自动配置...
✅ LLM 配置成功
   提供商: customOpenAI
   模型: gpt-3.5-turbo
✅ 自动配置成功！
```

### 2. 测试生成

```javascript
// 简单测试
const data = await llm.generate({
  topic: '测试主题',
  agentType: 'knowledge'
})

// 如果成功，会看到：
// ✅ 生成成功
//    标题: ...
//    Blocks: ...
```

### 3. 常见错误排查

**错误：`API Key is required`**
- 检查 `.env` 文件中的 API Key 是否正确
- 确认环境变量名拼写正确（大写）
- 重新启动应用

**错误：`Network error`**
- 检查 `baseURL` 是否正确
- 确认网络连接正常
- 如果是本地 Ollama，确认服务已启动

**错误：`Rate limit exceeded`**
- API 调用频率过高
- 等待一段时间后重试
- 系统会自动重试最多 3 次

**错误：`Invalid request`**
- 检查模型名称是否正确
- 确认 API Key 有权限访问该模型

## 💡 配置技巧

### 1. 开发环境 vs 生产环境

**开发环境**（使用 `.env` 文件）：
```env
VITE_CUSTOM_API_KEY=dev-key-123
```

**生产环境**：
- 不要将 `.env` 提交到 Git
- 使用 CI/CD 的环境变量配置
- 或使用 secrets 管理服务

### 2. 多个环境配置

你可以创建多个配置文件：

```bash
.env.development    # 开发环境
.env.production     # 生产环境
.env.local          # 本地覆盖（不提交）
```

### 3. 快速切换 API

修改 `llm-config.ts` 中的 `getCurrentLLMConfig()` 函数：

```typescript
export function getCurrentLLMConfig() {
  // 快速切换：注释掉不需要的，取消注释想要的
  const provider = 'customOpenAI';  // 你的自定义 API
  // const provider = 'openai';      // OpenAI 官方
  // const provider = 'ollama';      // 本地 Ollama
  // const provider = 'deepseek';    // DeepSeek

  return llmConfig[provider] || llmConfig.openai;
}
```

## 🔒 安全性建议

1. **不要提交 `.env` 文件到 Git**
   ```bash
   # .gitignore
   .env
   .env.local
   ```

2. **使用环境变量**（推荐）
   - 开发：`.env` 文件
   - 生产：CI/CD 环境变量或 secrets 服务

3. **定期轮换 API Key**
   - 定期更换密钥
   - 如果密钥泄露，立即更换

4. **限制 API Key 权限**
   - 只给必要的权限
   - 设置使用限额
   - 监控异常使用

## 📚 完整示例

### 使用自定义 OpenAI 兼容 API

**步骤 1：创建 `.env` 文件**
```env
VITE_LLM_PROVIDER=customOpenAI
VITE_CUSTOM_API_KEY=sk-abc123xyz789
VITE_CUSTOM_BASE_URL=https://api.my-service.com/v1
VITE_CUSTOM_MODEL=my-gpt-model
```

**步骤 2：启动应用**
```bash
npm run dev
```

**步骤 3：验证配置**
```javascript
// 浏览器控制台
llm.status()
// 应该返回: { configured: true }
```

**步骤 4：生成内容**
```javascript
const data = await llm.generate({
  topic: 'React Hooks',
  agentType: 'code',
  difficulty: 'intermediate'
})

// 下载
llm.download(data, 'react-hooks.json')
```

## 🆘 需要帮助？

如果遇到问题：

1. 检查浏览器控制台的错误信息
2. 确认 API 配置正确
3. 验证网络连接
4. 查看 [LLM_INTEGRATION.md](./LLM_INTEGRATION.md) 了解更多

祝你配置顺利！🎉
