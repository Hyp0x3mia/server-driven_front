import { Zap, Brain, Eye, Milestone, GitCommit, Scale, Puzzle, Bot, Database, ImageIcon, Type, Gamepad2 } from 'lucide-react';

// Generates structured data for a high-level visual based on subdomain
export const generateVisual = (item, subdomain) => {
  // 1. "AI Overview / Overall Understanding" -> Concept Cards
  if ((subdomain ?? '').includes('人工智能概述')) {
    return {
      type: 'concept_cards',
      cards: [
        { icon: <Eye />, title: 'Perception', description: 'Sensing the world.' },
        { icon: <Brain />, title: 'Reasoning', description: 'Thinking and planning.' },
        { icon: <Zap />, title: 'Action', description: 'Responding and acting.' },
      ]
    };
  }

  // 2. "Development History" -> Era Cards
  if ((subdomain ?? '').includes('发展历史')) {
    return {
      type: 'era_cards',
      eras: [
        { year: '1956', title: 'Symbolic AI', description: 'Early rule-based systems.' },
        { year: '2012', title: 'Deep Learning', description: 'The data-driven revolution.' },
        { year: '2023', title: 'Foundation Models', description: 'Emergence of general capabilities.' },
      ]
    };
  }

  // 3. "Technical Principles" -> Paradigm Comparison
  if ((subdomain ?? '').includes('技术原理')) {
      return {
          type: 'paradigm_comparison',
          paradigms: [
              { icon: <Puzzle />, title: 'Rule-Based', description: 'Explicit logic and programmed rules.' },
              { icon: <Database />, title: 'Data-Driven', description: 'Learns patterns from large datasets.' }
          ]
      }
  }

  // 4. "Machine Learning & Deep Learning" -> Capability Cards
  if ((subdomain ?? '').includes('机器学习') || (subdomain ?? '').includes('神经网络')) {
      return {
          type: 'capability_cards',
          capabilities: [
              { icon: <ImageIcon />, name: 'Image Recognition' },
              { icon: <Type />, name: 'Natural Language' },
              { icon: <Gamepad2 />, name: 'Game Playing' },
          ]
      }
  }

  // Fallback: A simple icon and title
  return {
    type: 'fallback',
    icon: <Bot />,
    title: item?.name,
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
