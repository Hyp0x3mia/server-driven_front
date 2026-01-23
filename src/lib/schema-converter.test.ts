/**
 * Schema Converter Tests
 *
 * Schema 转换器的自动化测试用例
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SchemaConverter } from './schema-converter';
import { EXAMPLE_PAGE } from '@/schemas/simplified';
import { mockAgentGeneration, validateBlockStructure, deepEqual } from './test-utils';

describe('SchemaConverter', () => {
  describe('convertPage - 页面转换', () => {
    it('应该正确转换示例页面', () => {
      const result = SchemaConverter.convertPage(EXAMPLE_PAGE);

      expect(result).toBeDefined();
      expect(result.page_id).toBe('react-hooks-basics');
      expect(result.title).toBe('React Hooks 基础教程');
      expect(result.pageMode).toBe('interactive-article');
      expect(result.sections).toBeDefined();
      expect(result.sections).toHaveLength(1);
    });

    it('应该包含所有 blocks', () => {
      const result = SchemaConverter.convertPage(EXAMPLE_PAGE);

      const blocks = result.sections[0].blocks;
      expect(blocks).toHaveLength(EXAMPLE_PAGE.blocks.length);
    });
  });

  describe('convertBlock - Block 转换', () => {
    describe('Hero 类型转换', () => {
      it('应该正确转换 hero block', () => {
        const simpleBlock = {
          type: 'hero',
          title: '测试标题',
          content: {
            hero: {
              subtitle: '测试副标题',
              features: ['特性1', '特性2', '特性3']
            }
          },
          metadata: {
            agent_type: 'knowledge'
          }
        };

        const result = SchemaConverter.convertBlock(simpleBlock as any);

        expect(result.type).toBe('Hero');
        expect(result.content).toEqual({
          title: '测试标题',
          subtitle: '测试副标题',
          features: ['特性1', '特性2', '特性3']
        });
      });

      it('应该添加 role 字段', () => {
        const simpleBlock = {
          type: 'hero',
          metadata: { agent_type: 'knowledge' }
        };

        const result = SchemaConverter.convertBlock(simpleBlock as any);

        expect(result.role).toBe('header');
      });
    });

    describe('Markdown 类型转换', () => {
      it('应该正确转换 markdown block', () => {
        const simpleBlock = {
          type: 'markdown',
          title: '测试 Markdown',
          content: '# 标题\n\n内容'
        };

        const result = SchemaConverter.convertBlock(simpleBlock as any);

        expect(result.type).toBe('Markdown');
        expect(result.content).toBe('# 标题\n\n内容');
      });
    });

    describe('Flashcard 类型转换', () => {
      it('应该正确转换 flashcard block', () => {
        const simpleBlock = {
          type: 'flashcard',
          title: '测试闪卡',
          content: {
            flashcard: {
              question: '什么是 React?',
              answer: 'React 是一个 UI 库'
            }
          }
        };

        const result = SchemaConverter.convertBlock(simpleBlock as any);

        expect(result.type).toBe('Flashcard');
        expect(result.front).toEqual({
          title: '测试闪卡',
          content: '什么是 React?'
        });
        expect(result.back).toEqual({
          title: '答案',
          content: 'React 是一个 UI 库'
        });
      });

      it('应该生成唯一的 ID', () => {
        const simpleBlock = {
          type: 'flashcard',
          content: {
            flashcard: {
              question: '测试',
              answer: '答案'
            }
          }
        };

        const result1 = SchemaConverter.convertBlock(simpleBlock as any);
        const result2 = SchemaConverter.convertBlock(simpleBlock as any);

        expect(result1.id).not.toBe(result2.id);
      });
    });

    describe('CardGrid 类型转换', () => {
      it('应该正确转换 cardgrid block', () => {
        const simpleBlock = {
          type: 'cardgrid',
          title: '测试卡片网格',
          content: {
            cardgrid: {
              items: [
                {
                  name: '卡片1',
                  description: '描述1',
                  metadata: {
                    keywords: ['key1', 'key2']
                  }
                },
                {
                  name: '卡片2',
                  description: '描述2'
                }
              ]
            }
          }
        };

        const result = SchemaConverter.convertBlock(simpleBlock as any);

        expect(result.type).toBe('CardGrid');
        expect(result.content.title).toBe('测试卡片网格');
        expect(result.content.items).toHaveLength(2);
        expect(result.content.items[0].name).toBe('卡片1');
        expect(result.content.items[0].keywords).toEqual(['key1', 'key2']);
      });

      it('应该根据 agent_type 设置 subdomain', () => {
        const simpleBlock = {
          type: 'cardgrid',
          metadata: { agent_type: 'code' },
          content: {
            cardgrid: {
              items: [{ name: '卡片1', description: '描述1' }]
            }
          }
        };

        const result = SchemaConverter.convertBlock(simpleBlock as any);

        expect(result.content.items[0].subdomain).toBe('code-practice');
      });
    });

    describe('Timeline 类型转换', () => {
      it('应该正确转换 timeline block', () => {
        const simpleBlock = {
          type: 'timeline',
          title: '测试时间轴',
          content: {
            timeline: {
              events: [
                {
                  year: '2020',
                  title: '事件1',
                  description: '描述1'
                },
                {
                  period: '2021-2022',
                  title: '事件2',
                  description: '描述2'
                }
              ]
            }
          }
        };

        const result = SchemaConverter.convertBlock(simpleBlock as any);

        expect(result.type).toBe('Timeline');
        expect(result.content.title).toBe('测试时间轴');
        expect(result.content.items).toHaveLength(2);
        expect(result.content.items[0].year).toBe('2020');
        expect(result.content.items[1].year).toBe('2021-2022');
        expect(result.content.items[1].label).toBe('2021-2022');
      });
    });

    describe('Cloze 类型转换', () => {
      it('应该正确转换 cloze block', () => {
        const simpleBlock = {
          type: 'cloze',
          title: '测试填空',
          content: {
            cloze: {
              text: '这是一个{{填空}}测试。',
              hints: ['提示1', '提示2']
            }
          }
        };

        const result = SchemaConverter.convertBlock(simpleBlock as any);

        expect(result.type).toBe('Cloze');
        expect(result.content).toBe('这是一个{{填空}}测试。');
      });

      it('应该支持字符串格式的 content', () => {
        const simpleBlock = {
          type: 'cloze',
          content: '简单的{{填空}}测试'
        };

        const result = SchemaConverter.convertBlock(simpleBlock as any);

        expect(result.type).toBe('Cloze');
        expect(result.content).toBe('简单的{{填空}}测试');
      });
    });
  });

  describe('错误处理', () => {
    it('应该抛出未知类型错误', () => {
      const invalidBlock = {
        type: 'invalid_type',
        content: {}
      };

      expect(() => {
        SchemaConverter.convertBlock(invalidBlock as any);
      }).toThrow('Unknown block type: invalid_type');
    });
  });
});

/**
 * 运行测试的入口函数
 */
export async function runTests() {
  console.log('🧪 开始运行 Schema Converter 测试...\n');

  // 注意：这里需要在支持 Vitest 的环境中运行
  // 或者使用自定义测试运行器
}
