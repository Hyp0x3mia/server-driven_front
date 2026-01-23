/**
 * LLM Client Implementation
 *
 * 统一的 LLM 调用接口，支持多种提供商
 */

import {
  LLMConfig,
  LLMProvider,
  ChatMessage,
  LLMResponse,
  LLMError,
  LLMErrorType,
  DEFAULT_CONFIG
} from './llm-client';

/**
 * 重试配置
 */
interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2
};

/**
 * LLM Client 类
 */
export class LLMClient {
  private config: Required<LLMConfig>;
  private retryConfig: RetryConfig;

  constructor(config: LLMConfig, retryConfig?: Partial<RetryConfig>) {
    // 验证配置
    this.validateConfig(config);

    // 合并默认配置
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      headers: {
        ...DEFAULT_CONFIG.headers,
        ...config.headers
      }
    } as Required<LLMConfig>;

    this.retryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      ...retryConfig
    };
  }

  /**
   * 验证配置
   */
  private validateConfig(config: LLMConfig): void {
    // 大多数提供商需要 API Key
    if (
      config.provider !== LLMProvider.OLLAMA &&
      config.provider !== LLMProvider.CUSTOM &&
      !config.apiKey
    ) {
      throw new LLMError(
        LLMErrorType.API_KEY_MISSING,
        `API Key is required for ${config.provider}`,
        false
      );
    }

    // 验证 Azure 配置
    if (config.provider === LLMProvider.AZURE_OPENAI) {
      if (!config.azureApiVersion || !config.azureDeploymentName) {
        throw new LLMError(
          LLMErrorType.INVALID_REQUEST,
          'Azure OpenAI requires azureApiVersion and azureDeploymentName',
          false
        );
      }
    }
  }

  /**
   * 发送聊天请求
   */
  async chat(messages: ChatMessage[]): Promise<LLMResponse> {
    return this.withRetry(() => this.chatOnce(messages));
  }

  /**
   * 单次聊天请求
   */
  private async chatOnce(messages: ChatMessage[]): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      let response: Response;

      switch (this.config.provider) {
        case LLMProvider.OPENAI:
          response = await this.callOpenAI(messages);
          break;
        case LLMProvider.ANTHROPIC:
          response = await this.callAnthropic(messages);
          break;
        case LLMProvider.AZURE_OPENAI:
          response = await this.callAzureOpenAI(messages);
          break;
        case LLMProvider.OLLAMA:
          response = await this.callOllama(messages);
          break;
        case LLMProvider.CUSTOM:
          response = await this.callCustom(messages);
          break;
        default:
          throw new LLMError(
            LLMErrorType.INVALID_REQUEST,
            `Unsupported provider: ${this.config.provider}`,
            false
          );
      }

      // 解析响应
      const data = await response.json();

      if (!response.ok) {
        throw this.parseErrorResponse(response.status, data);
      }

      // 提取内容
      const result = this.extractContent(data);

      // 计算耗时
      const duration = Date.now() - startTime;
      console.log(`✅ LLM 请求成功 (${duration}ms)`);

      return result;
    } catch (error) {
      if (error instanceof LLMError) {
        throw error;
      }

      // 网络错误或其他错误
      throw new LLMError(
        LLMErrorType.NETWORK_ERROR,
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        true,
        error
      );
    }
  }

  /**
   * 调用 OpenAI API
   */
  private async callOpenAI(messages: ChatMessage[]): Promise<Response> {
    const baseURL = this.config.baseURL || 'https://api.openai.com/v1';

    return fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        ...this.config.headers,
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-3.5-turbo',
        messages: messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      })
    });
  }

  /**
   * 调用 Anthropic API
   */
  private async callAnthropic(messages: ChatMessage[]): Promise<Response> {
    const baseURL = this.config.baseURL || 'https://api.anthropic.com/v1';

    // Anthropic API 要求第一条消息必须是 system
    const systemMessage = messages.find(m => m.role === 'system' as any);
    const chatMessages = messages.filter(m => m.role !== 'system' as any);

    return fetch(`${baseURL}/messages`, {
      method: 'POST',
      headers: {
        ...this.config.headers,
        'x-api-key': this.config.apiKey!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-sonnet-20240229',
        messages: chatMessages,
        system: systemMessage?.content || '',
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      })
    });
  }

  /**
   * 调用 Azure OpenAI API
   */
  private async callAzureOpenAI(messages: ChatMessage[]): Promise<Response> {
    const baseURL = this.config.baseURL!;
    const apiVersion = this.config.azureApiVersion!;
    const deploymentName = this.config.azureDeploymentName!;

    return fetch(
      `${baseURL}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`,
      {
        method: 'POST',
        headers: {
          ...this.config.headers,
          'api-key': this.config.apiKey!
        },
        body: JSON.stringify({
          messages: messages,
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens
        })
      }
    );
  }

  /**
   * 调用 Ollama API
   */
  private async callOllama(messages: ChatMessage[]): Promise<Response> {
    const baseURL = this.config.baseURL || 'http://localhost:11434';

    return fetch(`${baseURL}/api/chat`, {
      method: 'POST',
      headers: this.config.headers,
      body: JSON.stringify({
        model: this.config.model || 'llama3',
        messages: messages,
        stream: false,
        options: {
          temperature: this.config.temperature,
          num_predict: this.config.maxTokens
        }
      })
    });
  }

  /**
   * 调用自定义 API
   */
  private async callCustom(messages: ChatMessage[]): Promise<Response> {
    const baseURL = this.config.baseURL!;

    return fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        ...this.config.headers,
        'Authorization': `Bearer ${this.config.apiKey!}`
      },
      body: JSON.stringify({
        model: this.config.model || 'default',
        messages: messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      })
    });
  }

  /**
   * 解析错误响应
   */
  private parseErrorResponse(status: number, data: any): LLMError {
    // 速率限制
    if (status === 429) {
      return new LLMError(
        LLMErrorType.RATE_LIMIT_EXCEEDED,
        data.error?.message || 'Rate limit exceeded',
        true,
        data
      );
    }

    // 超时
    if (status === 408 || status === 504) {
      return new LLMError(
        LLMErrorType.TIMEOUT,
        data.error?.message || 'Request timeout',
        true,
        data
      );
    }

    // 其他错误
    return new LLMError(
      LLMErrorType.INVALID_REQUEST,
      data.error?.message || `HTTP ${status}: ${data.error?.type || 'Unknown error'}`,
      status >= 500, // 5xx 错误可以重试
      data
    );
  }

  /**
   * 提取响应内容
   */
  private extractContent(data: any): LLMResponse {
    try {
      // OpenAI / Azure OpenAI 格式
      if (data.choices && data.choices[0]) {
        return {
          content: data.choices[0].message.content,
          usage: data.usage ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens
          } : undefined,
          model: data.model,
          finishReason: data.choices[0].finish_reason
        };
      }

      // Anthropic 格式
      if (data.content && Array.isArray(data.content)) {
        const textBlock = data.content.find((block: any) => block.type === 'text');
        return {
          content: textBlock?.text || '',
          usage: data.usage ? {
            promptTokens: data.usage.input_tokens,
            completionTokens: data.usage.output_tokens,
            totalTokens: data.usage.input_tokens + data.usage.output_tokens
          } : undefined,
          model: data.model,
          finishReason: data.stop_reason
        };
      }

      // Ollama 格式
      if (data.message) {
        return {
          content: data.message.content,
          usage: data.prompt_eval_count !== undefined ? {
            promptTokens: data.prompt_eval_count,
            completionTokens: data.eval_count,
            totalTokens: data.prompt_eval_count + data.eval_count
          } : undefined,
          model: data.model
        };
      }

      throw new LLMError(
        LLMErrorType.PARSE_ERROR,
        'Unknown response format',
        false,
        data
      );
    } catch (error) {
      if (error instanceof LLMError) {
        throw error;
      }

      throw new LLMError(
        LLMErrorType.PARSE_ERROR,
        `Failed to parse response: ${error instanceof Error ? error.message : 'Unknown error'}`,
        false,
        data
      );
    }
  }

  /**
   * 带重试的请求
   */
  private async withRetry<T>(
    fn: () => Promise<T>
  ): Promise<T> {
    let lastError: LLMError | undefined;
    let delay = this.retryConfig.initialDelay;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (!(error instanceof LLMError)) {
          throw error;
        }

        lastError = error;

        // 如果不可重试，直接抛出
        if (!error.retryable) {
          throw error;
        }

        // 最后一次尝试失败，抛出错误
        if (attempt === this.retryConfig.maxRetries) {
          throw error;
        }

        console.warn(`⚠️ 请求失败，${delay}ms 后重试 (${attempt + 1}/${this.retryConfig.maxRetries})`);
        console.warn(`   错误: ${error.message}`);

        // 等待后重试
        await this.sleep(delay);

        // 指数退避
        delay = Math.min(
          delay * this.retryConfig.backoffMultiplier,
          this.retryConfig.maxDelay
        );
      }
    }

    throw lastError;
  }

  /**
   * 等待
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<LLMConfig>): void {
    this.config = {
      ...this.config,
      ...config,
      headers: {
        ...this.config.headers,
        ...config.headers
      }
    };
  }

  /**
   * 获取当前配置
   */
  getConfig(): Readonly<LLMConfig> {
    return { ...this.config };
  }
}
