/**
 * Agent Mock Tests
 *
 * 模拟 Agent 生成内容的测试
 */

import { describe, it, expect } from 'vitest';
import { SchemaConverter } from './schema-converter';
import { mockAgentGeneration, TestReportGenerator } from './test-utils';

describe('Agent Mock Tests', () => {
  let reportGenerator: TestReportGenerator;

  beforeEach(() => {
    reportGenerator = new TestReportGenerator();
  });

  describe('知识讲解 Agent 模拟', () => {
    it('应该生成有效的知识页面', () => {
      reportGenerator.startSuite('知识讲解 Agent 模拟');

      const mockData = mockAgentGeneration('knowledge');
      const validation = validateBlockStructure(mockData.blocks[0]);

      expect(validation.valid).toBe(true);
      reportGenerator.addResult(
        '生成有效内容',
        validation.valid ? 'pass' : 'fail',
        validation.errors.join('; ')
      );
    });

    it('应该包含 hero 和 markdown blocks', () => {
      const mockData = mockAgentGeneration('knowledge');
      const types = mockData.blocks.map((b: any) => b.type);

      expect(types).toContain('hero');
      expect(types).toContain('markdown');
    });
  });

  describe('代码练习 Agent 模拟', () => {
    it('应该生成有效的代码练习页面', () => {
      reportGenerator.startSuite('代码练习 Agent 模拟');

      const mockData = mockAgentGeneration('code');
      const validation = validateBlockStructure(mockData.blocks[0]);

      expect(validation.valid).toBe(true);
      reportGenerator.addResult(
        '代码格式正确',
        validation.valid ? 'pass' : 'fail',
        validation.errors.join('; ')
      );
    });

    it('应该包含 flashcard block', () => {
      const mockData = mockAgentGeneration('code');
      const flashcardBlock = mockData.blocks.find((b: any) => b.type === 'flashcard');

      expect(flashcardBlock).toBeDefined();
      expect(flashcardBlock.content.flashcard.question_type).toBe('code');
    });
  });

  describe('测验生成 Agent 模拟', () => {
    it('应该生成有效的测验页面', () => {
      reportGenerator.startSuite('测验生成 Agent 模拟');

      const mockData = mockAgentGeneration('quiz');
      const validation = validateBlockStructure(mockData.blocks[0]);

      expect(validation.valid).toBe(true);
      reportGenerator.addResult(
        '测验格式正确',
        validation.valid ? 'pass' : 'fail',
        validation.errors.join('; ')
      );
    });

    it('应该包含 cloze block', () => {
      const mockData = mockAgentGeneration('quiz');
      const clozeBlock = mockData.blocks.find((b: any) => b.type === 'cloze');

      expect(clozeBlock).toBeDefined();
      expect(clozeBlock.content.cloze.text).toContain('{{');
    });
  });

  describe('端到端转换测试', () => {
    it('知识 Agent 生成内容应能正确转换', () => {
      reportGenerator.startSuite('知识 Agent 端到端');

      try {
        const mockData = mockAgentGeneration('knowledge');
        const converted = SchemaConverter.convertPage(mockData);

        expect(converted).toBeDefined();
        expect(converted.sections).toBeDefined();
        expect(converted.sections[0].blocks.length).toBeGreaterThan(0);

        reportGenerator.addResult('转换成功', 'pass');
      } catch (error) {
        reportGenerator.addResult('转换失败', 'fail', String(error));
      }

      reportGenerator.printReport();
    });

    it('代码 Agent 生成内容应能正确转换', () => {
      reportGenerator.startSuite('代码 Agent 端到端');

      try {
        const mockData = mockAgentGeneration('code');
        const converted = SchemaConverter.convertPage(mockData);

        expect(converted).toBeDefined();
        const flashcardBlock = converted.sections[0].blocks.find((b: any) => b.type === 'Flashcard');
        expect(flashcardBlock).toBeDefined();

        reportGenerator.addResult('代码内容转换', 'pass');
      } catch (error) {
        reportGenerator.addResult('代码内容转换失败', 'fail', String(error));
      }

      reportGenerator.printReport();
    });

    it('测验 Agent 生成内容应能正确转换', () => {
      reportGenerator.startSuite('测验 Agent 端到端');

      try {
        const mockData = mockAgentGeneration('quiz');
        const converted = SchemaConverter.convertPage(mockData);

        expect(converted).toBeDefined();
        const clozeBlock = converted.sections[0].blocks.find((b: any) => b.type === 'Cloze');
        expect(clozeBlock).toBeDefined();

        reportGenerator.addResult('测验内容转换', 'pass');
      } catch (error) {
        reportGenerator.addResult('测验内容转换失败', 'fail', String(error));
      }

      reportGenerator.printReport();
    });
  });
});

