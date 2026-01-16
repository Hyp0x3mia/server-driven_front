import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Play, Copy, Terminal } from 'lucide-react';

const CodeLabModule = ({ items = [] }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  // 为每个技术概念生成相关的Python代码示例
  const generateCodeExample = (item) => {
    if (!item || !item.name) {
      return `# 代码示例
# 暂无相关数据

def example():
    """示例函数"""
    print("Hello, AI!")
    return "示例完成"

if __name__ == "__main__":
    example()`;
    }

    const codeExamples = {
      '技术变迁': `# 人工智能技术变迁演示
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier

# 早期：基于规则的逻辑推理
def rule_based_ai(input_data):
    """基于规则的简单AI"""
    rules = {
        'spam_keywords': ['免费', '中奖', '点击'],
        'ham_keywords': ['工作', '会议', '项目']
    }
    
    score = 0
    for keyword in rules['spam_keywords']:
        if keyword in input_data:
            score += 1
    return 'spam' if score > 0 else 'ham'

# 现代：基于深度学习的概率推断
class ModernAI:
    def __init__(self):
        self.model = MLPClassifier(hidden_layer_sizes=(128, 64))
    
    def train(self, X, y):
        """训练深度神经网络"""
        self.model.fit(X, y)
    
    def predict(self, X):
        """概率推断预测"""
        probabilities = self.model.predict_proba(X)
        return probabilities`,

      '概率论': `# 概率论与深度神经网络结合
import torch
import torch.nn as nn
import torch.nn.functional as F

class ProbabilisticNeuralNetwork(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super().__init__()
        self.fc1 = nn.Linear(input_size, hidden_size)
        self.fc2 = nn.Linear(hidden_size, output_size)
        self.dropout = nn.Dropout(0.3)
    
    def forward(self, x):
        # 概率推断过程
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        logits = self.fc2(x)
        
        # 使用softmax进行概率分布
        probabilities = F.softmax(logits, dim=1)
        return probabilities

# 贝叶斯推断示例
def bayesian_inference(prior, likelihood, evidence):
    """贝叶斯定理实现"""
    posterior = (likelihood * prior) / evidence
    return posterior`,

      '大模型': `# 大语言模型核心概念
import transformers
from transformers import AutoTokenizer, AutoModelForCausalLM

class LargeLanguageModel:
    def __init__(self, model_name="gpt-3.5"):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(model_name)
    
    def tokenize(self, text):
        """文本标记化"""
        tokens = self.tokenizer.encode(text, return_tensors="pt")
        return tokens
    
    def generate(self, prompt, max_length=100):
        """文本生成"""
        inputs = self.tokenizer(prompt, return_tensors="pt")
        outputs = self.model.generate(
            inputs.input_ids,
            max_length=max_length,
            num_return_sequences=1,
            temperature=0.7
        )
        return self.tokenizer.decode(outputs[0], skip_special_tokens=True)

# 伸缩率演示
def scaling_law(model_size, base_performance=0.5):
    """模型性能与参数规模的关系"""
    # 幂律关系: performance = base * size^exponent
    exponent = 0.07  # 经验指数
    performance = base_performance * (model_size ** exponent)
    return performance`
    };

    // 根据关键词匹配代码示例
    for (const [key, code] of Object.entries(codeExamples)) {
      if (item.name.includes(key) || (item.description && item.description.includes(key))) {
        return code;
      }
    }

    // 默认代码示例
    return `# ${item.name} 相关代码示例
# 这是一个基于 ${item.subdomain || '人工智能'} 概念的演示

def demonstrate_concept():
    """概念演示函数"""
    print("正在演示: ${item.name}")
    print("描述: ${item.description || '暂无描述'}")
    
    # 核心算法逻辑
    result = process_data()
    return result

def process_data():
    """数据处理函数"""
    # 实现具体的技术原理
    pass

if __name__ == "__main__":
    demonstrate_concept()`;
  };

  const copyCode = (code, itemId) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code);
      setCopiedCode(itemId);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  // 如果没有数据，显示空状态
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 text-lg">暂无代码实验数据</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {items.map((item, index) => {
        if (!item || !item.knowledge_id) {
          return null;
        }

        return (
          <motion.div
            key={item.knowledge_id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* 左侧：解释文本 */}
              <div className="p-8 border-r border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                    <Terminal className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-100">{item.name || '未知标题'}</h3>
                </div>
                
                <p className="text-slate-300 leading-relaxed mb-6">
                  {item.description || '暂无描述'}
                </p>
                
                {/* 数学公式区域 */}
                <div className="bg-slate-900/50 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-indigo-400 mb-2">核心公式</h4>
                  <div className="text-slate-300 font-mono text-sm">
                    {(item.subdomain || '').includes('概率') ? (
                      <div>
                        <div>P(A|B) = P(B|A) × P(A) / P(B)</div>
                        <div className="text-xs text-slate-400 mt-1">贝叶斯定理</div>
                      </div>
                    ) : (item.subdomain || '').includes('模型') ? (
                      <div>
                        <div>f(x) = σ(Wx + b)</div>
                        <div className="text-xs text-slate-400 mt-1">神经网络激活函数</div>
                      </div>
                    ) : (
                      <div>
                        <div>y = mx + c</div>
                        <div className="text-xs text-slate-400 mt-1">线性关系</div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {(item.keywords || []).map((keyword, idx) => (
                    <span key={idx} className="px-3 py-1 bg-slate-700/50 text-sm text-slate-300 rounded-full">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* 右侧：代码编辑器 */}
              <div className="bg-slate-900">
                {/* 编辑器标题栏 */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-sm text-slate-400 ml-4">main.py</span>
                  </div>
                  <button
                    onClick={() => copyCode(generateCodeExample(item), item.knowledge_id)}
                    className="flex items-center gap-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm text-slate-300 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    {copiedCode === item.knowledge_id ? '已复制' : '复制'}
                  </button>
                </div>
                
                {/* 代码内容 */}
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm text-slate-300 font-mono leading-relaxed">
                    <code>{generateCodeExample(item)}</code>
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default CodeLabModule;
