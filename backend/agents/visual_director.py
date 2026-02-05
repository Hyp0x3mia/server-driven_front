"""
Visual Director Agent - Stage 2B of the Multi-Agent Pipeline

The Visual Director is responsible for:
1. Analyzing content intent and pedagogical goals
2. Mapping content to appropriate UI components
3. Deciding visual hierarchy and layout
4. Ensuring component variety for engagement

This agent runs IN PARALLEL with the Content Expert.
"""

from typing import List, Dict, Any

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.output_parsers import PydanticOutputParser

from models.schemas import (
    VisualMapping,
    VisualComponent,
    BlockType,
    ContentCategory,
    PageSkeleton,
    PedagogicalIntent
)
from llm.client import create_llm_from_env


class VisualDirectorAgent:
    """
    Maps content nodes to visual UI components.

    Focus: Visual design, component selection, user experience
    """

    # Component decision matrix
    COMPONENT_DECISION_RULES = {
        # Content Category → Best Component(s)
        ContentCategory.ABSTRACT_CONCEPT: [
            BlockType.MARKDOWN,
            BlockType.CARDGRID,
            BlockType.FLASHCARD
        ],
        ContentCategory.CONCRETE_EXAMPLE: [
            BlockType.MARKDOWN,
            BlockType.CODEPLAYGROUND
        ],
        ContentCategory.PROCESS_FLOW: [
            BlockType.TIMELINE,
            BlockType.MARKDOWN
        ],
        ContentCategory.CODE_EXAMPLE: [
            BlockType.CODEPLAYGROUND,
            BlockType.FLASHCARD,
            BlockType.MARKDOWN
        ],
        ContentCategory.COMPARISON_ANALYSIS: [
            BlockType.CARDGRID,
            BlockType.FLASHCARDGRID
        ],
        ContentCategory.HISTORICAL_EVENT: [
            BlockType.TIMELINE,
            BlockType.MARKDOWN
        ],
        ContentCategory.PRACTICE_EXERCISE: [
            BlockType.FLASHCARD,
            BlockType.CLOZE,
            BlockType.FLASHCARDGRID
        ],
        ContentCategory.DEFINITION: [
            BlockType.MARKDOWN,
            BlockType.FLASHCARD
        ]
    }

    def __init__(self, model_name: str = "gpt-4o"):
        # Use unified LLM client
        self.llm = create_llm_from_env()
        self.parser = PydanticOutputParser(pydantic_object=VisualMapping)

    def _build_system_prompt(self) -> str:
        """Build system prompt for visual mapping."""
        return """You are an expert **UX/UI Designer** and **Educational Technologist**.

Your role is to map educational content to the best visual components for learning.

## Your Superpowers

1. **Visual Hierarchy**: You understand how to guide attention through layout
2. **Component Knowledge**: You know which UI components work best for different content types
3. **Learning Science**: You understand how visual design affects comprehension and retention
4. **Engagement**: You balance variety with consistency to keep learners engaged

## Available Components

### Hero
- **Best for**: Page introductions, major section headers
- **Use when**: You need a strong visual opening with title + subtitle + features
- **Contains**: Large title, subtitle, 3-5 bullet point features

### Markdown
- **Best for**: General prose, explanations, code documentation
- **Use when**: Content is primarily text with some formatting
- **Contains**: Rich text with headings, lists, code blocks, tables

### CardGrid
- **Best for**: Multiple related concepts, vocabulary, examples
- **Use when**: You have 3-9 items that need equal visual weight
- **Contains**: Grid of cards with title, description, keywords, misconceptions

### Timeline
- **Best for**: Sequential events, historical content, process steps
- **Use when**: Content has a clear chronological or step-by-step structure
- **Contains**: Vertical timeline with year/period, title, description

### Flashcard (single)
- **Best for**: Key concepts, definitions, quick checks
- **Use when**: One important concept worth reinforcing
- **Contains**: Front (question/prompt) and back (answer/explanation)

### FlashcardGrid
- **Best for**: Multiple practice questions, code examples
- **Use when**: You have 3-6 related flashcard-style items
- **Contains**: Grid of flip cards

### Cloze
- **Best for**: Fill-in-the-blank exercises, recall practice
- **Use when**: Testing understanding of specific terms or concepts
- **Contains**: Text with {{answer}} blanks

### CodePlayground
- **Best for**: Interactive code demonstrations
- **Use when**: Showing tokenization, hyperparameters, or parameter tuning
- **Contains**: Interactive code mode (tokenizer/hyperparameter)

### DeepDiveZigZag
- **Best for**: Deep conceptual explanations with visual aids
- **Use when**: Presenting complex concepts that need detailed walkthrough (2-5 related topics)
- **Contains**: Zigzag layout with alternating text + visual diagrams, perfect for in-depth learning
- **Style**: Professional knowledge presentation with interactive diagrams

### SplitPaneLab
- **Best for**: Theoretical concepts with formulas AND code implementation
- **Use when**: Teaching computational foundations, algorithms, or mathematical models (2-4 related topics)
- **Contains**: Split view with theory/formulas on left, code IDE on right
- **Style**: Laboratory-style interactive learning environment

## Decision Matrix

| Content Type | Best Component | Alternative |
|--------------|----------------|-------------|
| Abstract concepts | CardGrid / DeepDiveZigZag | Flashcard |
| Comparisons | CardGrid | FlashcardGrid |
| Processes/Sequences | Timeline | Markdown |
| Code examples | CodePlayground / SplitPaneLab | Markdown |
| Definitions | Flashcard | Markdown |
| Practice | Flashcard/Cloze | FlashcardGrid |
| Historical | Timeline | Markdown |
| General explanations | Markdown / DeepDiveZigZag | CardGrid |
| Theoretical/Formula-heavy | SplitPaneLab | Markdown |

## Design Principles

### ✅ DO:
- Match component to content TYPE (not just availability)
- Provide rationale for your choices
- Consider variety (don't use the same component 5x in a row)
- Think about learning objectives (assessment vs. presentation)
- Use engaging layouts (Grid > List when appropriate)

### ❌ DON'T:
- Use Timeline for non-sequential content
- Force content into wrong component type
- Use FlashcardGrid for < 3 cards (use single Flashcard)
- Overuse CardGrid (it's powerful but not for everything)

## Component-Specific Rules

### CardGrid Requirements
- Minimum 2 items (ideally 3-9)
- Items should be related but distinct
- Good for: concepts, examples, comparisons, vocabulary

### Timeline Requirements
- Minimum 2 items
- Items must have temporal relationship
- Good for: history, steps, phases

### FlashcardGrid Requirements
- Minimum 3 cards (otherwise use single Flashcard)
- Cards should be thematically related
- Good for: practice questions, code patterns

## Rationale Format

For each mapping, provide a clear rationale:
- "CardGrid: 6 related concepts benefit from equal visual weight"
- "Timeline: Historical development requires chronological display"
- "Flashcard: Key definition worth isolated practice"

## IMPORTANT Language Requirement

**ALWAYS use Chinese (简体中文) for all output content** including:
- Rationale descriptions
- Any explanations or comments

This applies regardless of the source content language.
"""

    def map_content_to_visuals(
        self,
        skeleton: PageSkeleton
    ) -> VisualMapping:
        """
        Map each node in the skeleton to an appropriate UI component.

        Args:
            skeleton: Page structure from Planner Agent

        Returns:
            VisualMapping with component choices for each node
        """
        print(f"🎨 Visual Director: Mapping {self._count_nodes(skeleton)} nodes to components...")

        # Build user prompt
        user_prompt = self._build_user_prompt(skeleton)

        # Build messages
        messages = [
            SystemMessage(content=self._build_system_prompt()),
            HumanMessage(content=user_prompt)
        ]

        try:
            response = self.llm.invoke(messages)
            result = self.parser.parse(response.content)

            print(f"✅ Visual Director: Mapped {len(result.mappings)} nodes to components")

            # Validate and print summary
            self._validate_mapping(result, skeleton)
            self._print_component_summary(result)

            return result

        except Exception as e:
            print(f"❌ Visual Director error: {e}")
            raise

    def _count_nodes(self, skeleton: PageSkeleton) -> int:
        """Count total nodes in skeleton."""
        return sum(len(section.nodes) for section in skeleton.sections)

    def _build_user_prompt(self, skeleton: PageSkeleton) -> str:
        """Build user prompt for visual mapping."""
        import json

        # Prepare node information
        nodes_info = []
        for section in skeleton.sections:
            for node in section.nodes:
                nodes_info.append({
                    "node_id": node.node_id,
                    "title": node.title,
                    "category": node.category.value,
                    "difficulty": node.difficulty.value,
                    "section_type": section.section_type.value,
                    "pedagogical_goal": section.pedagogical_goal,
                    "estimated_time": node.estimated_time_minutes,
                    "learning_objectives": node.learning_objectives
                })

        # Count nodes by category to help with component selection
        category_counts = {}
        for node_info in nodes_info:
            cat = node_info["category"]
            category_counts[cat] = category_counts.get(cat, 0) + 1

        return f"""Map the following content nodes to appropriate UI components:

## Page Overview
- **Topic**: {skeleton.title}
- **Summary**: {skeleton.summary}
- **Total Nodes**: {len(nodes_info)}
- **Sections**: {len(skeleton.sections)}

## Content Category Breakdown
{json.dumps(category_counts, indent=2, ensure_ascii=False)}

## Content Nodes

{json.dumps(nodes_info, indent=2, ensure_ascii=False)}

## CRITICAL INSTRUCTIONS - MAXIMIZE COMPONENT VARIETY

You have {len(nodes_info)} nodes to map. Your goal is to use AS MANY DIFFERENT component types as possible!

### Component Selection Strategy

1. **Hero**: Use ONCE for the very first node (title contains page topic)

2. **Abstract Concepts** (category: abstract_concept):
   - First/important concept → DeepDiveZigZag (for 2-5 related sub-concepts that need deep dive)
   - Multiple related concepts → CardGrid
   - Single concept → Flashcard
   - NEVER use the same component twice in a row

3. **Concrete Examples** (category: concrete_example):
   - Use CardGrid for multiple examples
   - Use Flashcard for single detailed example
   - Use Markdown for narrative examples

4. **Process Flow** (category: process_flow):
   - Timeline for sequential steps (min 3 items)
   - CardGrid for alternative processes/comparisons
   - Markdown for detailed explanations

5. **Code Examples** (category: code_example):
   - Theory + Code → SplitPaneLab (for algorithms/formulas with implementation)
   - Interactive demos → CodePlayground
   - Code patterns → FlashcardGrid
   - Code explanations → Markdown

6. **Historical Events** (category: historical_event):
   - Timeline (MANDATORY for historical content)
   - CardGrid for key figures/concepts
   - Flashcard for key dates

7. **Practice Exercises** (category: practice_exercise):
   - FlashcardGrid for multiple questions (3-6 cards)
   - Cloze for fill-in-the-blank
   - Single Flashcard for single key question
   - VARY these components - don't use FlashcardGrid for all exercises!

8. **Definitions** (category: definition):
   - Flashcard for key definitions
   - CardGrid for multiple related terms
   - Markdown for detailed explanations

9. **Comparison Analysis** (category: comparison_analysis):
   - CardGrid for comparing 3+ items
   - FlashcardGrid for before/after comparisons
   - Timeline for evolution comparisons

10. **Theoretical/Mathematical** (topics with formulas, algorithms):
    - SplitPaneLab (PREFERRED) - shows theory + code side by side
    - DeepDiveZigZag - for conceptual walkthrough
    - Markdown - for formula-heavy text

### MANDATORY VARIETY RULES

- You MUST use at least 5 DIFFERENT component types total
- You cannot use any component type more than 3 times in a row
- For practice_exercise nodes, alternate between: FlashcardGrid → Cloze → Flashcard
- For abstract_concept nodes, alternate between: CardGrid → Flashcard → Markdown
- Prioritize interactive components: Flashcard, FlashcardGrid, Cloze, CodePlayground

### Component Quick Reference

- **Hero**: Page intro, title + subtitle + features (USE ONCE)
- **Flashcard**: Single flip card (question/answer)
- **FlashcardGrid**: Multiple flip cards (3-6 related questions)
- **CardGrid**: Grid of info cards (3-9 related items)
- **Timeline**: Sequential events/steps (min 3 items)
- **Cloze**: Fill-in-the-blank exercise
- **CodePlayground**: Interactive code demo
- **Markdown**: Rich text content
- **DeepDiveZigZag**: Deep conceptual walkthrough with zigzag layout (2-5 topics)
- **SplitPaneLab**: Theory + Code side-by-side for algorithms/formulas (2-4 topics)

## Output Format

For EACH node, provide:
1. `block_type`: Component type from the list above
2. `role`: Describe the component's purpose (e.g., "concept-introduction", "practice-quiz")
3. `rationale`: Brief explanation of why this component fits the content

## CRITICAL: Output Format

You must output ONLY valid JSON. No additional text, no explanations, no markdown code blocks.

Generate the complete visual mapping as JSON.

{self.parser.get_format_instructions()}

REMEMBER:
- Use at least 5 different component types
- No component more than 3 times in a row
- Maximize variety for engagement
- Output ONLY the JSON object, nothing else!
"""

    def _validate_mapping(self, mapping: VisualMapping, skeleton: PageSkeleton) -> None:
        """Validate the visual mapping."""
        expected_nodes = self._count_nodes(skeleton)

        if len(mapping.mappings) != expected_nodes:
            raise ValueError(
                f"Expected mappings for {expected_nodes} nodes, got {len(mapping.mappings)}"
            )

        # Check each mapping has valid block type
        valid_types = {t.value for t in BlockType}
        for comp in mapping.mappings:
            if comp.block_type not in valid_types:
                raise ValueError(f"Invalid block type: {comp.block_type}")

        print("✅ Visual mapping validation passed")

    def _print_component_summary(self, mapping: VisualMapping) -> None:
        """Print a summary of component choices."""
        from collections import Counter

        component_counts = Counter(m.block_type for m in mapping.mappings)

        print("\n📊 Component Summary:")
        for comp_type, count in component_counts.most_common():
            print(f"  {comp_type}: {count}")


