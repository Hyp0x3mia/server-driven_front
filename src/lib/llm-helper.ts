/**
 * LLM Helper for Browser Console
 *
 * 提供简单的浏览器控制台接口来使用 LLM 生成内容
 */

import { LLMClient } from './llm-client-impl';
import { AgentGenerator, GenerationOptions } from './agent-generator';
import { LLMProvider } from './llm-client';
import { SchemaConverter } from './schema-converter';
import { getCurrentLLMConfig } from './llm-config';
import { PathBasedContentGenerator, PathBasedGenerationOptions } from './path-based-generator';

/**
 * LLM Helper 类
 */
export class LLMHelper {
  private generator: AgentGenerator | null = null;
  public pathGenerator: PathBasedContentGenerator | null = null; // 公开以便外部访问
  private llmClient: LLMClient | null = null;

  /**
   * 配置 LLM
   */
  configure(config: {
    apiKey: string;
    provider?: 'openai' | 'anthropic' | 'ollama' | 'azure-openai';
    model?: string;
    baseURL?: string;
  }): void {
    try {
      // 确定提供商
      let provider = LLMProvider.OPENAI;
      if (config.provider) {
        const providerKey = config.provider.toUpperCase() as keyof typeof LLMProvider;
        provider = LLMProvider[providerKey];
      }

      // 创建 LLM 客户端
      this.llmClient = new LLMClient({
        provider,
        apiKey: config.apiKey,
        model: config.model,
        baseURL: config.baseURL
      });

      // 创建生成器
      this.generator = new AgentGenerator(this.llmClient);
      this.pathGenerator = new PathBasedContentGenerator(this.llmClient);

      console.log('✅ LLM 配置成功');
      console.log(`   提供商: ${config.provider || 'openai'}`);
      console.log(`   模型: ${config.model || 'default'}`);
    } catch (error) {
      console.error('❌ LLM 配置失败:', error);
      throw error;
    }
  }

  /**
   * 生成内容
   */
  async generate(options: {
    topic: string;
    agentType?: 'knowledge' | 'code' | 'quiz';
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    additionalInstructions?: string;
  }): Promise<any> {
    if (!this.generator) {
      throw new Error('LLM 未配置，请先调用 llm.configure()');
    }

    console.log(`\n🤖 开始生成内容...`);
    console.log(`   主题: ${options.topic}`);
    console.log(`   类型: ${options.agentType || 'knowledge'}\n`);

    const result = await this.generator.generate({
      topic: options.topic,
      agentType: options.agentType || 'knowledge',
      difficulty: options.difficulty || 'intermediate',
      additionalInstructions: options.additionalInstructions
    });

    if (!result.success) {
      console.error('❌ 生成失败:', result.error);
      throw new Error(result.error);
    }

    console.log('\n✅ 生成成功！');
    console.log(`   标题: ${result.data?.title}`);
    console.log(`   Blocks: ${result.data?.blocks?.length}`);
    console.log(`   Token 使用: ${result.metadata?.tokensUsed}`);
    console.log(`   耗时: ${result.metadata?.duration}ms\n`);

    return result.data;
  }

  /**
   * 生成并转换
   */
  async generateAndConvert(options: {
    topic: string;
    agentType?: 'knowledge' | 'code' | 'quiz';
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    additionalInstructions?: string;
  }): Promise<{ simplified: any; converted: any }> {
    // 生成简化格式
    const simplified = await this.generate(options);

    // 转换为系统格式
    console.log('🔄 转换 Schema...');
    const converted = SchemaConverter.convertPage(simplified);
    console.log('✅ 转换完成\n');

    return { simplified, converted };
  }

  /**
   * 下载 JSON
   */
  download(data: any, filename: string): void {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    console.log(`✅ 已下载: ${filename}`);
  }

  /**
   * 基于知识路径生成内容
   */
  async generateFromPath(options: PathBasedGenerationOptions): Promise<any> {
    if (!this.pathGenerator) {
      throw new Error('LLM 未配置，请先调用 llm.configure()');
    }

    console.log(`\n🎓 基于知识路径生成内容...`);
    console.log(`   知识点数量: ${options.knowledge_path.length}\n`);

    const result = await this.pathGenerator.generate(options);

    if (!result.success) {
      console.error('❌ 生成失败:', result.error);
      throw new Error(result.error);
    }

    console.log('\n✅ 生成成功！');
    console.log(`   标题: ${result.data?.title}`);
    console.log(`   Blocks: ${result.data?.blocks?.length}`);
    console.log(`   Token 使用: ${result.metadata?.tokensUsed}`);
    console.log(`   耗时: ${result.metadata?.duration}ms\n`);

    return result.data;
  }

