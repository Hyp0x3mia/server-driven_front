"""
Adapters for converting between different data formats.

Main adapters:
- KnowledgePath → PageSkeleton (for knowledge path input)
- KnowledgePoint → ContentNode
"""

import re
from typing import List, Dict
from models.schemas import (
    KnowledgePath,
    KnowledgePoint,
    PageSkeleton,
    SectionPlan,
    ContentNode,
    ContentCategory,
    DifficultyLevel,
    SectionType,
    CognitiveLevel,
)


def knowledge_path_to_skeleton(knowledge_path: KnowledgePath) -> PageSkeleton:
    """
    Convert a KnowledgePath to a PageSkeleton.

    This is the main adapter for knowledge path mode.

    Strategy:
    1. Group knowledge points by subdomain
    2. Create sections from subdomains
    3. Expand each KnowledgePoint into multiple ContentNodes (concept + examples + practice)
    4. Determine section type based on content
    """
    print(f"\n🔄 Converting KnowledgePath to PageSkeleton...")
    print(f"   Domain: {knowledge_path.domain}")
    print(f"   Knowledge Points: {len(knowledge_path.knowledge_points)}")

    # Group by subdomain
    subdomain_groups = knowledge_path.get_by_subdomain()
    print(f"   Subdomains found: {list(subdomain_groups.keys())}")

    # Create sections
    sections = []
    section_index = 0

    for subdomain, kps in subdomain_groups.items():
        # Determine section type based on subdomain name and content
        section_type = _infer_section_type(subdomain, kps)

        # Expand knowledge points into multiple content nodes
        nodes = []
        for kp in kps:
            expanded_nodes = knowledge_point_to_expanded_nodes(kp, section_index)
            nodes.extend(expanded_nodes)

        print(f"   📦 Section '{subdomain}': {len(kps)} KPs → {len(nodes)} nodes")

        # Create section
        section = SectionPlan(
            section_id=_create_section_id(subdomain, section_index),
            section_type=section_type,
            title=_create_section_title(subdomain),
            nodes=nodes,
            pedagogical_goal=_create_pedagogical_goal(subdomain, kps)
        )

        sections.append(section)
        section_index += 1

    # Generate page_id
    page_id = _create_page_id(knowledge_path.domain)

    # Calculate total estimated time (will be updated based on expanded nodes)
    total_time = sum(sum(node.estimated_time_minutes for node in section.nodes) for section in sections)

    # Create skeleton
    skeleton = PageSkeleton(
        page_id=page_id,
        title=knowledge_path.domain,
        summary=_create_summary(knowledge_path),
        target_audience=knowledge_path.target_audience,
        sections=sections,
        total_estimated_time=total_time
    )

    total_nodes = sum(len(section.nodes) for section in sections)
    print(f"✅ Created skeleton with {len(sections)} sections and {total_nodes} total nodes")
    print(f"   Page ID: {page_id}")
    print(f"   Total time: {skeleton.total_estimated_time} minutes")

    return skeleton


def knowledge_point_to_node(kp: KnowledgePoint, section_index: int) -> ContentNode:
    """
    Convert a single KnowledgePoint to a ContentNode.

    Preserves all metadata from the original knowledge point.
    """
    # Map difficulty level (1-4) to DifficultyLevel enum
    difficulty_map = {
        1: DifficultyLevel.BEGINNER,
        2: DifficultyLevel.INTERMEDIATE,
        3: DifficultyLevel.INTERMEDIATE,
        4: DifficultyLevel.ADVANCED
    }

    # Infer content category based on knowledge point properties
    category = _infer_content_category(kp)

    # Create node
    node = ContentNode(
        # Identity
        node_id=_create_node_id(kp.knowledge_id),
        knowledge_id=kp.knowledge_id,
        title=kp.name,

        # Classification
        category=category,
        difficulty=difficulty_map.get(kp.difficulty, DifficultyLevel.INTERMEDIATE),
        cognitive_level=kp.cognitive_level,

        # Timing
        estimated_time_minutes=kp.estimated_time,

        # Relationships
        prerequisites=kp.prerequisites,

        # Pedagogy
        learning_objectives=_extract_learning_objectives(kp),
        mastery_criteria=kp.mastery_criteria,

        # Metadata
        keywords=kp.keywords,
        importance=kp.importance,
        is_key_point=kp.is_key_point,
        is_difficult=kp.is_difficult,

        # Content references
        original_description=kp.description,
        application_scenarios=kp.application_scenarios,
        common_misconceptions=kp.common_misconceptions
    )

    return node


