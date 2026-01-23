/**
 * End-to-End Automation Test Suite
 *
 * 完整的自动化测试流程
 */

import { SchemaConverter } from './schema-converter';
import { mockAgentGeneration, TestReportGenerator, PerformanceTimer } from './test-utils';

/**
 * 运行所有测试套件
 */
export function runAllTests() {
  console.log('\n🚀 开始端到端自动化测试\n');
  console.log('========================================\n');

  const reportGenerator = new TestReportGenerator();

  // 测试套件1: Schema 转换
  runSchemaConversionTests(reportGenerator);

  // 测试套件2: Agent 模拟
  runAgentSimulationTests(reportGenerator);

  // 测试套件3: 性能基准
  runPerformanceTests(reportGenerator);

  // 生成最终报告
  console.log('\n========================================');
  console.log('📊 最终测试报告');
  console.log('========================================\n');

  const finalReport = reportGenerator.endSuite();
  console.log(`总测试数: ${finalReport.summary.total}`);
  console.log(`通过: ${finalReport.summary.passed}`);
  console.log(`失败: ${finalReport.summary.failed}`);
  console.log(`总耗时: ${finalReport.summary.duration}`);
  console.log('\n========================================\n');

  // 保存报告
  reportGenerator.saveToFile();

  return finalReport;
}

/**
 * Schema 转换测试套件
 */
function runSchemaConversionTests(reportGenerator: TestReportGenerator) {
  console.log('📋 测试套件1: Schema 转换');
  console.log('----------------------------------------\n');

  reportGenerator.startSuite('Schema 转换');

  // 测试1: 基本转换
  try {
    const testData = mockAgentGeneration('knowledge');
    const converted = SchemaConverter.convertPage(testData);

    if (converted && converted.sections && converted.sections[0].blocks) {
      reportGenerator.addResult('基本页面转换', 'pass');
    } else {
      reportGenerator.addResult('基本页面转换', 'fail', '转换结果为空');
    }
  } catch (error) {
    reportGenerator.addResult('基本页面转换', 'fail', String(error));
  }

  // 测试2: 所有 Block 类型
  const blockTypes = ['hero', 'markdown', 'flashcard', 'cardgrid', 'timeline', 'cloze'] as const;

  blockTypes.forEach(type => {
    try {
      let simpleBlock: any = {
        type,
        title: `测试 ${type}`
      };

      // Set content based on type
      if (type === 'markdown') {
        simpleBlock.content = '测试内容';
      } else if (type === 'hero') {
        simpleBlock.content = {
          hero: {
            subtitle: '副标题',
            features: ['f1', 'f2']
          }
        };
      } else if (type === 'cloze') {
        simpleBlock.content = {
          cloze: {
            text: '这是一个{{填空}}测试'
          }
        };
      } else if (type === 'flashcard') {
        simpleBlock.content = {
          flashcard: {
            question: '测试问题',
            answer: '测试答案'
          }
        };
      } else if (type === 'cardgrid') {
        simpleBlock.content = {
          cardgrid: {
            items: [{ name: '卡片1', description: '描述1' }]
          }
        };
      } else if (type === 'timeline') {
        simpleBlock.content = {
          timeline: {
            events: [{ year: '2020', title: '事件1', description: '描述1' }]
          }
        };
      }

      const converted = SchemaConverter.convertBlock(simpleBlock);
      reportGenerator.addResult(`转换 ${type} block`, 'pass');
    } catch (error) {
      reportGenerator.addResult(`转换 ${type} block`, 'fail', String(error));
    }
  });

  // 测试3: metadata 传递
  try {
    const simpleBlock = {
      type: 'cardgrid',
      metadata: {
        agent_type: 'code',
        difficulty: 'advanced'
      },
      content: {
        cardgrid: {
          items: [{ name: '测试', description: '描述' }]
        }
      }
    };

    const converted = SchemaConverter.convertBlock(simpleBlock as any);
    const convertedSubdomain = converted.content.items[0].subdomain;

    if (convertedSubdomain === 'code-practice') {
      reportGenerator.addResult('metadata 正确传递', 'pass');
    } else {
      reportGenerator.addResult('metadata 正确传递', 'fail', `subdomain 错误: ${convertedSubdomain}`);
    }
  } catch (error) {
    reportGenerator.addResult('metadata 正确传递', 'fail', String(error));
  }
}

/**
 * Agent 模拟测试套件
 */
function runAgentSimulationTests(reportGenerator: TestReportGenerator) {
  console.log('\n🤖 测试套件2: Agent 模拟');
  console.log('----------------------------------------\n');

  const agentTypes = ['knowledge', 'code', 'quiz'] as const;

  agentTypes.forEach(agentType => {
    console.log(`\n  测试 ${agentType} Agent...`);

    try {
      const mockData = mockAgentGeneration(agentType);

      // 验证 1: 格式正确性
      if (!mockData.page_id || !mockData.blocks) {
        throw new Error('缺少必需字段');
      }

      // 验证 2: blocks 非空
      if (mockData.blocks.length === 0) {
        throw new Error('blocks 为空');
      }

      // 验证 3: 类型正确性
      mockData.blocks.forEach((block: any) => {
        const validTypes = ['hero', 'markdown', 'flashcard', 'cardgrid', 'timeline', 'cloze'];
        if (!validTypes.includes(block.type)) {
          throw new Error(`无效的 block type: ${block.type}`);
        }
      });

      // 验证 4: 转换成功
      const converted = SchemaConverter.convertPage(mockData);
      if (!converted.sections || !converted.sections[0]) {
        throw new Error('转换失败');
      }

      console.log(`    ✓ 生成有效内容`);
      console.log(`    ✓ 包含 ${mockData.blocks.length} 个 blocks`);
      console.log(`    ✓ 转换成功`);

      reportGenerator.addResult(`${agentType} Agent 模拟`, 'pass');
    } catch (error) {
      console.log(`    ✗ 错误:`, (error as Error).message);
      reportGenerator.addResult(`${agentType} Agent 模拟`, 'fail', String(error));
    }
  });
}

