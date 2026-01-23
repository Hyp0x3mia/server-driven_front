/**
 * LLM Configuration
 *
 * 配置你的 LLM API
 */

export type LLMConfigType = {
  apiKey?: string;
  baseURL?: string;
  model?: string;
};

export const llmConfig: Record<string, LLMConfigType> = {
  // ========== OpenAI 官方 API ==========
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'sk-your-openai-api-key',
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-3.5-turbo'
  },

  // ========== OpenAI 兼容 API（如 OneAPI、DeepSeek 等）==========
  // 示例 1: OneAPI（支持多个 LLM 提供商的统一接口）
  oneapi: {
    apiKey: import.meta.env.VITE_ONEAPI_KEY || 'your-oneapi-key',
    baseURL: import.meta.env.VITE_ONEAPI_BASE_URL || 'https://your-oneapi-domain.com/v1',
    model: 'gpt-3.5-turbo'
  },

  // 示例 2: DeepSeek
  deepseek: {
    apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY || 'your-deepseek-key',
    baseURL: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat'
  },

  // 示例 3: 其他 OpenAI 兼容 API
  customOpenAI: {
    apiKey: import.meta.env.VITE_CUSTOM_API_KEY || 'your-custom-api-key',
    baseURL: import.meta.env.VITE_CUSTOM_BASE_URL || 'https://your-custom-endpoint.com/v1',
    model: import.meta.env.VITE_CUSTOM_MODEL || 'your-model-name'
  },

  // ========== Anthropic Claude ==========
  anthropic: {
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || 'sk-ant-your-anthropic-key',
    baseURL: 'https://api.anthropic.com/v1',
    model: 'claude-3-sonnet-20240229'
  },

  // ========== 本地 Ollama（无需 API Key）==========
  ollama: {
    baseURL: 'http://localhost:11434',
    model: 'llama3'
  }
};

/**
 * 获取当前使用的配置
 *
 * 修改这个函数来切换不同的 API
 */
export function getCurrentLLMConfig(): LLMConfigType {
  // 方式 1: 使用环境变量选择
  const provider = import.meta.env.VITE_LLM_PROVIDER || 'openai';

  // 方式 2: 直接在这里指定（推荐用于开发）
  // const provider = 'customOpenAI';  // 改成你想用的

  return llmConfig[provider] || llmConfig.openai;
}

/**
 * 预设配置
 */
export const presetConfigs = {
  // 便宜的 GPT-3.5（推荐用于测试）
  cheap: {
    ...llmConfig.openai,
    model: 'gpt-3.5-turbo'
  },

  // 更好的 GPT-4
  quality: {
    ...llmConfig.openai,
    model: 'gpt-4-turbo-preview'
  },

  // 本地免费（需要先安装 Ollama）
  local: llmConfig.ollama,

  // 自定义 OpenAI 兼容 API
  custom: llmConfig.customOpenAI
};
