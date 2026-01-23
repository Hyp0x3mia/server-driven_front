/**
 * Agent Generator
 *
 * 使用 LLM 自动生成教育内容
 */

import { LLMClient } from './llm-client-impl';
import { ChatMessage, MessageRole } from './llm-client';
import { KNOWLEDGE_AGENT_PROMPT, CODE_AGENT_PROMPT, QUIZ_AGENT_PROMPT } from '../prompts/agent-prompts';
import type { SimplifiedPage } from './simplified';

/**
 * Agent 类型
 */
export type AgentType = 'knowledge' | 'code' | 'quiz';

/**
 * 生成选项
 */
export interface GenerationOptions {
  topic: string;
  agentType: AgentType;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  additionalInstructions?: string;
  blocks?: string[]; // 指定要生成的 block 类型
}

/**
 * 生成结果
 */
export interface GenerationResult {
  success: boolean;
  data?: SimplifiedPage;
  error?: string;
  metadata?: {
    tokensUsed: number;
    model: string;
    duration: number;
  };
}

/**
 * Agent Generator 类
 */
export class AgentGenerator {
  private llmClient: LLMClient;

  constructor(llmClient: LLMClient) {
    this.llmClient = llmClient;
  }

  /**
   * 生成内容
   */
  async generate(options: GenerationOptions): Promise<GenerationResult> {
    const startTime = Date.now();

    try {
      console.log(`🤖 ${options.agentType} Agent 开始生成...`);
      console.log(`   主题: ${options.topic}`);

      // 构建提示词
      const messages = this.buildMessages(options);

      // 调用 LLM
      const response = await this.llmClient.chat(messages);

      // 解析响应
      const data = this.parseResponse(response.content);

      const duration = Date.now() - startTime;

      console.log(`✅ 生成完成 (${duration}ms)`);
      console.log(`   使用 tokens: ${response.usage?.totalTokens || 'N/A'}`);

      return {
        success: true,
        data,
        metadata: {
          tokensUsed: response.usage?.totalTokens || 0,
          model: response.model || 'unknown',
          duration
        }
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      console.error(`❌ 生成失败: ${errorMessage}`);

      return {
        success: false,
        error: errorMessage,
        metadata: {
          tokensUsed: 0,
          model: 'unknown',
          duration
        }
      };
    }
  }

  /**
   * 构建消息
   */
  private buildMessages(options: GenerationOptions): ChatMessage[] {
    const prompt = this.getPromptTemplate(options.agentType);

    // 系统提示
    const systemMessage: ChatMessage = {
      role: MessageRole.SYSTEM,
      content: prompt.systemPrompt
    };

    // 用户提示
    let userPrompt = prompt.userTemplate.replace('{{TOPIC}}', options.topic);

    // 添加难度级别
    if (options.difficulty) {
      userPrompt += `\n\n难度级别: ${options.difficulty}`;
    }

    // 添加额外指令
    if (options.additionalInstructions) {
      userPrompt += `\n\n额外要求: ${options.additionalInstructions}`;
    }

    // 指定 block 类型
    if (options.blocks && options.blocks.length > 0) {
      userPrompt += `\n\n请包含以下组件类型: ${options.blocks.join(', ')}`;
    }

    const userMessage: ChatMessage = {
      role: MessageRole.USER,
      content: userPrompt
    };

    return [systemMessage, userMessage];
  }

  /**
   * 获取提示词模板
   */
  private getPromptTemplate(agentType: AgentType) {
    switch (agentType) {
      case 'knowledge':
        return KNOWLEDGE_AGENT_PROMPT;
      case 'code':
        return CODE_AGENT_PROMPT;
      case 'quiz':
        return QUIZ_AGENT_PROMPT;
      default:
        return KNOWLEDGE_AGENT_PROMPT;
    }
  }

  /**
   * 解析 LLM 响应
   */
  private parseResponse(content: string): SimplifiedPage {
    // 尝试提取 JSON
    let jsonStr = content;

    // 如果响应包含 markdown 代码块，提取 JSON
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    // 解析 JSON
    try {
      const data = JSON.parse(jsonStr);

      // 验证基本结构
      if (!data.page_id || !data.title || !data.blocks) {
        throw new Error('Missing required fields: page_id, title, or blocks');
      }

      return data;
    } catch (error) {
      throw new Error(
        `Failed to parse LLM response as JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * 批量生成多个页面
   */
  async generateBatch(optionsList: GenerationOptions[]): Promise<GenerationResult[]> {
    console.log(`\n🔄 批量生成 ${optionsList.length} 个页面...\n`);

    const results: GenerationResult[] = [];

    for (let i = 0; i < optionsList.length; i++) {
      console.log(`\n[${i + 1}/${optionsList.length}]`);

      const result = await this.generate(optionsList[i]);
      results.push(result);

      // 避免速率限制
      if (i < optionsList.length - 1) {
        await this.sleep(1000);
      }
    }

    console.log(`\n✅ 批量生成完成`);

    return results;
  }

  /**
   * 等待
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 快速创建 Agent Generator
 */
export function createAgentGenerator(config: {
  apiKey: string;
  provider?: 'openai' | 'anthropic' | 'azure-openai' | 'ollama';
  model?: string;
  baseURL?: string;
}): AgentGenerator {
  const { LLMClient } = require('./llm-client-impl');
  const { LLMProvider } = require('./llm-client');

  // 确定提供商
  let provider = LLMProvider.OPENAI;
  if (config.provider) {
    provider = LLMProvider[config.provider.toUpperCase()];
  }

  // 创建 LLM 客户端
  const llmClient = new LLMClient({
    provider,
    apiKey: config.apiKey,
    model: config.model,
    baseURL: config.baseURL
  });

  return new AgentGenerator(llmClient);
}