def knowledge_point_to_expanded_nodes(kp: KnowledgePoint, section_index: int) -> List[ContentNode]:
    """
    Expand a single KnowledgePoint into multiple ContentNodes for better component variety.

    Each knowledge point can be expanded into 2-3 nodes:
    1. Main concept node (concept/definition)
    2. Example/application node (if application scenarios exist)
    3. Practice node (if common misconceptions exist)

    This enables the Visual Director to map each node to a different component type.
    """
    # Map difficulty level (1-4) to DifficultyLevel enum
    difficulty_map = {
        1: DifficultyLevel.BEGINNER,
        2: DifficultyLevel.INTERMEDIATE,
        3: DifficultyLevel.INTERMEDIATE,
        4: DifficultyLevel.ADVANCED
    }

    nodes = []
    base_difficulty = difficulty_map.get(kp.difficulty, DifficultyLevel.INTERMEDIATE)

    # Node 1: Main concept (always created)
    main_category = _infer_content_category(kp)
    main_node = ContentNode(
        node_id=_create_node_id(kp.knowledge_id),
        knowledge_id=kp.knowledge_id,
        title=kp.name,
        category=main_category,
        difficulty=base_difficulty,
        cognitive_level=kp.cognitive_level,
        estimated_time_minutes=max(5, kp.estimated_time // 2),  # Split time
        prerequisites=kp.prerequisites,
        learning_objectives=_extract_learning_objectives(kp),
        mastery_criteria=kp.mastery_criteria,
        keywords=kp.keywords,
        importance=kp.importance,
        is_key_point=kp.is_key_point,
        is_difficult=kp.is_difficult,
        original_description=kp.description,
        application_scenarios=kp.application_scenarios,
        common_misconceptions=kp.common_misconceptions
    )
    nodes.append(main_node)

    # Node 2: Examples/Scenarios (if available)
    if kp.application_scenarios and len(kp.application_scenarios) > 0:
        example_node = ContentNode(
            node_id=_create_node_id(f"{kp.knowledge_id}-examples"),
            knowledge_id=kp.knowledge_id,
            title=f"{kp.name} - 应用示例",
            category=ContentCategory.CONCRETE_EXAMPLE,
            difficulty=base_difficulty,
            cognitive_level=kp.cognitive_level,
            estimated_time_minutes=5,
            prerequisites=[kp.knowledge_id],  # Depends on main concept
            learning_objectives=[f"理解{kp.name}的实际应用场景"],
            mastery_criteria=f"能够列举{kp.name}的{len(kp.application_scenarios)}个应用场景",
            keywords=kp.keywords[:3],  # Top 3 keywords
            importance=kp.importance * 0.8,
            is_key_point=False,
            is_difficult=False,
            original_description="通过实际案例理解概念的应用",
            application_scenarios=kp.application_scenarios,
            common_misconceptions=[]
        )
        nodes.append(example_node)

    # Node 3: Practice/Quiz (if misconceptions exist or is key point)
    if (kp.common_misconceptions and len(kp.common_misconceptions) > 0) or kp.is_key_point:
        practice_node = ContentNode(
            node_id=_create_node_id(f"{kp.knowledge_id}-practice"),
            knowledge_id=kp.knowledge_id,
            title=f"{kp.name} - 知识检测",
            category=ContentCategory.PRACTICE_EXERCISE,
            difficulty=base_difficulty,
            cognitive_level=kp.cognitive_level,
            estimated_time_minutes=5,
            prerequisites=[kp.knowledge_id],  # Depends on main concept
            learning_objectives=[f"检验对{kp.name}的理解程度", "识别并纠正常见误区"],
            mastery_criteria=f"能够准确识别{kp.name}的常见误区",
            keywords=kp.keywords[:2],
            importance=kp.importance * 0.7,
            is_key_point=False,
            is_difficult=False,
            original_description="通过练习题检验理解程度",
            application_scenarios=[],
            common_misconceptions=kp.common_misconceptions
        )
        nodes.append(practice_node)

    return nodes


def _infer_section_type(subdomain: str, knowledge_points: List[KnowledgePoint]) -> SectionType:
    """
    Infer section type from subdomain and knowledge points.

    Rules:
    - "历史" → History
    - "概述" / "介绍" → Concept
    - "理论" / "原理" / "语义" → Theory
    - "任务" / "应用" → Application
    - "练习" / "实践" → Practice
    - "总结" / "概述" (if last) → Summary
    """
    subdomain_lower = subdomain.lower()

    # History-related
    if any(keyword in subdomain_lower for keyword in ["历史", "发展", "演变", "阶段"]):
        return SectionType.HISTORY

    # Theory-related
    if any(keyword in subdomain_lower for keyword in ["理论", "原理", "语义", "基础", "模型"]):
        return SectionType.THEORY

    # Application-related
    if any(keyword in subdomain_lower for keyword in ["任务", "应用", "系统", "实践"]):
        return SectionType.APPLICATION

    # Practice-related
    if any(keyword in subdomain_lower for keyword in ["练习", "案例", "操作"]):
        return SectionType.PRACTICE

    # Default to Concept
    return SectionType.CONCEPT


def _infer_content_category(kp: KnowledgePoint) -> ContentCategory:
    """
    Infer content category from knowledge point properties.

    Uses multiple signals: name, description, keywords, subdomain.
    """
    text_signals = (
        kp.name.lower() +
        " " +
        kp.description.lower() +
        " " +
        " ".join(kp.keywords).lower() +
        " " +
        kp.subdomain.lower()
    )

    # Historical content
    if any(keyword in text_signals for keyword in ["历史", "发展", "阶段", "萌芽", "演变", "年代"]):
        return ContentCategory.HISTORICAL_EVENT

    # Process/flow content
    if any(keyword in text_signals for keyword in ["流程", "步骤", "过程", "方法", "算法", "流程"]):
        return ContentCategory.PROCESS_FLOW

    # Code/implementation
    if any(keyword in text_signals for keyword in ["代码", "编程", "实现", "python", "javascript"]):
        return ContentCategory.CODE_EXAMPLE

    # Comparison
    if any(keyword in text_signals for keyword in ["对比", "区别", "差异", "优缺点", "vs", "versus"]):
        return ContentCategory.COMPARISON_ANALYSIS

    # Definition
    if any(keyword in text_signals for keyword in ["定义", "什么是", "概念", "含义"]):
        return ContentCategory.DEFINITION

    # Practice exercise
    if any(keyword in text_signals for keyword in ["练习", "测试", "问题", "quiz"]):
        return ContentCategory.PRACTICE_EXERCISE

    # Default to abstract concept
    return ContentCategory.ABSTRACT_CONCEPT


def _extract_learning_objectives(kp: KnowledgePoint) -> List[str]:
    """Extract learning objectives from knowledge point."""
    objectives = []

    # Add mastery criteria as primary objective
    if kp.mastery_criteria:
        objectives.append(kp.mastery_criteria)

    # Add application scenarios as objectives
    for scenario in kp.application_scenarios:
        objectives.append(f"能够应用于：{scenario}")

    # If no objectives, create from description
    if not objectives:
        # Take first sentence from description
        first_sentence = kp.description.split("。")[0]
        objectives.append(f"理解{first_sentence}")

    return objectives


def _create_page_id(domain: str) -> str:
    """Generate a URL-friendly page ID from domain."""
    # Remove spaces and special chars, convert to kebab-case
    clean = re.sub(r'[^\w\s-]', '', domain.lower())
    clean = re.sub(r'[\s_]+', '-', clean)
    return clean.strip()


def _create_section_id(subdomain: str, index: int) -> str:
    """Generate a section ID."""
    clean = re.sub(r'[^\w\s-]', '', subdomain.lower())
    clean = re.sub(r'[\s_]+', '-', clean)
    return f"section-{index:02d}-{clean}" if clean else f"section-{index:02d}"


def _create_node_id(knowledge_id: str) -> str:
    """Generate a node ID from knowledge ID."""
    return knowledge_id.lower().replace("_", "-")


def _create_section_title(subdomain: str) -> str:
    """Create a user-friendly section title."""
    # Remove common prefixes
    title = subdomain
    for prefix in ["D02-", "M01-", "K0", "领域", "学习"]:
        title = title.replace(prefix, "")

    # Capitalize
    return title.strip()


def _create_section_title(subdomain: str) -> str:
    """Create a user-friendly section title."""
    # Capitalize first letter
    return subdomain[0].upper() + subdomain[1:] if subdomain else "Overview"


def _create_summary(knowledge_path: KnowledgePath) -> str:
    """Create a page summary from knowledge path."""
    num_points = len(knowledge_path.knowledge_points)
    total_time = knowledge_path.get_total_estimated_time()

    summary = f"学习{knowledge_path.domain}的核心知识，包含{num_points}个知识点"

    if total_time > 0:
        hours = total_time // 60
        minutes = total_time % 60
        if hours > 0:
            summary += f"，预计学习时间{hours}小时{minutes}分钟"
        else:
            summary += f"，预计学习时间{minutes}分钟"

    summary += "。"

    return summary


def _create_pedagogical_goal(subdomain: str, knowledge_points: List[KnowledgePoint]) -> str:
    """Create pedagogical goal for a section."""
    key_points = sum(1 for kp in knowledge_points if kp.is_key_point)
    difficult = sum(1 for kp in knowledge_points if kp.is_difficult)

    goal = f"掌握{subdomain}的核心概念"

    if key_points > 0:
        goal += f"，重点关注{key_points}个关键知识点"

    if difficult > 0:
        goal += f"，理解{difficult}个难点内容"

    return goal


# ============ Helper: Create KnowledgePath from raw JSON ============

def parse_knowledge_path_from_json(json_data: List[Dict]) -> KnowledgePath:
    """
    Parse knowledge path from raw JSON (like the JavaScript example).

    Args:
        json_data: Array of knowledge point dictionaries

    Returns:
        KnowledgePath object
    """
    knowledge_points = []

    for item in json_data:
        kp = KnowledgePoint(**item)
        knowledge_points.append(kp)

    # Infer domain from first knowledge point
    domain = knowledge_points[0].domain if knowledge_points else "Unknown"

    return KnowledgePath(
        knowledge_points=knowledge_points,
        domain=domain,
        target_audience="learners"  # Can be customized
    )
