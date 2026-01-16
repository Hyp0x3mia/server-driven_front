// src/data/interactive-article.data.ts

import type { InteractiveArticle } from "@/types/interactive-content";

export const transformerArticle: InteractiveArticle = [
  {
    type: "markdown",
    content: `
# 深入理解 Transformer 架构

Transformer 模型是自然语言处理（NLP）领域的一项革命性创新，由 Google 在其 2017 年的论文 "Attention Is All You Need" 中提出。它完全摒弃了传统的循环（RNN）和卷积（CNN）结构，仅依赖于注意力机制来捕捉输入数据中的全局依赖关系。

下面这张闪卡将帮助你巩固 Transformer 的核心组件。
    `,
  },
  {
    type: "flashcard",
    id: "tf-1",
    front: {
      title: "核心机制",
      content: "Transformer 模型最关键的机制是什么？",
    },
    back: {
      title: "答案",
      content:
        "**自注意力机制 (Self-Attention Mechanism)**。\n\n它允许模型在处理一个词时，同时权衡输入序列中所有其他词的重要性。",
    },
  },
  {
    type: "markdown",
    content: `
## 主要组件

Transformer 的编码器（Encoder）和解码器（Decoder）都由几个关键组件堆叠而成：

1.  **多头注意力 (Multi-Head Attention)**
2.  **位置前馈网络 (Position-wise Feed-Forward Networks)**
3.  **残差连接与层归一化 (Residual Connections & Layer Normalization)**

让我们通过下一张闪卡来复习“多头注意力”的概念。
    `,
  },
  {
    type: "flashcard",
    id: "tf-2",
    front: {
      title: "多头注意力",
      content: "“多头”注意力的“多头”指的是什么？它为什么重要？",
    },
    back: {
      content:
        "它指的是将注意力计算并行执行多次（即多个“头”）。\n\n**重要性**：每个“头”可以学习输入序列中不同的依赖关系（例如，一个头可能关注语法关系，另一个头关注语义相似性），从而让模型能够共同关注来自不同位置、不同表示子空间的信息。",
    },
  },
    {
    type: "markdown",
    content: `
### 位置编码 (Positional Encoding)

由于 Transformer 没有循环结构，它本身无法感知序列中单词的顺序。为了解决这个问题，模型引入了**位置编码**。这些编码被加到输入嵌入中，为模型提供了关于单词位置的信息。
    `,
  },
];