  /**
   * 基于知识路径生成并转换
   */
  async generateFromPathAndConvert(options: PathBasedGenerationOptions): Promise<{ simplified: any; converted: any }> {
    if (!this.pathGenerator) {
      throw new Error('LLM 未配置，请先调用 llm.configure()');
    }

    // 生成简化格式
    const simplified = await this.generateFromPath(options);

    // 转换为系统格式
    console.log('🔄 转换 Schema...');
    const converted = SchemaConverter.convertPage(simplified);
    console.log('✅ 转换完成\n');

    return { simplified, converted };
  }

  /**
   * 获取配置状态
   */
  getStatus(): { configured: boolean } {
    return {
      configured: this.generator !== null
    };
  }
}

// 导出到全局（用于浏览器控制台访问）
if (typeof window !== 'undefined') {
  const llmHelper = new LLMHelper();

  (window as any).llm = {
    /**
     * 配置 LLM
     *
     * 示例:
     * llm.configure({
     *   apiKey: 'sk-...',
     *   provider: 'openai',
     *   model: 'gpt-3.5-turbo'
     * })
     */
    configure: (config: any) => llmHelper.configure(config),

    /**
     * 生成内容
     *
     * 示例:
     * const data = await llm.generate({
     *   topic: '自然语言处理基础',
     *   agentType: 'knowledge',
     *   difficulty: 'intermediate'
     * })
     */
    generate: (options: any) => llmHelper.generate(options),

    /**
     * 生成并转换
     *
     * 示例:
     * const { simplified, converted } = await llm.generateAndConvert({
     *   topic: 'React Hooks',
     *   agentType: 'code'
     * })
     * llm.download(converted, 'react-hooks.json')
     */
    generateAndConvert: (options: any) => llmHelper.generateAndConvert(options),

    /**
     * 🔄 AI 优化单个 Block (Human-in-the-loop)
     *
     * 示例:
     * const optimizedBlock = await llm.regenerateBlock(currentBlock, "让内容更简洁")
     */
    regenerateBlock: (currentBlock: any, instruction?: string) =>
      llmHelper.pathGenerator?.regenerateBlock(currentBlock, instruction),

    /**
     * 下载 JSON
     *
     * 示例:
     * llm.download(data, 'filename.json')
     */
    download: (data: any, filename: string) => llmHelper.download(data, filename),

    /**
     * 检查状态
     *
     * 示例:
     * llm.status()
     */
    status: () => llmHelper.getStatus(),

    /**
     * 基于知识路径生成内容（推荐）
     *
     * 示例:
     * const path = [...] // 你的知识路径数组
     * const data = await llm.generateFromPath({
     *   knowledge_path: path
     * })
     */
    generateFromPath: (options: PathBasedGenerationOptions) => llmHelper.generateFromPath(options),

    /**
     * 基于知识路径生成并转换
     *
     * 示例:
     * const { simplified, converted } = await llm.generateFromPathAndConvert({
     *   knowledge_path: path,
     *   resources: [...], // 可选
     *   style: 'comprehensive' // 可选
     * })
     * llm.download(converted, 'output.json')
     */
    generateFromPathAndConvert: (options: PathBasedGenerationOptions) => llmHelper.generateFromPathAndConvert(options)
  };

  console.log('');
  console.log('🤖 LLM 内容生成助手已加载！');
  console.log('');

  // 尝试自动加载配置
  try {
    const config = getCurrentLLMConfig();
    if (config.apiKey || config.baseURL?.includes('localhost')) {
      console.log('✅ 检测到配置文件，正在自动配置...');
      (window as any).llm.configure({
        apiKey: config.apiKey || '',
        baseURL: config.baseURL,
        model: config.model
      });
      console.log('✅ 自动配置成功！');
      console.log('');
    }
  } catch (error) {
    console.log('ℹ️  未检测到配置，需要手动配置');
    console.log('');
  }

  console.log('📖 快速开始:');
  console.log('');
  console.log('   方式 1 - 使用配置文件（推荐）:');
  console.log('      1. 复制 .env.example 为 .env');
  console.log('      2. 填入你的 API 配置');
  console.log('      3. 刷新页面即可自动加载');
  console.log('');
  console.log('   方式 2 - 手动配置:');
  console.log('      llm.configure({ apiKey: "sk-..." })');
  console.log('');
  console.log('   生成内容（推荐 - 基于知识路径）:');
  console.log('      const path = [...] // 你的知识路径数组');
  console.log('      const data = await llm.generateFromPath({');
  console.log('        knowledge_path: path,');
  console.log('        resources: [...], // 可选');
  console.log('        style: "comprehensive"');
  console.log('      })');
  console.log('      llm.download(data, "output.json")');
  console.log('');
  console.log('   或使用简单主题:');
  console.log('      const data = await llm.generate({ topic: "机器学习" })');
  console.log('');
  console.log('💡 更多帮助:');
  console.log('   llm.status() - 查看状态');
  console.log('');
}