/**
 * 模拟完整的工作流
 */
export function simulateAgentWorkflow() {
  console.log('🤖 模拟完整 Agent 工作流...\n');

  const reportGenerator = new TestReportGenerator();

  // 1. 知识讲解 Agent
  console.log('1️⃣ 知识讲解 Agent 生成内容...');
  const knowledgePage = mockAgentGeneration('knowledge');
  console.log('   ✓ 生成完成:', knowledgePage.title);
  console.log('   ✓ 包含块:', knowledgePage.blocks.map((b: any) => b.type).join(', '));

  // 2. 代码练习 Agent
  console.log('\n2️⃣ 代码练习 Agent 生成内容...');
  const codePage = mockAgentGeneration('code');
  console.log('   ✓ 生成完成:', codePage.title);
  console.log('   ✓ 包含块:', codePage.blocks.map((b: any) => b.type).join(', '));

  // 3. 测验生成 Agent
  console.log('\n3️⃣ 测验生成 Agent 生成内容...');
  const quizPage = mockAgentGeneration('quiz');
  console.log('   ✓ 生成完成:', quizPage.title);
  console.log('   ✓ 包含块:', quizPage.blocks.map((b: any) => b.type).join(', '));

  // 4. Schema 转换验证
  console.log('\n4️⃣ 转换并验证所有页面...');
  const pages = [
    { name: '知识页面', data: knowledgePage },
    { name: '代码页面', data: codePage },
    { name: '测验页面', data: quizPage }
  ];

  pages.forEach(({ name, data }) => {
    try {
      const converted = SchemaConverter.convertPage(data);
      const validation = validateBlockStructure(converted.sections[0].blocks[0]);

      if (validation.valid) {
        console.log(`   ✓ ${name} 转换成功`);
      } else {
        console.log(`   ✗ ${name} 转换失败:`, validation.errors);
      }
    } catch (error) {
      console.log(`   ✗ ${name} 转换异常:`, (error as Error).message);
    }
  });

  console.log('\n✅ 工作流模拟完成！');
}

/**
 * 性能基准测试
 */
export function benchmarkConversion() {
  console.log('⚡ 性能基准测试...\n');

  const iterations = 100;
  const timer = new PerformanceTimer();

  // 测试数据
  const testData = mockAgentGeneration('knowledge');

  timer.start();

  for (let i = 0; i < iterations; i++) {
    SchemaConverter.convertPage(testData);
  }

  timer.end();

  const avgTime = timer.getDurationMs() / iterations;

  console.log(`📊 性能测试结果:`);
  console.log(`   总迭代次数: ${iterations}`);
  console.log(`   总耗时: ${timer.getFormattedDuration()}`);
  console.log(`   平均耗时: ${avgTime.toFixed(2)}ms/次`);
  console.log(`   吞吐量: ${(1000 / avgTime).toFixed(2)} 次/秒`);

  if (avgTime < 10) {
    console.log('   ✅ 性能优秀 (< 10ms)');
  } else if (avgTime < 50) {
    console.log('   ✅ 性能良好 (< 50ms)');
  } else {
    console.log('   ⚠️  性能需要优化 (> 50ms)');
  }
}
