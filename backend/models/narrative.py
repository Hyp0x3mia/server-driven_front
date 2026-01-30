"""
Narrative Context Builder

Converts structured knowledge points to natural language descriptions.
Inspired by Paper2Slides approach.

This ensures LLMs have complete, well-structured context for generation.
"""

from typing import Dict, List, Optional
from models.schemas import ContentNode, DifficultyLevel, CognitiveLevel, ContentCategory


class NarrativeProfileBuilder:
    """
    Builds narrative descriptions from structured metadata.

    This is the KEY to getting high-quality LLM outputs.
    """

    # Difficulty level mappings
    DIFFICULTY_NAMES = {
        DifficultyLevel.BEGINNER: "初级（适合初学者）",
        DifficultyLevel.INTERMEDIATE: "中级（需要一定基础）",
        DifficultyLevel.ADVANCED: "高级（需要深入理解）"
    }

    # Cognitive level mappings (Bloom's Taxonomy)
    COGNITIVE_NAMES = {
        CognitiveLevel.COG_L1: "记忆（Remember）- 识别和回忆基础知识",
        CognitiveLevel.COG_L2: "理解（Understand）- 解释概念和举例说明",
        CognitiveLevel.COG_L3: "应用（Apply）- 在新情境中使用知识",
        CognitiveLevel.COG_L4: "分析（Analyze）- 分解结构和关联分析",
        CognitiveLevel.COG_L5: "评价（Evaluate）- 判断价值和评估优劣",
        CognitiveLevel.COG_L6: "创造（Create）- 生成新知识和设计方案"
    }

    # Category guidance
    CATEGORY_GUIDANCE = {
        ContentCategory.ABSTRACT_CONCEPT: "这是一个抽象概念，需要：\n- 使用类比和具体例子来说明\n- 从具体到抽象的递进式讲解\n- 提供多个视角的理解方式",
        ContentCategory.HISTORICAL_EVENT: "这是历史性内容，需要：\n- 按时间线组织信息\n- 强调发展脉络和关键转折点\n- 连接历史与现代应用",
        ContentCategory.PROCESS_FLOW: "这是流程性内容，需要：\n- 分步骤清晰说明\n- 使用流程图或编号列表\n- 说明每个步骤的目的和输入输出",
        ContentCategory.CODE_EXAMPLE: "这是代码示例，需要：\n- 提供完整可运行的代码\n- 逐行注释解释\n- 展示运行结果",
        ContentCategory.COMPARISON_ANALYSIS: "这是对比分析，需要：\n- 使用表格或并列对比\n- 突出差异和优劣\n- 提供选择建议",
        ContentCategory.DEFINITION: "这是概念定义，需要：\n- 简洁准确的定义\n- 正例和反例对比\n- 与相关概念的区别",
        ContentCategory.PRACTICE_EXERCISE: "这是练习内容，需要：\n- 设计渐进式练习\n- 提供即时反馈\n- 连接实际应用"
    }

    @classmethod
    def build_full_profile(cls, node: ContentNode, target_audience: str = "learners") -> str:
        """
        Build a complete narrative profile for content generation.

        Includes all metadata in a well-structured narrative format.
        """
        parts = []

        # Header
        parts.append(f"# 知识点: {node.title}")
        parts.append(f"**ID**: `{node.knowledge_id}`\n")

        # Original Description
        if node.original_description:
            parts.append("## 基础描述")
            parts.append(f"{node.original_description}\n")

        # Difficulty & Cognitive Level
        parts.append("## 学习难度")
        parts.append(f"- **难度**: {cls.DIFFICULTY_NAMES.get(node.difficulty, node.difficulty.value)}")
        if node.cognitive_level:
            parts.append(f"- **认知层次**: {cls.COGNITIVE_NAMES.get(node.cognitive_level, node.cognitive_level.value)}")
        parts.append("")

        # Learning Objectives
        if node.learning_objectives:
            parts.append("## 学习目标")
            for i, obj in enumerate(node.learning_objectives, 1):
                parts.append(f"{i}. {obj}")
            parts.append("")

        # Mastery Criteria
        if node.mastery_criteria:
            parts.append("## 掌握标准")
            parts.append(f"学习后，你应该能够：{node.mastery_criteria}")
            parts.append("")

        # Keywords
        if node.keywords:
            parts.append("## 核心概念")
            parts.append(f"**关键词**: {', '.join(node.keywords)}")
            parts.append("")

        # Importance Flags
        flags = []
        if node.is_key_point:
            flags.append("🔑 **关键知识点** - 这是核心内容，需要重点掌握")
        if node.is_difficult:
            flags.append("⚠️ **难点内容** - 这部分较难理解，需要额外解释和示例")
        if node.importance >= 0.8:
            flags.append("⭐ **高重要性** - 这个知识点在整个课程中很重要")

        if flags:
            parts.append("## 特点")
            for flag in flags:
                parts.append(f"- {flag}")
            parts.append("")

        # Application Scenarios
        if node.application_scenarios:
            parts.append("## 应用场景")
            parts.append("这个知识点可以应用在：")
            for scenario in node.application_scenarios:
                parts.append(f"- {scenario}")
            parts.append("")

        # Common Misconceptions
        if node.common_misconceptions:
            parts.append("## 常见误区 ⚠️")
            parts.append("学习者容易产生的错误理解：")
            for i, misconception in enumerate(node.common_misconceptions, 1):
                parts.append(f"{i}. {misconception}")
            parts.append("")

        # Content Category Guidance
        if node.category in cls.CATEGORY_GUIDANCE:
            parts.append("## 内容类型指导")
            parts.append(cls.CATEGORY_GUIDANCE[node.category])
            parts.append("")

        # Prerequisites
        if node.prerequisites:
            parts.append("## 前置知识")
            parts.append(f"学习前需要先掌握：{', '.join(node.prerequisites)}")
            parts.append("")

        # Target Audience Note
        parts.append(f"## 目标受众")
        parts.append(f"本内容针对：{target_audience}")
        parts.append("")

        return "\n".join(parts)

    @classmethod
    def build_simplified_profile(cls, node: ContentNode) -> str:
        """
        Build a simplified profile for quick/compact generation.

        Includes only essential metadata.
        """
        parts = []

        parts.append(f"## {node.title} (`{node.knowledge_id}`)")

        if node.original_description:
            parts.append(f"**描述**: {node.original_description}")

        parts.append(f"**难度**: {cls.DIFFICULTY_NAMES.get(node.difficulty, node.difficulty.value)}")

        if node.keywords:
            parts.append(f"**关键词**: {', '.join(node.keywords)}")

        if node.is_key_point or node.is_difficult:
            flags = []
            if node.is_key_point:
                flags.append("关键点")
            if node.is_difficult:
                flags.append("难点")
            parts.append(f"**特点**: {', '.join(flags)}")

        return "\n".join(parts)

    @classmethod
    def build_visual_decision_profile(cls, node: ContentNode) -> str:
        """
        Build a profile specifically for visual component decision-making.

        Used by Visual Director agent.
        """
        parts = []

        parts.append(f"## Content Analysis: {node.title}")
        parts.append(f"**Category**: {node.category.value}")
        parts.append(f"**Difficulty**: {node.difficulty.value}")
        parts.append(f"**Time Estimate**: {node.estimated_time_minutes} minutes")

        # Content characteristics
        characteristics = []

        if node.category == ContentCategory.ABSTRACT_CONCEPT:
            characteristics.append("Multiple facets that need equal visual weight")
            characteristics.append("Benefits from structured comparison")
        elif node.category == ContentCategory.HISTORICAL_EVENT:
            characteristics.append("Chronological sequence is important")
            characteristics.append("Timeline visualization helps understanding")
        elif node.category == ContentCategory.PROCESS_FLOW:
            characteristics.append("Step-by-step presentation is essential")
            characteristics.append("Flow diagram or numbered list works best")
        elif node.category == ContentCategory.CODE_EXAMPLE:
            characteristics.append("Interactive code demonstration is valuable")
            characteristics.append("Live execution or step-through helps learning")

        if node.is_difficult:
            characteristics.append("Challenging content - benefit from interactive elements")

        if characteristics:
            parts.append("\n**Characteristics**:")
            for char in characteristics:
                parts.append(f"- {char}")

        return "\n".join(parts)