/**
 * 性能基准测试套件
 */
function runPerformanceTests(reportGenerator: TestReportGenerator) {
  console.log('\n⚡ 测试套件3: 性能基准');
  console.log('----------------------------------------\n');

  // 测试1: 单次转换性能
  const testData = mockAgentGeneration('knowledge');
  const timer = new PerformanceTimer();

  timer.start();
  SchemaConverter.convertPage(testData);
  const singleDuration = timer.end();

  console.log(`\n  单次转换:`);
  console.log(`    耗时: ${singleDuration}ms`);
  console.log(`    评级: ${getPerformanceRating(singleDuration)}`);

  reportGenerator.addResult('单次转换性能', singleDuration < 50 ? 'pass' : 'fail');

  // 测试2: 批量转换性能
  const iterations = 50;
  const batchTimer = new PerformanceTimer();

  batchTimer.start();
  for (let i = 0; i < iterations; i++) {
    SchemaConverter.convertPage(testData);
  }
  const batchDuration = batchTimer.end();
  const avgTime = batchDuration / iterations;

  console.log(`\n  批量转换 (${iterations} 次):`);
  console.log(`    总耗时: ${batchDuration}ms`);
  console.log(`    平均耗时: ${avgTime.toFixed(2)}ms`);
  console.log(`    吞吐量: ${(1000 / avgTime).toFixed(2)} 页/秒`);

  reportGenerator.addResult('批量转换性能', avgTime < 20 ? 'pass' : 'fail');
}

/**
 * 获取性能评级
 */
function getPerformanceRating(durationMs: number): string {
  if (durationMs < 10) return '优秀 ⚡';
  if (durationMs < 50) return '良好 👍';
  if (durationMs < 100) return '一般 😐';
  return '需要优化 ⚠️';
}

/**
 * 生成测试报告
 */
export function generateTestReport() {
  console.log('\n📊 生成测试报告...\n');

  // 保存测试配置
  const config = {
    timestamp: new Date().toISOString(),
    environment: navigator.userAgent,
    testSuite: 'Schema Converter Automation',
    version: '1.0.0'
  };

  console.log('测试配置:', JSON.stringify(config, null, 2));

  return config;
}

/**
 * CI/CD 友好的测试命令
 */
export const testCommands = {
  // 运行所有测试
  all: 'npm test',

  // 运行特定测试
  schema: 'npm run test:schema',
  agents: 'npm run test:agents',
  performance: 'npm run test:performance',

  // 生成覆盖率报告
  coverage: 'npm run test:coverage',

  // 监视模式（文件变化时自动运行）
  watch: 'npm run test:watch'
};

/**
 * 导出测试入口
 */
export const testEntryPoints = {
  // 命令行测试
  cli: async () => {
    return runAllTests();
  },

  // 浏览器测试
  browser: async () => {
    // 在浏览器控制台运行
    (window as any).runAllTests();
    return generateTestReport();
  },

  // 持续集成
  ci: async () => {
    const report = runAllTests();
    const passed = report.summary.failed === 0;
    return passed ? 0 : 1; // 0 = success, 1 = failure
  }
};

/**
 * 模拟完整 Agent 工作流
 */
export function simulateAgentWorkflow() {
  console.log('\n🤖 模拟完整 Agent 工作流...\n');
  console.log('========================================\n');

  const reportGenerator = new TestReportGenerator();

  // 1. 知识讲解 Agent
  console.log('1️⃣ 知识讲解 Agent 生成内容...');
  const knowledgePage = mockAgentGeneration('knowledge');
  console.log(`   ✓ 生成完成: ${knowledgePage.title}`);
  console.log(`   ✓ 包含块: ${knowledgePage.blocks.map((b: any) => b.type).join(', ')}`);

  // 2. 代码练习 Agent
  console.log('\n2️⃣ 代码练习 Agent 生成内容...');
  const codePage = mockAgentGeneration('code');
  console.log(`   ✓ 生成完成: ${codePage.title}`);
  console.log(`   ✓ 包含块: ${codePage.blocks.map((b: any) => b.type).join(', ')}`);

  // 3. 测验生成 Agent
  console.log('\n3️⃣ 测验生成 Agent 生成内容...');
  const quizPage = mockAgentGeneration('quiz');
  console.log(`   ✓ 生成完成: ${quizPage.title}`);
  console.log(`   ✓ 包含块: ${quizPage.blocks.map((b: any) => b.type).join(', ')}`);

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
  console.log('========================================\n');
}

/**
 * 性能基准测试
 */
export function benchmarkConversion() {
  console.log('\n⚡ 性能基准测试...\n');
  console.log('========================================\n');

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

  console.log('========================================\n');

  return {
    iterations,
    totalTime: timer.getFormattedDuration(),
    avgTime: avgTime.toFixed(2),
    throughput: (1000 / avgTime).toFixed(2)
  };
}

// 导出到全局（用于浏览器控制台访问）
if (typeof window !== 'undefined') {
  (window as any).testAutomation = {
    runAllTests,
    simulateAgentWorkflow,
    benchmarkConversion,
    generateTestReport,
    ...testEntryPoints
  };

  console.log('✅ 测试自动化模块加载完成！');
  console.log('📖 使用方法:');
  console.log('   - 运行测试: testAutomation.runAllTests()');
  console.log('   - 模拟工作流: testAutomation.simulateAgentWorkflow()');
  console.log('   - 性能测试: testAutomation.benchmarkConversion()');
}