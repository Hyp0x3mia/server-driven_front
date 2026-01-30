# 🤖 AI通识内容评测集

## 概述

本评测集包含 **10 个AI通识内容**生成样本，覆盖人工智能的各个重要子领域，旨在全面评估多智能体内容生成系统在AI教育内容生成方面的表现。

## 📊 评测集设计

### AI子主题覆盖

| ID | 主题 | 难度 | 目标受众 | 预期组件 |
|----|------|------|----------|----------|
| ai_001 | 人工智能基础概念 | 初级 | AI初学者 | Hero, Flashcard, CardGrid, Markdown |
| ai_002 | AI发展历史 | 初级 | 历史爱好者 | Hero, Timeline, CardGrid, Markdown |
| ai_003 | 机器学习基础 | 中级 | 技术初学者 | Hero, FlashcardGrid, Cloze, Markdown |
| ai_004 | 神经网络与深度学习 | 中级 | AI学习者 | Hero, CodePlayground, FlashcardGrid, Markdown |
| ai_005 | 自然语言处理（NLP） | 中级 | 文本AI读者 | Hero, CardGrid, Timeline, Markdown |
| ai_006 | 计算机视觉 | 中级 | 图像AI读者 | Hero, Flashcard, CardGrid, CodePlayground |
| ai_007 | AI伦理与安全 | 中级 | 关注社会影响 | Hero, FlashcardGrid, Cloze, Markdown |
| ai_008 | AI应用场景 | 初级 | 应用爱好者 | Hero, CardGrid, Timeline, Flashcard |
| ai_009 | AI工具与实践 | 中级 | 实践学习者 | Hero, CodePlayground, FlashcardGrid, CardGrid |
| ai_010 | AI的未来发展趋势 | 中级 | 关注未来 | Hero, Timeline, FlashcardGrid, Markdown |

### 组件覆盖

```
组件使用统计:
  Hero:           10/10 (100%)  ████████████████████████████████
  Markdown:        7/10 (70%)   ████████████████████████░░░░░░░░
  CardGrid:        6/10 (60%)   ██████████████████████░░░░░░░░░░
  FlashcardGrid:   5/10 (50%)   ████████████████████░░░░░░░░░░░░
  Timeline:        4/10 (40%)   ██████████████████░░░░░░░░░░░░░░
  Flashcard:       3/10 (30%)   ████████████████░░░░░░░░░░░░░░░░
  Cloze:           3/10 (30%)   ████████████████░░░░░░░░░░░░░░░░
  CodePlayground:  2/10 (20%)   ██████████████░░░░░░░░░░░░░░░░░░

总体覆盖率: 40/80 (50.0%)
```

### 可用组件

1. **Hero** - 页面介绍，用于第一屏吸引注意力
2. **Markdown** - 通用内容，支持富文本格式
3. **Flashcard** - 单个翻转卡片，适合关键概念
4. **FlashcardGrid** - 多个翻转卡片网格，适合练习题
5. **CardGrid** - 卡片网格，展示多个相关概念
6. **Timeline** - 时间线，展示历史发展或步骤
7. **Cloze** - 填空题，测试理解
8. **CodePlayground** - 代码游乐场，交互式代码演示

## 🚀 使用方法

### 1. 查看评测集

```bash
cd backend

# 查看组件覆盖分析
python evaluation_set.py

# 查看评测集索引
cat evaluation_sets/INDEX.json

# 查看特定评测集
cat evaluation_sets/eval_001.json
```

### 2. 批量生成评测

```bash
# 交互式选择评测集
python batch_evaluation.py

# 选项：
# - 输入数字 (1-10) 运行单个评测集
# - 输入 'all' 运行所有评测集
```

### 3. 查看生成结果

```bash
# 查看生成的 JSON 文件
ls evaluation_results/

# 查看生成的内容
cat evaluation_results/eval_001.json

# 在浏览器中查看
# 复制到前端目录
cp evaluation_results/eval_001.json ../public/pages/eval_001.json
# 访问 http://localhost:8080/#/page/eval_001
```

## 📈 评测维度

### 1. 组件多样性
- 是否使用了预期的组件
- 组件类型是否适合内容类型
- 组件组合是否合理

### 2. 内容质量
- **教育性**: 是否有助于学习
- **准确性**: 知识点是否准确
- **可读性**: 语言是否清晰易懂
- **完整性**: 是否覆盖所有知识点

### 3. 组件适配度
- Hero 是否适合作为页面开头
- Flashcard 是否适合关键概念
- Timeline 是否适合历史内容
- CodePlayground 是否适合代码示例
- CardGrid 是否适合多个相关概念

