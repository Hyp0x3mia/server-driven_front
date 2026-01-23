/**
 * Path-Based Content Generator
 * * 基于知识路径生成完整的学习页面
 * 包含：智能 JSON 修复、视觉模式生成、Token 上下文优化
 */

import { LLMClient } from './llm-client-impl';
import { ChatMessage, MessageRole } from './llm-client';
import { SchemaConverter } from './schema-converter';

/**
 * 知识点结构（来自上游系统）
 */
export interface KnowledgePoint {
  knowledge_id: string;
  name: string;
  description: string;
  domain: string;
  subdomain: string;
  difficulty: number;
  cognitive_level: string;
  importance: number;
  abstraction: number;
  estimated_time: number;
  is_key_point: boolean;
  is_difficult: boolean;
  prerequisites: string[];
  successors: string[];
  keywords: string[];
  application_scenarios: string[];
  common_misconceptions: string[];
  mastery_criteria: string;
}

/**
 * 推荐资源
 */
export interface Resource {
  id: string;
  title: string;
  url: string;
  cover_image: string;
  description: string;
  type: 'video' | 'article' | 'book' | 'course' | 'practice';
}

/**
 * 生成选项
 */
export interface PathBasedGenerationOptions {
  knowledge_path: KnowledgePoint[];
  resources?: Resource[];
  focus_points?: string[]; // 重点关注的 knowledge_id
  style?: 'comprehensive' | 'concise' | 'practice-oriented';
}

/**
 * 生成结果
 */
export interface PathBasedGenerationResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    tokensUsed: number;
    model: string;
    duration: number;
    knowledgePointsCovered: number;
  };
}

/**
 * 基于路径的内容生成器
 */
export class PathBasedContentGenerator {
  private llmClient: LLMClient;

  constructor(llmClient: LLMClient) {
    this.llmClient = llmClient;
  }

