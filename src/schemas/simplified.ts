/**
 * Simplified Schema for Agent Generation
 *
 * 为 Agent 生成优化的简化版 Schema
 * 设计原则：
 * 1. 扁平化结构 - 减少嵌套层次
 * 2. 统一命名 - 使用小写 type
 * 3. 智能默认 - 减少必需字段
 * 4. 灵活扩展 - metadata 字段容纳额外信息
 */

// ============ 基础类型 ============

export interface SimplifiedBlock {
  // 统一使用小写，Agent 更容易生成
  type: 'hero' | 'markdown' | 'flashcard' | 'cardgrid' | 'timeline' | 'cloze';

  // 可选的标题
  title?: string;

  // 主要内容（简化为字符串或对象）
  content: string | BlockContent;

  // 元数据（容纳所有可选字段）
  metadata?: {
    // 通用字段
    description?: string;
    keywords?: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';

    // Agent 特定字段
    agent_type?: 'knowledge' | 'code' | 'quiz';
    confidence?: number; // 0-1
    references?: string[];

    // 学习相关
    estimated_time?: number; // 分钟
    prerequisites?: string[];
  };
}

// ============ 内容类型 ============

export interface BlockContent {
  // Hero 内容
  hero?: {
    subtitle?: string;
    features?: string[];
  };

  // Flashcard 内容
  flashcard?: {
    question: string;
    answer: string;
    question_type?: 'concept' | 'code' | 'comparison';
    code_language?: string;
  };

  // CardGrid 内容
  cardgrid?: {
    items: CardItem[];
  };

  // Timeline 内容
  timeline?: {
    events: TimelineEvent[];
  };

  // Cloze 内容
  cloze?: {
    text: string; // 支持 {{answer}} 格式
    hints?: string[];
  };
}

export interface CardItem {
  name: string;
  description: string;
  // 所有可选字段放入 metadata
  metadata?: {
    keywords?: string[];
    misconceptions?: string[];
    examples?: string[];
  };
}

export interface TimelineEvent {
  year?: string;
  period?: string;
  title: string;
  description: string;
}

// ============ 完整页面结构 ============

export interface SimplifiedPage {
  page_id: string;
  title: string;
  summary: string;

  // 简化的 blocks 数组
  blocks: SimplifiedBlock[];
}

// ============ 示例 ============

export const EXAMPLE_PAGE: SimplifiedPage = {
  page_id: "react-hooks-basics",
  title: "React Hooks 基础教程",
  summary: "学习 React Hooks 的核心概念和实战技巧",

  blocks: [
    {
      type: "hero",
      title: "React Hooks",
      content: {
        hero: {
          subtitle: "让函数组件更强大",
          features: [
            " useState 状态管理",
            " useEffect 副作用处理",
            "自定义 Hooks 复用逻辑"
          ]
        }
      },
      metadata: {
        agent_type: "knowledge",
        difficulty: "beginner",
        estimated_time: 15
      }
    },
    {
      type: "markdown",
      title: "什么是 Hooks？",
      content: `
Hooks 是 React 16.8 引入的新特性，让你在不编写 class 的情况下使用 state 和其他 React 特性。

## 为什么需要 Hooks？

1. **组件间逻辑复用困难**：HOC 和 render props 模式复杂
2. **复杂组件难理解**：生命周期函数中包含不相关的逻辑
3. **class 陷阱**：this 指向和绑定问题
      `.trim(),
      metadata: {
        agent_type: "knowledge",
        keywords: ["react", "hooks", "状态管理"],
        prerequisites: ["JavaScript 基础", "React 组件基础"]
      }
    },
    {
      type: "cardgrid",
      title: "核心 Hooks 介绍",
      content: {
        cardgrid: {
          items: [
            {
              name: "useState",
              description: "在函数组件中添加 state",
              metadata: {
                keywords: ["state", "状态"],
                examples: ["const [count, setCount] = useState(0)"]
              }
            },
            {
              name: "useEffect",
              description: "处理副作用操作",
              metadata: {
                keywords: ["effect", "副作用"],
                examples: ["数据获取、订阅、DOM 操作"]
              }
            },
            {
              name: "useContext",
              description: "读取 context 值",
              metadata: {
                keywords: ["context", "上下文"]
              }
            }
          ]
        }
      },
      metadata: {
        agent_type: "knowledge",
        difficulty: "beginner"
      }
    },
    {
      type: "flashcard",
      title: "useState 自测",
      content: {
        flashcard: {
          question: "下面代码的问题是什么？\n\n```javascript\nconst [count, setCount] = useState(0);\ncount++;\n```",
          answer: "问题：直接修改 state\n\n解决：必须使用 setter 函数\n```javascript\nsetCount(count + 1);\n```",
          question_type: "code",
          code_language: "javascript"
        }
      },
      metadata: {
        agent_type: "code",
        confidence: 0.95
      }
    },
    {
      type: "cloze",
      title: "知识巩固",
      content: {
        cloze: {
          text: "React Hooks 必须在函数组件的{{顶层}}调用，不要在循环、条件或嵌套函数中调用。useEffect 的依赖数组为空数组时，effect 只会在组件{{挂载后}}运行一次。",
          hints: ["思考组件生命周期", "回忆 useEffect 的行为"]
        }
      },
      metadata: {
        agent_type: "quiz",
        difficulty: "beginner"
      }
    }
  ]
};
