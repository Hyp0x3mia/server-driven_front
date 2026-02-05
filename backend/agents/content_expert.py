"""
Content Expert Agent - Stage 2A of the Multi-Agent Pipeline

The Content Expert focuses on:
1. Pedagogical effectiveness
2. Factual accuracy
3. Clarity and accessibility
4. Rich educational content (examples, analogies, explanations)
5. Assessment generation

This agent runs IN PARALLEL with the Visual Director.
"""

from typing import List

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.output_parsers import PydanticOutputParser

from models.schemas import (
    ContentCollection,
    ContentBlock,
    ContentCategory,
    DifficultyLevel,
    PageSkeleton
)
from llm.client import create_llm_from_env


class ContentExpertAgent:
    """
    Generates rich educational content for each node in the skeleton.

    Focus: Pedagogy, accuracy, clarity, analogies, examples
    """

    def __init__(self, model_name: str = "gpt-4o"):
        # Use unified LLM client
        self.llm = create_llm_from_env()
        self.parser = PydanticOutputParser(pydantic_object=ContentCollection)

    def _build_system_prompt(self) -> str:
        """Build system prompt for content generation."""
        return """You are an expert **Educational Content Creator** specializing in technical writing.

Your superpowers:
1. **Pedagogy**: You understand how people learn. You use scaffolding, analogies, and examples.
2. **Clarity**: You explain complex concepts simply without dumbing them down.
3. **Accuracy**: You ensure technical correctness while remaining accessible.
4. **Engagement**: You make content interesting and memorable.

## Content Principles

### ✅ DO:
- Use concrete analogies to explain abstract concepts
- Provide real-world examples
- Break complex ideas into digestible chunks
- Use active voice and conversational tone
- Include "why this matters" context
- Highlight common misconceptions
- Write in Markdown for rich formatting

### ❌ DON'T:
- Write walls of text (break it up!)
- Use jargon without explanation
- Assume prior knowledge
- Be dry or academic
- Skip the "so what?"

## Content Structure

For each content node, generate:

1. **Main Content** (Markdown)
   - Clear explanation with headings
   - Code examples if applicable
   - Diagrams described in text (can use Mermaid)
   - Step-by-step breakdowns

2. **Key Points** (3-7 bullet points)
   - Takeaway summary
   - Easy to scan

3. **Examples** (2-4 items)
   - Real-world applications
   - Concrete scenarios
   - Code snippets for technical topics

4. **Analogies** (optional but recommended)
   - Relatable comparisons
   - "Think of it like..." explanations

5. **Keywords** (5-10 terms)
   - Important vocabulary
   - Search terms

6. **Common Misconceptions** (1-3 items)
   - Things learners often get wrong
   - Clarifications

7. **Quiz Questions** (2-3 questions)
   - Self-assessment questions
   - Varying difficulty

## Writing Style

- **Audience**: Adult learners, professionals
- **Tone**: Friendly but professional
- **Format**: Markdown with headings, lists, code blocks
- **Length**: 200-800 words per node (depending on complexity)
- **Language**: **IMPORTANT: Always write in Chinese (简体中文), regardless of the topic**

## Special Handling by Category

### `abstract_concept`
- Start with a simple definition
- Use multiple analogies
- Build from concrete to abstract
- Include "why this is hard" acknowledgments

### `concrete_example`
- Start with the scenario
- Show, don't just tell
- Include specific details
- Connect back to the concept

### `process_flow`
- Use numbered steps
- Include a flow diagram (Mermaid)
- Explain decision points
- Show what happens at each stage

### `code_example`
- Show the code first
- Annotate with comments
- Explain what each part does
- Include expected output
- Show common mistakes

### `comparison_analysis`
- Use comparison tables
- Highlight trade-offs
- Provide decision guidance
- Use real-world contexts

### `historical_event`
- Provide context
- Explain significance
- Connect to modern relevance
- Use timeline format

### `practice_exercise`
- Start with learning objective
- Provide clear instructions
- Include solution/hints
- Vary difficulty levels
"""

    def generate_content(
        self,
        skeleton: PageSkeleton,
        target_audience: str
    ) -> ContentCollection:
        """
        Generate educational content for all nodes in the skeleton.

        Args:
            skeleton: Page structure from Planner Agent
            target_audience: Who is this content for?

        Returns:
            ContentCollection with generated content for each node
        """
        print(f"📚 Content Expert: Generating content for {self._count_nodes(skeleton)} nodes...")

        # Collect all nodes with their context
        nodes_context = self._prepare_nodes_context(skeleton)

        # Build user prompt
        user_prompt = self._build_user_prompt(skeleton, nodes_context, target_audience)

        # Build messages
        messages = [
            SystemMessage(content=self._build_system_prompt()),
            HumanMessage(content=user_prompt)
        ]

        try:
            response = self.llm.invoke(messages)

            # Try to parse with better error handling
            try:
                result = self.parser.parse(response.content)
            except Exception as parse_error:
                print(f"⚠️  Pydantic parser failed: {parse_error}")
                print(f"📝 Attempting manual JSON parsing...")

                # Try manual parsing as fallback
                import json
                import re

                # Try to extract JSON from response
                content = response.content
                # Look for JSON block
                json_match = re.search(r'\{[\s\S]*\}', content)
                if json_match:
                    json_str = json_match.group(0)

                    # Clean control characters that might break JSON parsing
                    # LLMs sometimes output control chars in JSON strings that break parsing

                    # Remove all control characters except valid JSON whitespace (space, \n, \r, \t in structure)
                    # We need to preserve the JSON structure but clean control chars from string values
                    import json as json_module

                    # Step 1: Fix invalid escape sequences
                    # LLMs sometimes generate backslashes followed by non-escapable characters
                    # We need to clean these while preserving valid escapes like \n, \t, \", \\, \uXXXX

                    def clean_invalid_escapes(text: str) -> str:
                        """Remove invalid escape sequences from JSON string."""
                        # Pattern: backslash followed by anything that's NOT a valid escape character
                        # Valid escapes: " \ / b f n r t uXXXX (where X is hex digit)
                        result = []
                        i = 0
                        while i < len(text):
                            if text[i] == '\\' and i + 1 < len(text):
                                next_char = text[i + 1]
                                # Check if it's a valid escape
                                if next_char in '"\\/bfnrt':
                                    result.append(text[i:i+2])
                                    i += 2
                                    continue
                                elif next_char == 'u' and i + 5 < len(text):
                                    # Check \uXXXX format
                                    hex_digits = text[i+2:i+6]
                                    if all(c in '0123456789abcdefABCDEF' for c in hex_digits):
                                        result.append(text[i:i+6])
                                        i += 6
                                        continue
                                # Invalid escape - remove the backslash, keep the next char
                                result.append(next_char)
                                i += 2
                            else:
                                result.append(text[i])
                                i += 1
                        return ''.join(result)

                    def fix_json_syntax(text: str) -> str:
                        """Fix common JSON syntax errors."""
                        # Fix 1: Remove trailing commas (e.g., { "a": 1, } -> { "a": 1 })
                        text = re.sub(r',\s*([}\]])', r'\1', text)

                        # Fix 2: Add missing commas between objects/arrays
                        # e.g., {"a":1}{"b":2} -> {"a":1},{"b":2}
                        text = re.sub(r'}\s*{', '},{', text)
                        text = re.sub(r']\s*\[', '],[', text)
                        text = re.sub(r'"\s*\s*"', '","', text)
                        text = re.sub(r'"\s*{', '",{', text)
                        text = re.sub(r'}\s*"', '},"', text)

                        # Fix 3: Fix unquoted strings (if they appear as keys/values)
                        # This is risky, so be conservative

                        return text

                    # Step 1: Clean invalid escapes
                    json_str = clean_invalid_escapes(json_str)

                    # Step 2: Fix JSON syntax errors
                    json_str = fix_json_syntax(json_str)

                    # Step 3: Remove control characters (except those in valid escape sequences)
                    # This removes \x00-\x1f except space (\x20), \n (\x0a), \r (\x0d), \t (\x09)
                    cleaned_json = re.sub(r'[\x00-\x08\x0b-\x0c\x0e-\x1f]', '', json_str)

                    try:
                        data = json.loads(cleaned_json)
                    except json.JSONDecodeError as json_err:
                        print(f"❌ JSON parsing failed: {json_err}")
                        print(f"📝 JSON preview (first 300 chars): {cleaned_json[:300]}")

                        # Try with strict=False as last resort
                        try:
                            data = json.loads(cleaned_json, strict=False)
                            print(f"✅ Parsed with strict=False")
                        except Exception as final_err:
                            raise ValueError(f"Failed to parse JSON: {final_err}")

                    # Manually construct ContentCollection
                    contents = []
                    for item in data.get("contents", []):
                        # Fix common issues
                        if "category" in item and isinstance(item["category"], str):
                            # Validate enum
                            try:
                                item["category"] = ContentCategory(item["category"])
                            except ValueError:
                                item["category"] = ContentCategory.ABSTRACT_CONCEPT

                        if "difficulty" in item and isinstance(item["difficulty"], str):
                            # Validate enum
                            try:
                                item["difficulty"] = DifficultyLevel(item["difficulty"])
                            except ValueError:
                                item["difficulty"] = DifficultyLevel.INTERMEDIATE

                        # Create ContentBlock
                        block = ContentBlock(**item)
                        contents.append(block)

                    result = ContentCollection(contents=contents)
                    print(f"✅ Manual parsing successful: {len(result.contents)} blocks")
                else:
                    raise ValueError(f"Could not extract JSON from response: {content[:500]}...")

            print(f"✅ Content Expert: Generated {len(result.contents)} content blocks")

            # Validate
            self._validate_content(result, skeleton)

            return result

        except Exception as e:
            print(f"❌ Content Expert error: {e}")
            import traceback
            traceback.print_exc()
            raise

    def _count_nodes(self, skeleton: PageSkeleton) -> int:
        """Count total nodes in skeleton."""
        return sum(len(section.nodes) for section in skeleton.sections)

    def _prepare_nodes_context(self, skeleton: PageSkeleton) -> List[dict]:
        """Prepare context for all nodes."""
        nodes_context = []

        for section in skeleton.sections:
            for node in section.nodes:
                nodes_context.append({
                    "node_id": node.node_id,
                    "title": node.title,
                    "category": node.category.value,
                    "difficulty": node.difficulty.value,
                    "estimated_time": node.estimated_time_minutes,
                    "learning_objectives": node.learning_objectives,
                    "prerequisites": node.prerequisites,
                    "section_context": {
                        "section_id": section.section_id,
                        "section_type": section.section_type.value,
                        "pedagogical_goal": section.pedagogical_goal
                    }
                })

        return nodes_context

    def _build_user_prompt(
        self,
        skeleton: PageSkeleton,
        nodes_context: List[dict],
        target_audience: str
    ) -> str:
        """Build user prompt for content generation."""
        import json

        return f"""Generate educational content for the following learning page:

## Page Overview
- **Topic**: {skeleton.title}
- **Summary**: {skeleton.summary}
- **Target Audience**: {target_audience}
- **Total Sections**: {len(skeleton.sections)}
- **Total Nodes**: {len(nodes_context)}

## Content Nodes to Generate

{json.dumps(nodes_context, indent=2, ensure_ascii=False)}

## Instructions

For EACH node, generate:
1. **main_content**: Rich Markdown explanation (200-800 words)
2. **key_points**: 3-7 bullet point takeaways
3. **examples**: 2-4 real-world examples or scenarios
4. **analogies**: Optional relatable comparison (highly recommended for abstract concepts)
5. **keywords**: 5-10 important terms
6. **common_misconceptions**: 1-3 things learners get wrong
7. **quiz_questions**: 2-3 self-assessment questions
8. **quiz_answers**: Corresponding answers

## Special Instructions

- Write in **Chinese** if the topic is Chinese-related, otherwise **English**
- Use proper Markdown formatting (headings, lists, code blocks, tables)
- For code examples: include comments explaining what the code does
- For abstract concepts: ALWAYS provide at least one analogy
- For comparisons: use Markdown tables
- Make it engaging! Use a conversational but professional tone

## CRITICAL: Output Format

You must output ONLY valid JSON. No additional text, no explanations, no markdown code blocks.

The JSON must follow this exact structure:
- "contents": array of content blocks
- Each block must have: node_id, title, category, main_content, key_points, examples, analogies, difficulty, keywords, common_misconceptions, quiz_questions, quiz_answers
- category must be one of: abstract_concept, concrete_example, process_flow, code_example, comparison_analysis, historical_event, practice_exercise, definition
- difficulty must be one of: beginner, intermediate, advanced

{self.parser.get_format_instructions()}

REMEMBER: Output ONLY the JSON object, nothing else!
"""

    def _validate_content(self, content: ContentCollection, skeleton: PageSkeleton) -> None:
        """Validate generated content."""
        # Check all nodes have content
        expected_nodes = self._count_nodes(skeleton)
        if len(content.contents) != expected_nodes:
            raise ValueError(
                f"Expected content for {expected_nodes} nodes, got {len(content.contents)}"
            )

        # Check content quality
        for block in content.contents:
            if not block.main_content or len(block.main_content) < 50:
                raise ValueError(f"Node '{block.node_id}' has insufficient main content")

            if not block.key_points:
                raise ValueError(f"Node '{block.node_id}' is missing key points")

        print("✅ Content validation passed")


# ============ Batch Processing Version ============

class BatchContentExpertAgent(ContentExpertAgent):
    """
    Content Expert that processes nodes in batches to handle large skeletons.
    """

    def generate_content_batched(
        self,
        skeleton: PageSkeleton,
        target_audience: str,
        batch_size: int = 10
    ) -> ContentCollection:
        """
        Generate content in batches for large skeletons.

        Args:
            skeleton: Page structure
            target_audience: Target audience
            batch_size: Nodes to process per batch

        Returns:
            ContentCollection with all generated content
        """
        all_contents = []
        nodes_context = self._prepare_nodes_context(skeleton)

        print(f"📚 Processing {len(nodes_context)} nodes in batches of {batch_size}...")

        for i in range(0, len(nodes_context), batch_size):
            batch = nodes_context[i:i + batch_size]
            batch_num = i // batch_size + 1
            total_batches = (len(nodes_context) + batch_size - 1) // batch_size

            print(f"  Batch {batch_num}/{total_batches}...")

            # Process batch (you'd need to modify the prompt to handle subsets)
            # For now, just log
            pass

        # Combine and return
        return ContentCollection(contents=all_contents)
