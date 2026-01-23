/**
 * Schema Converter
 *
 * 将简化版 Schema 转换为系统完整格式
 * 确保与现有 registry 完全兼容
 */

import { SimplifiedPage, SimplifiedBlock } from '@/schemas/simplified';
import { PageSchema, Block } from '@/renderer/registry';

export class SchemaConverter {
  /**
   * 转换整个页面
   */
  static convertPage(simple: SimplifiedPage): PageSchema {
    return {
      page_id: simple.page_id,
      pageMode: 'interactive-article',
      title: simple.title,
      summary: simple.summary,
      sections: [{
        section_id: 'main',
        sectionType: 'Article',
        title: simple.title,
        layoutIntent: 'prose-view',
        pedagogicalGoal: 'Interactive learning',
        blocks: simple.blocks.map(block => this.convertBlock(block))
      }],
      components: [] // 会在 normalizeSchema 中填充
    };
  }

  /**
   * 转换单个 Block
   */
  static convertBlock(simple: SimplifiedBlock): Block {
    // 1. 转换 type 名称（小写 → 大写）
    const typeMap: Record<string, string> = {
      'hero': 'Hero',
      'markdown': 'Markdown',
      'flashcard': 'Flashcard',
      'cardgrid': 'CardGrid',
      'timeline': 'Timeline',
      'cloze': 'Cloze'
    };

    const fullType = typeMap[simple.type];
    if (!fullType) {
      throw new Error(`Unknown block type: ${simple.type}`);
    }

    // 2. 根据类型转换内容
    const converted: any = { type: fullType };

    switch (simple.type) {
      case 'hero':
        converted.content = this.convertHeroContent(simple);
        if (simple.metadata?.agent_type) {
          converted.role = 'header';
        }
        break;

      case 'markdown':
        converted.content = this.extractStringContent(simple.content);
        break;

      case 'flashcard':
        Object.assign(converted, this.convertFlashcardContent(simple));
        break;

      case 'cardgrid':
        converted.content = this.convertCardGridContent(simple);
        break;

      case 'timeline':
        converted.content = this.convertTimelineContent(simple);
        break;

      case 'cloze':
        converted.content = this.convertClozeContent(simple);
        break;
    }

    // 3. 添加可选字段
    if (simple.title) {
      converted.title = simple.title;
    }

    if (simple.metadata) {
      converted.metadata = simple.metadata;
    }

    return converted as Block;
  }

  /**
   * 转换 Hero 内容
   */
  private static convertHeroContent(simple: SimplifiedBlock) {
    const content = simple.content as any;
    const hero = content.hero || {};

    return {
      title: simple.title || 'Untitled',
      subtitle: hero.subtitle,
      features: hero.features || []
    };
  }

  /**
   * 转换 Flashcard 内容
   */
  private static convertFlashcardContent(simple: SimplifiedBlock) {
    const content = simple.content as any;
    const flashcard = content.flashcard || {};

    return {
      id: `flashcard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      front: {
        title: simple.title || '问题',
        content: flashcard.question
      },
      back: {
        title: '答案',
        content: flashcard.answer
      }
    };
  }

  /**
   * 转换 CardGrid 内容
   */
  private static convertCardGridContent(simple: SimplifiedBlock) {
    const content = simple.content as any;
    const cardgrid = content.cardgrid || {};

    return {
      title: simple.title,
      items: cardgrid.items.map((item: any) => ({
        name: item.name,
        description: item.description,
        keywords: item.metadata?.keywords,
        common_misconceptions: item.metadata?.misconceptions,
        subdomain: simple.metadata?.agent_type === 'code' ? 'code-practice' : 'general'
      }))
    };
  }

  /**
   * 转换 Timeline 内容
   */
  private static convertTimelineContent(simple: SimplifiedBlock) {
    const content = simple.content as any;
    const timeline = content.timeline || {};

    return {
      title: simple.title,
      items: timeline.events.map((event: any) => ({
        year: event.year || event.period,
        title: event.title,
        description: event.description,
        label: event.period,
        subdomain: 'history'
      }))
    };
  }

  /**
   * 转换 Cloze 内容
   */
  private static convertClozeContent(simple: SimplifiedBlock) {
    const content = simple.content as any;
    const cloze = content.cloze || {};

    return cloze.text || simple.content.toString();
  }

  /**
   * 提取字符串内容
   */
  private static extractStringContent(content: any): string {
    if (typeof content === 'string') {
      return content;
    }
    return content.toString();
  }
}
