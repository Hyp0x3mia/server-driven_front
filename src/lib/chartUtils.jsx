import {
  Zap, Brain, Eye, Puzzle, Bot, Database, ImageIcon, Type, Gamepad2,
  Terminal, Code, Cpu, Layers, Network, Workflow, GitBranch
} from 'lucide-react';

// Helper function to check if title contains keywords
const hasKeywords = (title, keywords) => {
  if (!title) return false;
  const lowerTitle = title.toLowerCase();
  return keywords.some(keyword => lowerTitle.includes(keyword.toLowerCase()));
};

// Generates structured data for a high-level visual based on title and subdomain
export const generateVisual = (item, subdomain) => {
  const title = item?.name || '';
  const description = item?.description || '';

  // Combine title and description for keyword matching
  const fullText = `${title} ${description}`.toLowerCase();

  // ========== 模式 A: 极简终端 ==========
  // 触发关键词: 代码, Python, 预训练, 微调, 实现, 输出, Log, JavaScript, React, Hooks
  const terminalKeywords = [
    '代码', 'python', '预训练', '微调', '实现', '输出', 'log',
    'javascript', 'react', 'hooks', '代码', '闭包', 'useeffect',
    'programming', 'code', 'implementation'
  ];

  if (hasKeywords(fullText, terminalKeywords)) {
    return {
      type: 'mini_terminal',
      title: title,
    };
  }

  // ========== 模式 B: 微缩架构图 ==========
  // 触发关键词: 架构, 模型, 流程, Transformer, 神经网络, RAG, 结构, 网络, 系统
  const schematicKeywords = [
    '架构', '模型', '流程', 'transformer', '神经网络', 'rag', '结构',
    '网络', '系统', 'architecture', 'model', 'structure', 'network',
    'nlp', '文本分类', '机器翻译', '对话系统'
  ];

  if (hasKeywords(fullText, schematicKeywords)) {
    return {
      type: 'abstract_schematic',
      title: title,
    };
  }

  // ========== 模式 C: 霓虹图标 (默认) ==========
  // 对于其他所有情况，使用发光图标
  // 根据内容选择合适的图标
  let icon = <Bot />;

  if (hasKeywords(fullText, ['历史', '发展', '时间', 'year', 'history'])) {
    icon = <GitBranch />;
  } else if (hasKeywords(fullText, ['分析', '理解', 'analyze', 'understand'])) {
    icon = <Brain />;
  } else if (hasKeywords(fullText, ['任务', '功能', 'task', 'capability'])) {
    icon = <Zap />;
  } else if (hasKeywords(fullText, ['情感', 'sentiment', 'emotion'])) {
    icon = <Eye />;
  } else if (hasKeywords(fullText, ['摘要', 'summary', 'summarization'])) {
    icon = <Type />;
  } else if (hasKeywords(fullText, ['翻译', 'translation', 'translate'])) {
    icon = <Workflow />;
  } else if (hasKeywords(fullText, ['阅读', 'reading', 'comprehension'])) {
    icon = <Database />;
  } else if (hasKeywords(fullText, ['向量', 'vector', 'embedding'])) {
    icon = <Network />;
  } else if (hasKeywords(fullText, ['学习', 'learning', 'training'])) {
    icon = <Layers />;
  } else if (hasKeywords(fullText, ['处理', 'process', 'processing'])) {
    icon = <Cpu />;
  }

  return {
    type: 'neon_icon',
    icon: icon,
    title: title,
  };
};

// Generates a fallback mock code snippet
export const generateMockCode = (item) => {
  const title = item?.name || "Untitled";

  return `
# Generating logic for ${title}...
class AI_Concept:
    def __init__(self):
        self.concept = "${title}"
        self.status = "Initializing..."

def explain():
    return "Analysis complete."

# Run analysis
explain()
  `;
};
