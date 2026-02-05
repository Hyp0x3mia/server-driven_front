"""
Planner Agent - Stage 1 of the Multi-Agent Pipeline

The Planner Agent acts as a course designer, responsible for:
1. Analyzing the user's topic and requirements
2. Generating a lightweight page skeleton structure
3. Organizing content into logical sections
4. Determining the learning path and prerequisites

Supports TWO modes:
1. Topic mode: Uses LLM to generate structure from a topic string
2. Knowledge path mode: Converts structured knowledge path to skeleton
"""

import json
from typing import List

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.output_parsers import PydanticOutputParser

from models.schemas import (
    PageSkeleton,
    SectionPlan,
    ContentNode,
    ContentCategory,
    SectionType,
    DifficultyLevel,
    GenerationRequest
)
from models.adapters import knowledge_path_to_skeleton
from llm.client import create_llm_from_env


class PlannerAgent:
    """
    Generates page skeleton/structure based on user topic.

    This is the FIRST stage in the pipeline.
    Output: Lightweight structure with nodes, sections, and relationships.
    """

    def __init__(self, model_name: str = "claude-sonnet-4-20250514"):
        """
        Initialize the Planner Agent.

        Args:
            model_name: Model name (deprecated, uses env config)
        """
        # Use unified LLM client
        self.llm = create_llm_from_env()
        self.parser = PydanticOutputParser(pydantic_object=PageSkeleton)

    def _build_system_prompt(self) -> str:
        """Build the system prompt for the planner."""
        return """You are an expert **Course Designer** and **Learning Architect**.

Your role is to design the structure of educational content pages. You are NOT writing content yet - you are creating a **skeleton/outline**.

## Your Responsibilities

1. **Analyze the Topic**: Break down the topic into logical learning components
2. **Design Learning Flow**: Determine the optimal order for presenting information
3. **Structure Content**: Organize into sections (Concept, History, Theory, Application, Practice, Summary)
4. **Define Prerequisites**: Identify dependencies between content nodes
5. **Estimate Complexity**: Assign difficulty levels and time estimates

## Content Categories

Use these categories for each node:
- `abstract_concept`: Theoretical ideas, definitions, principles
- `concrete_example`: Real-world applications, case studies
- `process_flow`: Step-by-step procedures, algorithms, pipelines
- `code_example`: Programming examples, syntax demonstrations
- `definition`: Key terms, vocabulary
- `comparison_analysis`: Comparing approaches, pros/cons
- `historical_event`: Timeline items, historical developments
- `practice_exercise`: Quizzes, hands-on activities

## Section Types

- `Concept`: Introduction to core ideas
- `History`: Historical development and timeline
- `Theory`: Deep dive into theoretical foundations
- `Application`: Practical uses and implementations
- `Practice`: Exercises and assessments
- `Summary`: Recap and key takeaways

## Design Principles

1. **Scaffolding**: Start simple, build complexity gradually
2. **Cognitive Load**: Don't overwhelm - limit to 3-6 sections
3. **Active Learning**: Include practice/assessment sections
4. **Clear Objectives**: Each node should have 1-3 learning objectives
5. **Realistic Timing**: Estimate 5-20 minutes per node

## Output Format

You will generate a JSON structure with:
- `page_id`: Unique identifier (kebab-case)
- `title`: Page title
- `summary`: Brief description
- `target_audience`: Who this is for
- `sections`: Array of section plans
  - Each section has `nodes` (content blocks)
  - Each node has `prerequisites` (dependencies)
  - Each node has `learning_objectives`
- `total_estimated_time`: Sum of all node times

Keep nodes FOCUSED. Each node should represent ONE learnable unit.

## IMPORTANT Language Requirement

**ALWAYS use Chinese (简体中文) for all output content** including:
- Page title
- Section titles
- Node descriptions
- Learning objectives
- Any text content

This applies regardless of whether the topic name is in English or Chinese.
"""

    def _build_user_prompt(self, request: GenerationRequest) -> str:
        """Build the user prompt based on the generation request."""
        return f"""Design a learning page structure for the following request:

## Topic
{request.topic}

## Target Audience
{request.target_audience}

## Difficulty Level
{request.difficulty.value}

## User Intent
{request.user_intent or "No specific intent provided"}

## Constraints
- Maximum sections: {request.max_sections}
- Include interactive components: {request.include_interactive}

## Instructions

1. Analyze the topic and break it into 3-6 logical sections
2. Each section should contain 2-5 content nodes
3. Design a learning flow that builds understanding progressively
4. Identify prerequisites between nodes (a node can depend on earlier nodes)
5. Assign realistic time estimates (5-20 minutes per node)
6. Write 1-3 clear learning objectives for each node

Generate the complete page skeleton as JSON.

{self.parser.get_format_instructions()}
"""

    def plan(self, request: GenerationRequest) -> PageSkeleton:
        """
        Generate a page skeleton from the request.

        Supports TWO modes:
        1. Knowledge path mode: Direct conversion from structured knowledge path
        2. Topic mode: LLM-based generation from topic string

        Args:
            request: Generation request with knowledge_path OR topic

        Returns:
            PageSkeleton with sections, nodes, and relationships
        """
        mode = request.get_mode()

        if mode == "knowledge_path":
            # Mode 1: Direct conversion from knowledge path (NO LLM needed)
            print(f"🏗️  Planner Agent: Converting knowledge path to skeleton...")
            print(f"   Mode: Knowledge Path")
            print(f"   Domain: {request.knowledge_path.domain}")
            print(f"   Knowledge Points: {len(request.knowledge_path.knowledge_points)}")

            skeleton = knowledge_path_to_skeleton(request.knowledge_path)

            # Apply custom title if provided
            if request.custom_title:
                skeleton.title = request.custom_title

            # Apply custom page_id if provided
            if request.page_id:
                skeleton.page_id = request.page_id

            print(f"✅ Planner Agent: Converted to {len(skeleton.sections)} sections with "
                  f"{sum(len(s.nodes) for s in skeleton.sections)} total nodes")

            return skeleton

        else:
            # Mode 2: LLM-based generation from topic
            print(f"🏗️  Planner Agent: Generating structure for '{request.topic}'...")
            print(f"   Mode: Topic (LLM-based)")

            # Build messages
            messages = [
                SystemMessage(content=self._build_system_prompt()),
                HumanMessage(content=self._build_user_prompt(request))
            ]

            # Invoke LLM
            try:
                response = self.llm.invoke(messages)
                result = self.parser.parse(response.content)

                print(f"✅ Planner Agent: Generated {len(result.sections)} sections with "
                      f"{sum(len(s.nodes) for s in result.sections)} total nodes")

                # Validate
                self._validate_skeleton(result)

                return result

            except Exception as e:
                print(f"⚠️  Pydantic parser failed: {e}")
                print(f"📝 Attempting manual JSON parsing...")

                # Try manual parsing as fallback
                import json
                import re

                # Try to extract JSON from response
                content = response.content
                json_match = re.search(r'\{[\s\S]*\}', content)

                if json_match:
                    json_str = json_match.group(0)

                    try:
                        data = json.loads(json_str)

                        # Valid category enum values
                        valid_categories = {
                            'abstract_concept', 'concrete_example', 'process_flow',
                            'code_example', 'definition', 'comparison_analysis',
                            'historical_event', 'practice_exercise'
                        }

                        # Category mapping for common invalid values
                        category_mapping = {
                            'summary': 'abstract_concept',
                            'introduction': 'abstract_concept',
                            'overview': 'abstract_concept',
                            'conclusion': 'abstract_concept',
                            'example': 'concrete_example',
                            'history': 'historical_event',
                            'comparison': 'comparison_analysis',
                            'practice': 'practice_exercise',
                            'exercise': 'practice_exercise',
                            'code': 'code_example',
                            'flow': 'process_flow',
                        }

                        # Fix missing/invalid fields
                        for section in data.get("sections", []):
                            for node in section.get("nodes", []):
                                # Fix 1: Missing knowledge_id
                                if "knowledge_id" not in node or not node["knowledge_id"]:
                                    node_id = node.get("node_id", "")
                                    if node_id.startswith("node-"):
                                        knowledge_id = "k-" + node_id[5:]
                                    else:
                                        knowledge_id = "k-" + node_id
                                    node["knowledge_id"] = knowledge_id
                                    print(f"   🔧 Added missing knowledge_id: {knowledge_id} for node {node_id}")

                                # Fix 2: Invalid category
                                category = node.get("category", "")
                                if category and category not in valid_categories:
                                    # Map to valid category
                                    new_category = category_mapping.get(category.lower(), 'abstract_concept')
                                    node["category"] = new_category
                                    print(f"   🔧 Fixed invalid category '{category}' -> '{new_category}' for node {node.get('node_id')}")

                        # Re-parse with Pydantic
                        result = PageSkeleton(**data)

                        print(f"✅ Planner Agent: Generated {len(result.sections)} sections with "
                              f"{sum(len(s.nodes) for s in result.sections)} total nodes (recovered)")

                        # Validate
                        self._validate_skeleton(result)

                        return result

                    except Exception as fallback_err:
                        print(f"❌ Fallback parsing also failed: {fallback_err}")
                        raise ValueError(f"Failed to parse skeleton: {fallback_err}")

                raise

    def _validate_skeleton(self, skeleton: PageSkeleton) -> None:
        """Validate the generated skeleton."""
        # Check sections exist
        if not skeleton.sections:
            raise ValueError("Skeleton must have at least one section")

        # Check nodes exist
        for section in skeleton.sections:
            if not section.nodes:
                raise ValueError(f"Section '{section.section_id}' has no nodes")

        # Check prerequisite references are valid
        all_node_ids = set()
        for section in skeleton.sections:
            for node in section.nodes:
                all_node_ids.add(node.node_id)

        for section in skeleton.sections:
            for node in section.nodes:
                for prereq in node.prerequisites:
                    if prereq not in all_node_ids:
                        raise ValueError(
                            f"Node '{node.node_id}' has invalid prerequisite '{prereq}'"
                        )

        print("✅ Skeleton validation passed")


