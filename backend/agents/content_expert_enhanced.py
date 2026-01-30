"""
Content Expert Agent - Enhanced Version with Narrative Context

This version uses the Paper2Slides-inspired approach:
1. Convert structured metadata to natural language context
2. LLM generates content based on the narrative description
3. Better control and explainability
"""

from typing import List, Dict

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.output_parsers import PydanticOutputParser

from models.schemas import (
    ContentCollection,
    ContentBlock,
    PageSkeleton,
    ContentNode
)
from llm.client import create_llm_from_env


class EnhancedContentExpertAgent:
    """
    Enhanced Content Expert that converts structured data to narrative context first.

    Process:
    1. Extract structured metadata from ContentNode
    2. Convert to natural language "knowledge profile"
    3. LLM generates content based on the profile
    4. Parse and validate output
    """

    def __init__(self, model_name: str = "gpt-4o"):
        # Use unified LLM client
        self.llm = create_llm_from_env()
        self.parser = PydanticOutputParser(pydantic_object=ContentCollection)

    def generate_content(
        self,
        skeleton: PageSkeleton,
        target_audience: str
    ) -> ContentCollection:
        """
        Generate content for all nodes in the skeleton.

        Uses narrative context for better control.
        """
        print(f"📚 Enhanced Content Expert: Generating content with narrative context...")

        # 1. Collect all nodes
        all_nodes = []
        for section in skeleton.sections:
            all_nodes.extend(section.nodes)

        # 2. Convert nodes to narrative profiles
        node_profiles = []
        for node in all_nodes:
            profile = self._create_narrative_profile(node, target_audience)
            node_profiles.append(profile)

        # 3. Batch generate content (can be optimized to process in groups)
        contents = []
        for i, (node, profile) in enumerate(zip(all_nodes, node_profiles)):
            print(f"\n  [{i+1}/{len(all_nodes)}] Processing: {node.title}")

            # Generate content for this node
            content_block = self._generate_single_content(node, profile, target_audience)
            contents.append(content_block)

        return ContentCollection(contents=contents)

    def _create_narrative_profile(self, node: ContentNode, target_audience: str) -> str:
        """
        Convert structured node metadata to a natural language profile.

        This is the KEY innovation from Paper2Slides approach.
        """
        profile_parts = []

        # 1. Basic Info
        profile_parts.append(f"## 知识点: {node.title}")
        profile_parts.append(f"**知识点ID**: {node.knowledge_id}\n")

        # 2. Original Description (if available)
        if node.original_description:
            profile_parts.append(f"**基础描述**: {node.original_description}\n")

        # 3. Difficulty & Cognitive Level
        difficulty_map = {
            "beginner": "初级（适合初学者）",
            "intermediate": "中级（需要一定基础）",
            "advanced": "高级（需要深入理解）"
        }
        difficulty_text = difficulty_map.get(node.difficulty.value, node.difficulty.value)

        cognitive_map = {
            "COG_L1": "记忆（Remember）- 识别和回忆",
            "COG_L2": "理解（Understand）- 解释和举例",
            "COG_L3": "应用（Apply）- 在新情境中使用",
            "COG_L4": "分析（Analyze）- 分解和关联",
            "COG_L5": "评价（Evaluate）- 判断和评估",
            "COG_L6": "创造（Create）- 生成和设计"
        }
        cognitive_text = cognitive_map.get(node.cognitive_level.value, "") if node.cognitive_level else ""

        profile_parts.append(f"**难度级别**: {difficulty_text}")
        if cognitive_text:
            profile_parts.append(f"**认知层次**: {cognitive_text}")
        profile_parts.append("")

        # 4. Learning Objectives
        if node.learning_objectives:
            profile_parts.append("**学习目标**:")
            for obj in node.learning_objectives:
                profile_parts.append(f"- {obj}")
            profile_parts.append("")

        # 5. Mastery Criteria
        if node.mastery_criteria:
            profile_parts.append(f"**掌握标准**: {node.mastery_criteria}\n")

        # 6. Keywords
        if node.keywords:
            profile_parts.append(f"**关键词**: {', '.join(node.keywords)}\n")

        # 7. Importance & Flags
        flags = []
        if node.is_key_point:
            flags.append("🔑 关键知识点")
        if node.is_difficult:
            flags.append("⚠️  难点内容")
        if node.importance > 0.8:
            flags.append("⭐ 高重要性")

        if flags:
            profile_parts.append(f"**特点**: {' | '.join(flags)}\n")

        # 8. Application Scenarios
        if node.application_scenarios:
            profile_parts.append("**应用场景**:")
            for scenario in node.application_scenarios:
                profile_parts.append(f"- {scenario}")
            profile_parts.append("")

        # 9. Common Misconceptions
        if node.common_misconceptions:
            profile_parts.append("**常见误区** (需要特别说明):")
            for misconception in node.common_misconceptions:
                profile_parts.append(f"- ⚠️  {misconception}")
            profile_parts.append("")

        # 10. Content Category Guidance
        category_guidance = {
            "abstract_concept": "这是一个抽象概念，需要使用类比和具体例子来说明",
            "historical_event": "这是历史内容，需要按时间线组织，强调发展脉络",
            "process_flow": "这是流程性内容，需要分步骤说明，可以用流程图描述",
            "comparison_analysis": "这是对比分析，需要使用表格或并列对比的方式",
            "practice_exercise": "这是练习内容，需要设计互动式练习和自测题"
        }
        if node.category.value in category_guidance:
            profile_parts.append(f"**内容类型提示**: {category_guidance[node.category.value]}\n")

        # 11. Prerequisites Context
        if node.prerequisites:
            profile_parts.append(f"**前置知识**: 需要先掌握 {', '.join(node.prerequisites)} 中的内容\n")

        return "\n".join(profile_parts)

    def _generate_single_content(
        self,
        node: ContentNode,
        narrative_profile: str,
        target_audience: str
    ) -> ContentBlock:
        """
        Generate content for a single node using its narrative profile.
        """
        prompt = f"""你是教育内容创作专家。请根据以下知识点的详细信息，生成高质量的教育内容。

{narrative_profile}

---

**目标受众**: {target_audience}

## 内容要求

### 1. 主要内容 (main_content)
- 使用 Markdown 格式
- 包含清晰的标题层级
- 总字数: {node.estimated_time_minutes * 30}-{node.estimated_time_minutes * 50} 字（根据学习时长调整）
- 语言风格: 专业但不晦涩，适合 {target_audience}

### 2. 关键要点 (key_points)
- 提取 3-7 个最重要的知识点
- 简洁明了，每点 15-30 字

### 3. 实例说明 (examples)
- 提供 2-4 个具体例子
- 结合实际应用场景
- 代码示例（如适用）

### 4. 类比解释 (analogies) - **重要**
- 为抽象概念提供 1-2 个贴切的类比
- 使用"就像..."的表述
- 帮助理解复杂概念

### 5. 常见误区 (common_misconceptions)
- 列出 1-3 个学习者容易犯的错误
- 提供正确的理解方式

### 6. 自测问题 (quiz_questions)
- 设计 2-3 个检查理解的问题
- 不同难度层次：回忆→理解→应用
- 包含答案 (quiz_answers)

## 特殊说明

- 如果这是关键知识点（🔑），需要特别详细和准确
- 如果这是难点内容（⚠️），需要额外的解释和示例
- 充分利用原始描述和应用场景信息
- 确保所有关键词都被自然地融入内容

请生成完整的 JSON 格式内容。

"""

        try:
            messages = [
                SystemMessage(content=self._build_system_prompt()),
                HumanMessage(content=prompt)
            ]

            response = self.llm.invoke(messages)

            # Parse response
            # Note: Need to handle single content block vs collection
            # For simplicity, create a collection with one item
            content = ContentBlock(
                node_id=node.node_id,
                title=node.title,
                category=node.category,
                difficulty=node.difficulty,
                main_content=response.content,  # In production, parse properly
                key_points=node.learning_objectives,
                examples=node.application_scenarios,
                analogies=None,
                keywords=node.keywords,
                common_misconceptions=node.common_misconceptions,
                quiz_questions=[],
                quiz_answers=[]
            )

            print(f"    ✅ 生成完成")
            return content

        except Exception as e:
            print(f"    ❌ 生成失败: {e}")
            # Fallback: create minimal content from existing data
            return ContentBlock(
                node_id=node.node_id,
                title=node.title,
                category=node.category,
                difficulty=node.difficulty,
                main_content=node.original_description or "",
                key_points=node.learning_objectives,
                examples=node.application_scenarios,
                analogies=None,
                keywords=node.keywords,
                common_misconceptions=node.common_misconceptions,
                quiz_questions=[],
                quiz_answers=[]
            )

    def _build_system_prompt(self) -> str:
        """Build system prompt for enhanced content generation."""
        return """你是顶级的教育内容创作者，专精于将结构化知识转化为引人入胜的学习材料。

## 你的优势

1. **叙述化能力**: 你能理解结构化元数据并将其转化为流畅的自然语言
2. **教学法精通**: 你懂得如何组织和呈现知识以最大化学习效果
3. **上下文意识**: 你会充分利用提供的所有元数据（难度、认知层次、应用场景等）
4. **类比大师**: 你擅长为复杂概念找到简单易懂的类比

## 工作流程

1. **仔细阅读**提供的知识点叙述化描述（narrative profile）
2. **理解**所有元数据：难度、认知层次、学习目标、应用场景、常见误区
3. **规划**内容结构：如何组织信息才能最有效
4. **创作**高质量内容：
   - 清晰的标题和结构
   - 丰富的例子和类比
   - 适当的格式（Markdown）
   - 互动式元素（自测题）

## 内容原则

### ✅ DO
- 使用提供的叙述化描述作为上下文
- 尊重原始元数据（难度、认知层次）
- 为抽象概念提供类比
- 强调应用场景
- 指出常见误区
- 设计有意义的自测题

### ❌ DON'T
- 忽略结构化信息
- 编造与元数据矛盾的内容
- 使用过于学术化的语言
- 跳过类比和例子
- 忽视难度级别

## 输出格式

返回 JSON 格式的内容块，包含所有必需字段。
"""