### 4. 跨域泛化
- 在不同学科领域的表现
- 对不同难度级别的适应性
- 对不同受众群体的针对性

## 📁 文件结构

```
backend/
├── evaluation_set.py          # 评测集定义和分析
├── batch_evaluation.py        # 批量生成脚本
├── evaluation_sets/           # 评测集配置
│   ├── INDEX.json            # 评测集索引
│   ├── eval_001.json         # 计算机科学
│   ├── eval_002.json         # 历史
│   ├── ...
│   └── eval_010.json         # 哲学
└── evaluation_results/        # 生成结果
    ├── eval_001.json         # 生成的页面 JSON
    ├── eval_002.json
    ├── ...
    └── batch_results_*.json  # 批量生成报告
```

## 🎯 评测流程

### 单个评测集流程

1. **加载评测集配置**
   ```python
   from evaluation_set import EVALUATION_SETS
   eval_set = EVALUATION_SETS[0]  # eval_001
   ```

2. **转换为生成请求**
   ```python
   from batch_evaluation import convert_evaluation_set_to_request
   request = convert_evaluation_set_to_request(eval_set)
   ```

3. **运行生成**
   ```python
   from workflows.pipeline import create_pipeline
   pipeline = create_pipeline()
   response = pipeline.run(request)
   ```

4. **评估结果**
   ```python
   from batch_evaluation import evaluate_components
   eval_result = evaluate_components(
       response.page_schema,
       eval_set["expected_components"]
   )
   ```

### 批量评测流程

```bash
# 运行所有评测集
python batch_evaluation.py
# 选择: all

# 查看结果
cat evaluation_results/batch_results_*.json
```

## 📊 评测指标

### 成功率指标
- **生成成功率**: 成功生成内容的评测集占比
- **组件覆盖率**: 实际使用组件与预期组件的匹配度
- **知识点覆盖**: 是否包含所有知识点

### 性能指标
- **生成时间**: 每个评测集的生成耗时
- **Token 使用**: 每个评测集消耗的 tokens
- **平均时间**: 所有评测集的平均生成时间

### 质量指标（需人工评估）
- **内容准确性**: 知识点是否准确无误
- **教育价值**: 是否有助于学习理解
- **语言质量**: 表达是否清晰流畅
- **组件适配**: 组件选择是否合适

## 🔧 高级用法

### 自定义评测集

```python
from evaluation_set import EVALUATION_SETS

# 添加新的评测集
EVALUATION_SETS.append({
    "set_id": "eval_011",
    "domain": "你的领域",
    "topic": "你的主题",
    ...
})
```

### 筛选评测集

```python
# 按难度筛选
beginner_sets = [s for s in EVALUATION_SETS if s["difficulty"] == "beginner"]

# 按领域筛选
cs_sets = [s for s in EVALUATION_SETS if s["domain"] == "计算机科学"]

# 按组件筛选
timeline_sets = [s for s in EVALUATION_SETS if "Timeline" in s["expected_components"]]
```

### 导出报告

```python
import json
from datetime import datetime

# 生成评测报告
report = {
    "timestamp": datetime.now().isoformat(),
    "total_sets": len(EVALUATION_SETS),
    "domains": list(set(s["domain"] for s in EVALUATION_SETS)),
    "component_coverage": "...",
    "results": [...]
}

with open("evaluation_report.json", "w") as f:
    json.dump(report, f, indent=2)
```

## 💡 最佳实践

1. **先运行单个评测集**: 测试 pipeline 是否正常工作
2. **查看生成结果**: 在浏览器中预览生成的内容
3. **批量生成**: 确认无误后运行所有评测集
4. **保存结果**: 将生成结果和评测报告妥善保存
5. **人工评估**: 对生成内容进行质量评估

## 🐛 故障排除

### API Key 未设置
```bash
export GLM_API_KEY='your-api-key'
# 或创建 .env 文件
echo "GLM_API_KEY=your-api-key" > .env
```

### 生成失败
- 检查 API Key 是否有效
- 检查网络连接
- 查看错误日志

### 组件不匹配
- 这是正常现象，系统会根据内容自动选择合适的组件
- 可以通过调整 prompt 来影响组件选择

## 📝 更新日志

- **2025-01-30**: 创建评测集，包含10个不同领域样本
- 组件覆盖率: 50.0%
- 领域覆盖: 10个学科领域

## 🙏 致谢

本评测集设计参考了多个学科的教育内容标准，旨在全面评估多智能体内容生成系统的能力。
