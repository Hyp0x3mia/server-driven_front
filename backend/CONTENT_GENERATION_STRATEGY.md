# Content Generation Strategy Comparison

## 问题：如何让 LLM 处理结构化知识路径数据？

### 背景

我们需要将结构化的知识点数据（KnowledgePoint）转换为丰富的教育内容。有两种主要方案：

## 方案对比

### ❌ 方案 A：直接传递结构化 JSON

```python
# 直接将节点数据传给 LLM
def generate_content(node: ContentNode):
    prompt = f"""
Generate content for this knowledge point:
{node.model_dump_json()}
"""
    return llm.invoke(prompt)
```

**问题**：

1. **信息过载**：LLM 面对大量 JSON 字段可能不知所措
2. **优先级混乱**：LLM 不知道哪些元数据更重要
3. **上下文割裂**：关键字段（如 `is_difficult`）可能被忽略
4. **不可控**：每次生成可能关注不同的字段
5. **难调试**：无法判断 LLM 是否正确使用了所有信息

### ✅ 方案 B：结构化 → 叙述化描述 → LLM 生成（Paper2Slides 方法）

```python
# 先转换为自然语言描述
def create_narrative_profile(node: ContentNode):
    profile = f"""
## 知识点: {node.title}

**基础描述**: {node.original_description}

**难度级别**: {difficulty_to_text(node.difficulty)}
**认知层次**: {cognitive_to_text(node.cognitive_level)}

**学习目标**:
- {"- ".join(node.learning_objectives)}

**关键词**: {", ".join(node.keywords)}

**特点**: {node.importance > 0.8 ? "⭐ 高重要性" : ""}

**应用场景**:
- {"- ".join(node.application_scenarios)}

**常见误区** (需要特别说明):
- {"- ".join(node.common_misconceptions)}
"""
    return profile

# 基于叙述化描述生成内容
def generate_content(node: ContentNode):
    profile = create_narrative_profile(node)
    prompt = f"""
你是一位教育内容专家。请根据以下详细的知识点描述生成内容：

{profile}

请生成：主要文章、关键要点、实例、类比、自测题...
"""
    return llm.invoke(prompt)
```

**优势**：

1. ✅ **完整上下文**：所有元数据被有意义地整合
2. ✅ **明确优先级**：通过格式和强调传递重要性
3. ✅ **可解释性**：清楚知道 LLM 基于什么信息生成
4. ✅ **稳定性**：每次生成基于相同的上下文
5. ✅ **可控性**：可以调整叙述化策略来影响生成
6. ✅ **调试友好**：可以查看叙述化描述来诊断问题

## 实现建议

### 分阶段应用

**阶段 1: Knowledge Path → Skeleton** (适配器模式)
```python
# 直接转换，无需 LLM
skeleton = knowledge_path_to_skeleton(knowledge_path)
```
**原因**：已有完整结构，不需要 LLM 生成

**阶段 2: Skeleton → Content** (叙述化模式)
```python
# 使用叙述化描述
profile = create_narrative_profile(node)
content = llm.generate(profile)
```
**原因**：需要 LLM 创造内容，应该提供丰富上下文

**阶段 3: Visual Mapping** (规则 + LLM)
```python
# 基于内容类型选择组件
component = decide_component(node.category, profile)
```
**原因**：部分决策可以用规则，部分需要 LLM 判断

### 叙述化模板设计

#### 完整版（用于内容生成）
```markdown
## 知识点: 自然语言处理的定义与作用

**知识点ID**: D02-M01-K001

**基础描述**: 自然语言处理（NLP）是引导机器模拟和延伸人类语言能力的基础性和关键性研究方向，包括自然语言的机器表示、分析、理解、生成等。

**难度级别**: 初级（适合初学者）
**认知层次**: 理解（Understand）- 解释和举例

**学习目标**:
- 能够解释自然语言处理的定义、作用及其应用领域

**掌握标准**: 能够解释自然语言处理的定义、作用及其应用领域

**关键词**: NLP, 机器表示, 分析, 理解, 生成

**特点**: 🔑 关键知识点 | ⭐ 高重要性

**应用场景**:
- 各行各业
- 日常生活

**内容类型提示**: 这是一个抽象概念，需要使用类比和具体例子来说明
```

#### 简化版（用于视觉决策）
```markdown
## 内容分析

**类型**: 抽象概念（Abstract Concept）
**包含**: 4个相关子概念
**难度**: 初级
**教学目标**: 理解核心概念和应用

**视觉建议**: 使用 CardGrid 组件平等展示各概念
```

## 实现代码

### 文件结构
```
backend/
├── agents/
│   ├── content_expert.py           # 原版（直接 JSON）
│   └── content_expert_enhanced.py  # 增强版（叙述化）
├── models/
│   └── narrative.py                # 叙述化工具函数
```

### 使用方式

```python
from models.narrative import create_narrative_profile
from agents.content_expert_enhanced import EnhancedContentExpertAgent

# 创建增强版内容专家
content_expert = EnhancedContentExpertAgent()

# 生成内容（会自动使用叙述化描述）
content = content_expert.generate_content(skeleton, target_audience)
```

## 效果对比

| 方面 | 直接 JSON | 叙述化描述 |
|-----|----------|----------|
| 内容质量 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 稳定性 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| 可控性 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| 速度 | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| 调试难度 | 高 | 低 |
| Token 使用 | 较多 | 较少 |

## 最佳实践

### 1. 分层叙述化

**基础层**（必需）：
- 标题和描述
- 难度和认知层次
- 学习目标

**增强层**（推荐）：
- 应用场景
- 关键词
- 内容类型提示

**可选层**（根据需要）：
- 常见误区
- 前置知识
- 特殊标记（关键点、难点）

### 2. 格式化策略

```markdown
# 使用标题层级
## 主要信息
### 次要信息

# 使用列表
- 要点 1
- 要点 2

# 使用强调
**重要**: 这是关键内容
⚠️  注意: 这是难点

# 使用图标
🔑 关键知识点
⭐ 高重要性
⚠️  难点内容
```

### 3. 长度控制

**每个叙述化描述**：200-500 字
- 太短：上下文不足
- 太长：Token 浪费，可能分散注意力

### 4. A/B 测试

建议对比测试：
1. 直接 JSON 方案
2. 简化叙述化（仅核心字段）
3. 完整叙述化（所有元数据）
4. 增强叙述化（+ 教学指导）

根据输出质量选择最佳方案。

## 结论

**推荐使用方案 B（叙述化描述）**，原因：

1. ✅ **符合 Paper2Slides 验证过的方法**
2. ✅ **更好的内容质量和一致性**
3. ✅ **更容易调试和优化**
4. ✅ **可以利用元数据指导生成**
5. ✅ **支持渐进式改进（调整叙述化策略）**

**实施建议**：
- 短期：实现基础版叙述化（核心字段）
- 中期：优化叙述化模板（添加教学指导）
- 长期：A/B 测试并基于数据改进

---

**参考**：
- Paper2Slides: https://github.com/HKUDS/Paper2Slides
- 叙述化方法论：将结构化数据转化为自然语言上下文
