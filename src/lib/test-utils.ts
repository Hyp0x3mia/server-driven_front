/**
 * Test Utilities
 *
 * 测试辅助函数和工具
 */

/**
 * 深度比较两个对象
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return false;
  if (typeof obj1 !== typeof obj2) return false;

  if (typeof obj1 !== 'object') {
    return obj1 === obj2;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}

/**
 * 格式化错误信息
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}\n${error.stack}`;
  }
  return String(error);
}

/**
 * 生成随机测试数据
 */
export function generateTestData() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);

  return {
    page_id: `test-${timestamp}-${random}`,
    title: `测试页面 ${timestamp}`,
    summary: '自动化测试生成的内容',
    blocks: [
      {
        type: 'hero',
        title: '测试标题',
        content: {
          hero: {
            subtitle: '测试副标题',
            features: ['特性1', '特性2', '特性3']
          }
        },
        metadata: {
          agent_type: 'knowledge',
          difficulty: 'beginner'
        }
      },
      {
        type: 'markdown',
        title: '测试 Markdown',
        content: '# 测试内容\n\n这是一个测试段落。',
        metadata: {
          keywords: ['test', 'automation']
        }
      }
    ]
  };
}

/**
 * 验证 Block 结构
 */
export function validateBlockStructure(block: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 检查必需字段
  if (!block.type) {
    errors.push('缺少 type 字段');
  }

  if (!block.content) {
    errors.push('缺少 content 字段');
  }

  // 检查 type 值
  const validTypes = ['hero', 'markdown', 'flashcard', 'cardgrid', 'timeline', 'cloze'];
  if (block.type && !validTypes.includes(block.type)) {
    errors.push(`无效的 type: ${block.type}，必须是 ${validTypes.join('、')} 之一`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 模拟 Agent 生成内容
 */
export function mockAgentGeneration(agentType: 'knowledge' | 'code' | 'quiz') {
  const timestamp = Date.now();

  switch (agentType) {
    case 'knowledge':
      return {
        page_id: `knowledge-${timestamp}`,
        title: 'Agent 生成的知识页面',
        summary: '由知识讲解 Agent 自动生成',
        blocks: [
          {
            type: 'hero',
            title: 'Agent 生成：React 简介',
            content: {
              hero: {
                subtitle: 'Agent 生成副标题',
                features: ['特性A', '特性B']
              }
            },
            metadata: { agent_type: 'knowledge' }
          },
          {
            type: 'markdown',
            title: 'Agent 生成：概念讲解',
            content: '# 概念讲解\n\n这是 Agent 生成的内容。',
            metadata: { agent_type: 'knowledge' }
          }
        ]
      };

    case 'code':
      return {
        page_id: `code-${timestamp}`,
        title: 'Agent 生成的代码练习',
        summary: '由代码练习 Agent 自动生成',
        blocks: [
          {
            type: 'flashcard',
            title: 'Agent 生成：代码测试',
            content: {
              flashcard: {
                question: '```javascript\nconsole.log("Hello");\n```',
                answer: '输出: Hello',
                question_type: 'code',
                code_language: 'javascript'
              }
            },
            metadata: { agent_type: 'code', confidence: 0.85 }
          }
        ]
      };

    case 'quiz':
      return {
        page_id: `quiz-${timestamp}`,
        title: 'Agent 生成的测验',
        summary: '由测验生成 Agent 自动生成',
        blocks: [
          {
            type: 'cloze',
            title: 'Agent 生成：填空题',
            content: {
              cloze: {
                text: '这是一个{{填空}}测试。',
                hints: ['提示1']
              }
            },
            metadata: { agent_type: 'quiz' }
          }
        ]
      };

    default:
      throw new Error(`Unknown agent type: ${agentType}`);
  }
}

/**
 * 性能测试工具
 */
export class PerformanceTimer {
  private startTime: number;
  private endTime?: number;

  start() {
    this.startTime = performance.now();
  }

  end() {
    this.endTime = performance.now();
    return this.getDuration();
  }

  getDuration() {
    if (this.endTime === undefined) {
      return performance.now() - this.startTime;
    }
    return this.endTime - this.startTime;
  }

  getDurationMs() {
    return Math.round(this.getDuration());
  }

  getFormattedDuration() {
    const ms = this.getDurationMs();
    if (ms < 1000) {
      return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
  }
}

/**
 * 测试报告生成器
 */
export interface TestReport {
  timestamp: string;
  suite: string;
  results: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    duration: string;
  };
}

export interface TestResult {
  name: string;
  status: 'pass' | 'fail';
  duration: string;
  error?: string;
}

export class TestReportGenerator {
  private results: TestResult[] = [];
  private suiteName = '';
  private timer = new PerformanceTimer();

  startSuite(name: string) {
    this.suiteName = name;
    this.results = [];
    this.timer.start();
  }

  addResult(name: string, status: 'pass' | 'fail', error?: string) {
    this.results.push({
      name,
      status,
      duration: this.timer.getFormattedDuration(),
      error
    });
  }

  endSuite(): TestReport {
    this.timer.end();

    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;

    return {
      timestamp: new Date().toISOString(),
      suite: this.suiteName,
      results: this.results,
      summary: {
        total: this.results.length,
        passed,
        failed,
        duration: this.timer.getFormattedDuration()
      }
    };
  }

  printReport() {
    const report = this.endSuite();

    console.log('\n========================================');
    console.log(`🧪 测试报告: ${report.suite}`);
    console.log('========================================');
    console.log(`⏱️  总耗时: ${report.summary.duration}`);
    console.log(`📊 测试结果: ${report.summary.passed}/${report.summary.total} 通过`);
    console.log('========================================\n');

    report.results.forEach((result, idx) => {
      const icon = result.status === 'pass' ? '✅' : '❌';
      console.log(`${icon} ${idx + 1}. ${result.name} (${result.duration})`);
      if (result.error) {
        console.log(`   错误: ${result.error}`);
      }
    });

    console.log('\n========================================\n');
  }

  saveToFile() {
    const report = this.endSuite();
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
