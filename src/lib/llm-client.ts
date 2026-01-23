/**
 * LLM Client Configuration and Types
 *
 * 支持多种 LLM 提供商的统一接口
 */

/**
 * 支持的 LLM 提供商
 */
export enum LLMProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  AZURE_OPENAI = 'azure-openai',
  OLLAMA = 'ollama',
  CUSTOM = 'custom'
}

/**
 * LLM 配置接口
 */
export interface LLMConfig {
  provider: LLMProvider;
  apiKey?: string;
  baseURL?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  // Azure OpenAI 特定配置
  azureApiVersion?: string;
  azureDeploymentName?: string;
  // 自定义请求头
  headers?: Record<string, string>;
}

/**
 * 消息角色
 */
export enum MessageRole {
  SYSTEM = 'system',
  USER = 'user',
  ASSISTANT = 'assistant'
}

/**
 * 聊天消息
 */
export interface ChatMessage {
  role: MessageRole;
  content: string;
}

/**
 * LLM 响应
 */
export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
  finishReason?: string;
}

/**
 * LLM 错误类型
 */
export enum LLMErrorType {
  API_KEY_MISSING = 'API_KEY_MISSING',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_REQUEST = 'INVALID_REQUEST',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  PARSE_ERROR = 'PARSE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * LLM 错误
 */
export class LLMError extends Error {
  public readonly type: LLMErrorType;
  public readonly retryable: boolean;
  public readonly originalError?: unknown;

  constructor(
    type: LLMErrorType,
    message: string,
    retryable: boolean = false,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'LLMError';
    this.type = type;
    this.retryable = retryable;
    this.originalError = originalError;
  }
}

/**
 * 默认配置
 */
export const DEFAULT_CONFIG: Partial<LLMConfig> = {
  temperature: 0.7,
  maxTokens: 16384, // 增加到 16384 以支持大型知识路径（10-15个知识点）
  timeout: 120000, // 增加超时到 120 秒（2分钟）
  headers: {
    'Content-Type': 'application/json'
  }
};

/**
 * 模型配置预设
 */
export const MODEL_PRESETS: Record<string, Partial<LLMConfig>> = {
  // OpenAI 模型
  'gpt-4': {
    provider: LLMProvider.OPENAI,
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000
  },
  'gpt-4-turbo': {
    provider: LLMProvider.OPENAI,
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
    maxTokens: 4000
  },
  'gpt-3.5-turbo': {
    provider: LLMProvider.OPENAI,
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 2000
  },

  // Anthropic 模型
  'claude-3-opus': {
    provider: LLMProvider.ANTHROPIC,
    model: 'claude-3-opus-20240229',
    temperature: 0.7,
    maxTokens: 4000
  },
  'claude-3-sonnet': {
    provider: LLMProvider.ANTHROPIC,
    model: 'claude-3-sonnet-20240229',
    temperature: 0.7,
    maxTokens: 4000
  },
  'claude-3-haiku': {
    provider: LLMProvider.ANTHROPIC,
    model: 'claude-3-haiku-20240307',
    temperature: 0.7,
    maxTokens: 4000
  },

  // 本地 Ollama
  'ollama-llama3': {
    provider: LLMProvider.OLLAMA,
    baseURL: 'http://localhost:11434',
    model: 'llama3',
    temperature: 0.7,
    maxTokens: 2000
  }
};