# ============ Convenience Functions ============

def create_narrative_profile(
    node: ContentNode,
    target_audience: str = "learners",
    style: str = "full"
) -> str:
    """
    Create a narrative profile for a content node.

    Args:
        node: The content node with structured metadata
        target_audience: Who is this content for?
        style: Profile style - "full", "simplified", or "visual"

    Returns:
        Natural language description suitable for LLM context
    """
    if style == "full":
        return NarrativeProfileBuilder.build_full_profile(node, target_audience)
    elif style == "simplified":
        return NarrativeProfileBuilder.build_simplified_profile(node)
    elif style == "visual":
        return NarrativeProfileBuilder.build_visual_decision_profile(node)
    else:
        raise ValueError(f"Unknown style: {style}")


def create_batch_profiles(
    nodes: List[ContentNode],
    target_audience: str = "learners"
) -> List[str]:
    """
    Create narrative profiles for multiple nodes.

    Useful for batch processing.
    """
    return [create_narrative_profile(node, target_audience) for node in nodes]


# ============ Example Usage ============

if __name__ == "__main__":
    from models.schemas import ContentNode, ContentCategory, DifficultyLevel

    # Create a sample node
    sample_node = ContentNode(
        node_id="test-node-001",
        knowledge_id="D02-M01-K001",
        title="自然语言处理的定义",
        category=ContentCategory.ABSTRACT_CONCEPT,
        difficulty=DifficultyLevel.BEGINNER,
        cognitive_level=CognitiveLevel.COG_L2,
        estimated_time_minutes=15,
        prerequisites=[],
        learning_objectives=[
            "理解 NLP 的定义",
            "掌握 NLP 的主要应用领域"
        ],
        mastery_criteria="能够清晰解释 NLP 是什么以及它的作用",
        keywords=["NLP", "人工智能", "语言理解"],
        importance=0.9,
        is_key_point=True,
        is_difficult=False,
        original_description="自然语言处理是 AI 的重要分支...",
        application_scenarios=["机器翻译", "智能客服"],
        common_misconceptions=["NLP 就是机器翻译", "NLP 只能处理英文"]
    )

    # Generate profiles
    print("=" * 70)
    print("完整叙述化描述（用于内容生成）")
    print("=" * 70)
    full_profile = create_narrative_profile(sample_node, "AI 初学者")
    print(full_profile)

    print("\n" + "=" * 70)
    print("简化版描述（用于快速生成）")
    print("=" * 70)
    simplified_profile = create_narrative_profile(sample_node, style="simplified")
    print(simplified_profile)

    print("\n" + "=" * 70)
    print("视觉决策描述（用于组件选择）")
    print("=" * 70)
    visual_profile = create_narrative_profile(sample_node, style="visual")
    print(visual_profile)