# ============ Rule-Based Fallback ============

class RuleBasedVisualDirector(VisualDirectorAgent):
    """
    Visual Director that uses rule-based decisions instead of LLM.
    Useful for testing or when you need deterministic behavior.
    """

    def map_content_to_visuals(self, skeleton: PageSkeleton) -> VisualMapping:
        """Map content using rules instead of LLM."""
        print(f"🎨 Rule-Based Visual Director: Mapping nodes...")

        mappings = []
        hero_used = False

        for section in skeleton.sections:
            for node in section.nodes:
                # Determine component type
                block_type = self._determine_component_type(
                    node,
                    section,
                    hero_used
                )

                # Update hero flag
                if block_type == BlockType.HERO:
                    hero_used = True

                # Create mapping
                mapping = VisualComponent(
                    node_id=node.node_id,
                    block_type=block_type,
                    role=self._determine_role(node, section),
                    config=self._get_component_config(block_type, node),
                    rationale=f"Rule-based: {node.category.value} → {block_type.value}"
                )

                mappings.append(mapping)

        return VisualMapping(mappings=mappings)

    def _determine_component_type(
        self,
        node,
        section,
        hero_used: bool
    ) -> BlockType:
        """Determine component type using rules."""

        # First node gets Hero (if not used yet)
        if not hero_used and section.sections[0].nodes[0] == node:
            return BlockType.HERO

        # Use category-based rules
        category_options = self.COMPONENT_DECISION_RULES.get(
            node.category,
            [BlockType.MARKDOWN]  # Default
        )

        # Simple heuristic: pick the first appropriate option
        # In production, you'd use more sophisticated logic
        return category_options[0]

    def _determine_role(self, node, section) -> str:
        """Determine component role based on context."""
        section_type = section.section_type.value

        role_map = {
            "Concept": "core-concept",
            "History": "historical-narrative",
            "Theory": "theoretical-foundation",
            "Application": "practical-application",
            "Practice": "interactive-practice",
            "Summary": "recap"
        }

        return role_map.get(section_type, "content")

    def _get_component_config(self, block_type: BlockType, node) -> Dict[str, Any]:
        """Get component-specific configuration."""
        if block_type == BlockType.CODEPLAYGROUND:
            # Determine mode based on content
            if "token" in node.title.lower():
                return {"mode": "tokenizer", "initialText": "Enter text here..."}
            else:
                return {"mode": "hyperparameter"}

        return {}