  /**
   * 生成完整页面
   */
  async generate(options: PathBasedGenerationOptions): Promise<PathBasedGenerationResult> {
    const startTime = Date.now();

    try {
      console.log(`🎓 基于知识路径生成内容...`);
      console.log(`   知识点数量: ${options.knowledge_path.length}`);

      // 1. 分析知识路径，提取关键信息
      const pathAnalysis = this.analyzePath(options);

      // 2. 构建提示词 (包含 Token 优化和视觉模式指令)
      const messages = this.buildMessages(options, pathAnalysis);

      // 3. 调用 LLM
      const response = await this.llmClient.chat(messages);

      // 4. 解析响应 (使用强力修复逻辑)
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
          duration,
          knowledgePointsCovered: options.knowledge_path.length
        }
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      console.error(`❌ 生成失败: ${errorMessage}`);
      // 可以在这里打印原始响应以便调试
      // console.debug('原始响应片段:', response?.content?.slice(0, 200));

      return {
        success: false,
        error: errorMessage,
        metadata: {
          tokensUsed: 0,
          model: 'unknown',
          duration,
          knowledgePointsCovered: 0
        }
      };
    }
  }

  /**
   * 分析知识路径
   */
  private analyzePath(options: PathBasedGenerationOptions) {
    const path = options.knowledge_path;

    // 按难度分组
    const byDifficulty = {
      easy: path.filter(kp => kp.difficulty <= 2),
      medium: path.filter(kp => kp.difficulty === 3),
      hard: path.filter(kp => kp.difficulty >= 4)
    };

    // 提取关键知识点
    const keyPoints = path.filter(kp => kp.is_key_point);

    // 提取难点
    const difficultPoints = path.filter(kp => kp.is_difficult);

    // 按子领域分组
    const bySubdomain = path.reduce((acc, kp) => {
      if (!acc[kp.subdomain]) {
        acc[kp.subdomain] = [];
      }
      acc[kp.subdomain].push(kp);
      return acc;
    }, {} as Record<string, KnowledgePoint[]>);

    // 计算总学习时间
    const totalTime = path.reduce((sum, kp) => sum + kp.estimated_time, 0);

    // 提取所有关键词
    const allKeywords = Array.from(
      new Set(path.flatMap(kp => kp.keywords))
    ).slice(0, 20); // 限制数量

    return {
      byDifficulty,
      keyPoints,
      difficultPoints,
      bySubdomain,
      totalTime,
      allKeywords,
      domain: path[0]?.domain || '未知领域',
      subdomainCount: Object.keys(bySubdomain).length
    };
  }

  /**
   * 构建消息
   */
  private buildMessages(
    options: PathBasedGenerationOptions,
    analysis: any
  ): ChatMessage[] {
    const path = options.knowledge_path;
    const focusPoints = options.focus_points || [];

    // 系统提示
    const systemPrompt = this.buildSystemPrompt(options.style);

    // 用户提示
    let userPrompt = `请根据以下知识路径生成完整的学习页面。

## 基本信息

- **领域**: ${analysis.domain}
- **知识点数量**: ${path.length}
- **学习时长**: ${analysis.totalTime} 分钟
- **子领域数**: ${analysis.subdomainCount}
- **关键知识点**: ${analysis.keyPoints.length}
- **难点**: ${analysis.difficultPoints.length}

## 知识路径详情

`;

    // 添加知识点列表（按子领域组织，含 Token 剪枝逻辑）
    Object.entries(analysis.bySubdomain).forEach(([subdomain, kps]: [string, any]) => {
      userPrompt += `### ${subdomain}\n\n`;

      kps.forEach((kp: KnowledgePoint, index: number) => {
        const isFocus = focusPoints.includes(kp.knowledge_id);
        const isKey = kp.is_key_point;
        const isHard = kp.is_difficult;
        
        // 剪枝策略：如果既不是重点，也不是难点，且不在关注列表中，则只提供基础信息
        // 这能显著减少 Prompt 长度，避免 LLM "迷路"
        const shouldPrune = !isKey && !isHard && !isFocus;
        
        const prefix = isFocus ? '⭐ ' : `${index + 1}. `;

        userPrompt += `${prefix}**${kp.name}** (ID: ${kp.knowledge_id})\n`;
        
        if (shouldPrune) {
           // 简化版信息
           userPrompt += `   - 简介: ${kp.description.slice(0, 100)}...\n`; // 截断描述
           userPrompt += `   - 关键词: ${kp.keywords.slice(0, 3).join(', ')}\n`;
        } else {
           // 完整版信息
           userPrompt += `   - 描述: ${kp.description}\n`;
           userPrompt += `   - 难度: ${kp.difficulty}/5 | 重要度: ${kp.importance}\n`;
           userPrompt += `   - 关键词: ${kp.keywords.join(', ')}\n`;
           userPrompt += `   - 掌握标准: ${kp.mastery_criteria}\n`;
           
           if (kp.common_misconceptions.length > 0) {
             userPrompt += `   - 常见误区: ${kp.common_misconceptions.join('; ')}\n`;
           }
        }
        userPrompt += '\n';
      });
    });

    // 添加推荐资源（如果有）
    if (options.resources && options.resources.length > 0) {
      userPrompt += `## 推荐学习资源\n\n`;
      options.resources.forEach((resource, index) => {
        userPrompt += `${index + 1}. **${resource.title}** (${resource.type})\n`;
        userPrompt += `   - 链接: ${resource.url}\n`;
        userPrompt += `   - 封面: ${resource.cover_image}\n`;
        userPrompt += `   - 简介: ${resource.description}\n\n`;
      });
    }

    // 添加生成要求 (包含视觉模式)
    userPrompt += `
## 生成要求

1. **页面结构**:
   - Hero: 标题 + 副标题 + 核心特点（3-5个）
   - Markdown: 知识讲解（按子领域组织，由浅入深）
   - CardGrid: 每个子领域的知识点卡片 **(必须包含视觉模式字段)**
   - Timeline: 如果有历史发展阶段，添加时间线
   - Flashcard: 关键概念的自测卡片（3-5个）
   - FlashcardGrid: 难点深入理解的代码/实例卡片（如果有难点）

2. **视觉渲染指令 (Visual Context)** - 重要!:
   - CardGrid 中的每个 item 必须包含 \`visual_mode\` 和 \`icon\` 字段。
   - \`visual_mode\` 必须是以下三者之一:
     - 'terminal': 用于编程、代码、算法实现类内容 (黑底绿字风格)
     - 'schematic': 用于架构、流程、原理图类内容 (抽象线条风格)
     - 'icon': 用于概念、定义、历史类内容 (霓虹发光图标风格)
   - \`icon\`: 请选择一个最匹配的 Lucide React 图标名称 (PascalCase)。

3. **格式要求**:
   - 严格按照简化 Schema 格式输出
   - **只输出 JSON**，不要 markdown 标记，不要解释文字
   - 确保 JSON 格式标准（属性名用双引号，不要有尾随逗号）

## 简化 Schema 格式参考

\`\`\`json
{
  "page_id": "domain-subdomain",
  "title": "页面标题",
  "summary": "1-2句话概括",
  "blocks": [
    {
      "type": "cardgrid",
      "title": "核心技术",
      "content": {
        "cardgrid": {
          "items": [
            {
              "name": "Transformer架构",
              "description": "基于自注意力的深度神经网络...",
              "visual_mode": "schematic",
              "icon": "Workflow",
              "metadata": {
                "keywords": ["Attention"],
                "difficulty": "4"
              }
            }
          ]
        }
      }
    }
  ]
}
\`\`\`
`;

    const systemMessage: ChatMessage = {
      role: MessageRole.SYSTEM,
      content: systemPrompt
    };

    const userMessage: ChatMessage = {
      role: MessageRole.USER,
      content: userPrompt
    };

    return [systemMessage, userMessage];
  }

  /**
   * 构建系统提示
   */
  private buildSystemPrompt(style?: string): string {
    return `你是一个专业的教育内容创作专家。请生成标准的 JSON 数据。
    
注意事项：
1. 确保所有 JSON 键值对使用双引号。
2. 不要在列表最后一项后加逗号。
3. 如果需要写代码，请使用字符串形式，注意转义。
4. 确保 visual_mode 字段准确反映内容类型。
`;
  }

  /**
   * 强力解析 LLM 响应 (包含修复逻辑)
   */
  private parseResponse(content: string): any {
    console.log('🔍 开始解析 LLM 响应...');
    
    // 1. 尝试提取 JSON 块
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    } else {
      // 找不到代码块，尝试找第一个 { 和最后一个 }
      const start = content.indexOf('{');
      const end = content.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        jsonStr = content.substring(start, end + 1);
      }
    }

    // 2. 清理和修复
    jsonStr = this.repairJsonString(jsonStr);

    // 3. 解析
    try {
      const data = JSON.parse(jsonStr);

      // 验证基本结构
      if (!data.blocks) {
        throw new Error('Missing required fields: blocks');
      }

      return data;
    } catch (error) {
      console.warn('⚠️ JSON 解析失败，尝试截断修复...');
      // 最后的挣扎：尝试修复截断的 JSON
      try {
        // 简单的截断修复：补全括号
        // 这里只是一个简单的 heuristic，复杂的截断很难完美修复
        const fixedStr = jsonStr + ']}'; 
        return JSON.parse(fixedStr);
      } catch (e) {
        throw new Error(
          `Failed to parse LLM response as JSON: ${error instanceof Error ? error.message : 'Unknown error'}\nSnippet: ${jsonStr.slice(0, 100)}...`
        );
      }
    }
  }

  /**
   * JSON 字符串修复工具
   * 处理常见的 LLM 格式错误
   */
  private repairJsonString(str: string): string {
    let cleaned = str.trim();

    // 1. 移除注释
    cleaned = cleaned.replace(/\/\/.*$/gm, '');

    // 2. 移除尾随逗号 (Trailing Commas)
    // 匹配: , } -> } 和 , ] -> ]
    cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

    // 3. 修复丢失的逗号 (Missing Commas) - 这是最常见错误
    // 匹配: "value" "key" -> "value", "key"
    // 逻辑：结束引号/数字/布尔值 + 换行/空白 + 开始引号
    // 注意：这可能会误伤多行字符串，但标准 JSON 不允许字面换行，所以相对安全
    cleaned = cleaned.replace(/(["\d}le])\s*\n\s*"/g, '$1,\n"');

    return cleaned;
  }

  /**
   * 🔄 针对单个 Block 的 AI 优化
   * 用于 "Human-in-the-loop" 编辑流
   *
   * @param currentBlock - 当前要优化的 block 数据
   * @param instruction - 用户指令（可选）
   * @returns 优化后的 block 数据
   */
  async regenerateBlock(
    currentBlock: any,
    instruction: string = "优化这个模块的内容，使其更清晰、专业"
  ): Promise<any> {
    console.log('🔄 开始 AI 优化单个 Block...');
    console.log(`   类型: ${currentBlock.type}`);
    console.log(`   指令: ${instruction}`);

    const prompt = `
你是一个专业的前端内容优化助手。
请基于用户的指令，修改以下 UI Block 的 JSON 数据。

【用户指令】: "${instruction}"
【当前 Block 类型】: ${currentBlock.type}
【当前数据】:
\`\`\`json
${JSON.stringify(currentBlock, null, 2)}
\`\`\`

【要求】:
1. 保持 type 和结构不变
2. 仅优化 content, title, description 或 visual_mode 等展示层字段
3. 确保优化后的内容更符合用户指令
4. 直接返回标准的 JSON，不要任何 Markdown 标记（不要 \`\`\`json）
5. 确保 JSON 格式正确（属性名用双引号，不要有尾随逗号）

【优化示例】:
如果用户要求"让内容更简洁"，你应该：
- 精简 description 字段的文字
- 保留关键信息
- 移除冗余内容

如果用户要求"转换为代码风格"，你应该：
- 将 visual_mode 改为 "terminal"
- 在 content 中添加代码示例
`;

    try {
      // 调用 LLM
      const response = await this.llmClient.chat([
        { role: MessageRole.USER, content: prompt }
      ]);

      // 解析响应（复用现有的 parseResponse）
      const optimizedBlock = this.parseResponse(response.content);

      // 验证结果
      if (!optimizedBlock || !optimizedBlock.type) {
        throw new Error('优化后的数据无效：缺少 type 字段');
      }

      console.log('✅ AI 优化完成');
      console.log(`   原类型: ${currentBlock.type}`);
      console.log(`   新类型: ${optimizedBlock.type}`);

      return optimizedBlock;
    } catch (error) {
      console.error('❌ AI 优化失败:', error);
      throw error;
    }
  }

  /**
   * 生成并转换
   */
  async generateAndConvert(
    options: PathBasedGenerationOptions
  ): Promise<{ simplified: any; converted: any }> {
    // 生成简化格式
    const result = await this.generate(options);

    if (!result.success || !result.data) {
      throw new Error(result.error || '生成失败');
    }

    // 转换为系统格式
    console.log('🔄 转换 Schema...');
    const converted = SchemaConverter.convertPage(result.data);
    console.log('✅ 转换完成\n');

    return { simplified: result.data, converted };
  }
}