# ============ Alternative: Streaming Version ============

class StreamingPlannerAgent(PlannerAgent):
    """
    Planner Agent with streaming support for real-time feedback.
    """

    def plan_streaming(self, request: GenerationRequest):
        """
        Generate page skeleton with streaming output.

        Yields chunks as they are generated.
        """
        from langchain_core.outputs import LLMResult

        prompt = ChatPromptTemplate.from_messages([
            ("system", self._build_system_prompt()),
            ("human", self._build_user_prompt(request))
        ])

        chain = prompt | self.llm

        print(f"🏗️  Streaming Planner Agent: Generating structure for '{request.topic}'...")

        try:
            for chunk in chain.stream({}):
                if hasattr(chunk, 'content'):
                    yield chunk.content

        except Exception as e:
            print(f"❌ Streaming Planner Agent error: {e}")
            raise


# ============ Helper Functions ============

def create_section_id(title: str, index: int) -> str:
    """Generate a section ID from title."""
    import re
    slug = re.sub(r'[^a-zA-Z0-9]+', '-', title.lower()).strip('-')
    return f"section-{index:02d}-{slug}" if slug else f"section-{index:02d}"


def create_node_id(section_id: str, title: str, index: int) -> str:
    """Generate a node ID."""
    import re
    slug = re.sub(r'[^a-zA-Z0-9]+', '-', title.lower()).strip('-')
    return f"{section_id}-node-{index:02d}-{slug}" if slug else f"{section_id}-node-{index:02d}"
