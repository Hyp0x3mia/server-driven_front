"""
Assembler & Validator - Stage 3 of the Multi-Agent Pipeline

The Assembler is responsible for:
1. Merging content from Content Expert with visual mappings from Visual Director
2. Converting to frontend-compatible JSON schema
3. Validating with Pydantic
4. Quality assurance checks

This is the FINAL stage before output.
"""

from typing import Dict, List, Any, Optional
import json
import re
from models.schemas import (
    FrontendPageSchema,
    FrontendSection,
    FrontendBlock,
    PageSkeleton,
    ContentCollection,
    ContentBlock,
    VisualMapping,
    VisualComponent,
    BlockType,
    SectionType,
)


class AssemblerAgent:
    """
    Merges content and visual mapping into final frontend-compatible schema.

    Responsibilities:
    - Combine Content Expert output with Visual Director output
    - Transform to frontend schema format
    - Validate with Pydantic
    - Run quality checks
    """

    def __init__(self):
        self.warnings: List[str] = []
        self.errors: List[str] = []

    def assemble(
        self,
        skeleton: PageSkeleton,
        content: ContentCollection,
        visual_mapping: VisualMapping
    ) -> FrontendPageSchema:
        """
        Assemble the final page schema from all previous stages.

        Args:
            skeleton: Structure from Planner Agent
            content: Generated content from Content Expert
            visual_mapping: Component mappings from Visual Director

        Returns:
            FrontendPageSchema ready for frontend rendering
        """
        print(f"🔧 Assembler: Building final schema...")

        self.warnings.clear()
        self.errors.clear()

        # Create lookup maps
        content_map = {c.node_id: c for c in content.contents}
        visual_map = {v.node_id: v for v in visual_mapping.mappings}

        # Build sections
        sections = []
        all_blocks = []

        for section in skeleton.sections:
            section_blocks = []

            for node in section.nodes:
                # Get content and visual mapping for this node
                node_content = content_map.get(node.node_id)
                node_visual = visual_map.get(node.node_id)

                if not node_content:
                    self.errors.append(f"Missing content for node: {node.node_id}")
                    continue

                if not node_visual:
                    self.errors.append(f"Missing visual mapping for node: {node.node_id}")
                    continue

                # Assemble the block
                block = self._assemble_block(
                    node=node,
                    content=node_content,
                    visual=node_visual,
                    section=section
                )

                if block:
                    section_blocks.append(block)
                    all_blocks.append(block)

            # Create section
            if section_blocks:
                frontend_section = FrontendSection(
                    section_id=section.section_id,
                    section_type=section.section_type.value,
                    title=section.title,
                    layout_intent=self._determine_layout_intent(section),
                    pedagogical_goal=section.pedagogical_goal,
                    blocks=section_blocks
                )
                sections.append(frontend_section)

        # Create final page schema
        page_schema = FrontendPageSchema(
            page_id=skeleton.page_id,
            page_mode=self._determine_page_mode(skeleton),
            title=skeleton.title,
            summary=skeleton.summary,
            sections=sections,
            components=all_blocks,
            metadata={
                "total_estimated_time": skeleton.total_estimated_time,
                "target_audience": skeleton.target_audience,
                "warnings": self.warnings,
                "generation_method": "multi-agent-pipeline"
            }
        )

        # Validate
        self._validate_final_schema(page_schema)

        print(f"✅ Assembler: Built schema with {len(sections)} sections, {len(all_blocks)} blocks")

        if self.warnings:
            print(f"⚠️  Warnings: {len(self.warnings)}")
            for warning in self.warnings[:3]:  # Show first 3
                print(f"    - {warning}")

        return page_schema

    def _assemble_block(
        self,
        node,
        content: ContentBlock,
        visual: VisualComponent,
        section
    ) -> Optional[FrontendBlock]:
        """Assemble a single frontend block from content and visual mapping."""
        block_type = visual.block_type

        try:
            # Build block based on type
            if block_type == BlockType.HERO:
                return self._build_hero_block(content, visual, node)
            elif block_type == BlockType.MARKDOWN:
                return self._build_markdown_block(content, visual, node)
            elif block_type == BlockType.FLASHCARD:
                return self._build_flashcard_block(content, visual, node)
            elif block_type == BlockType.CARDGRID:
                return self._build_cardgrid_block(content, visual, node, section)
            elif block_type == BlockType.TIMELINE:
                return self._build_timeline_block(content, visual, node, section)
            elif block_type == BlockType.CLOZE:
                return self._build_cloze_block(content, visual, node)
            elif block_type == BlockType.FLASHCARDGRID:
                return self._build_flashcardgrid_block(content, visual, node)
            elif block_type == BlockType.CODEPLAYGROUND:
                return self._build_codeplayground_block(content, visual, node)
            elif block_type == BlockType.DEEP_DIVE_ZIGZAG:
                return self._build_deepdive_zigzag_block(content, visual, node, section)
            elif block_type == BlockType.SPLIT_PANE_LAB:
                return self._build_split_pane_lab_block(content, visual, node, section)
            else:
                self.warnings.append(f"Unknown block type: {block_type}, using Markdown")
                return self._build_markdown_block(content, visual, node)

        except Exception as e:
            self.errors.append(f"Error assembling block {node.node_id}: {e}")
            return None

    def _build_hero_block(
        self,
        content: ContentBlock,
        visual: VisualComponent,
        node
    ) -> FrontendBlock:
        """Build a Hero block."""
        # Extract key features from content
        features = content.key_points[:5] if content.key_points else []

        return FrontendBlock(
            type=BlockType.HERO,
            role=visual.role,
            content={
                "title": content.title,
                "subtitle": content.main_content[:200] + "..." if len(content.main_content) > 200 else content.main_content,
                "features": features
            },
            title=content.title
        )

    def _build_markdown_block(
        self,
        content: ContentBlock,
        visual: VisualComponent,
        node
    ) -> FrontendBlock:
        """Build a Markdown block."""
        # Build full markdown content
        md_content = f"# {content.title}\n\n"
        md_content += content.main_content + "\n\n"

        if content.key_points:
            md_content += "## Key Points\n\n"
            for point in content.key_points:
                md_content += f"- {point}\n"

        if content.examples:
            md_content += "\n## Examples\n\n"
            for i, example in enumerate(content.examples, 1):
                md_content += f"{i}. {example}\n"

        if content.analogies:
            md_content += f"\n## 💡 Analogy\n\n{content.analogies}\n"

        return FrontendBlock(
            type=BlockType.MARKDOWN,
            role=visual.role,
            content=md_content,
            title=content.title
        )

    def _build_flashcard_block(
        self,
        content: ContentBlock,
        visual: VisualComponent,
        node
    ) -> FrontendBlock:
        """Build a Flashcard block."""
        # Use first quiz question as front, answer as back
        front_content = content.quiz_questions[0] if content.quiz_questions else content.key_points[0] if content.key_points else content.title
        back_content = content.quiz_answers[0] if content.quiz_answers else content.main_content[:500]

        return FrontendBlock(
            type=BlockType.FLASHCARD,
            role=visual.role,
            content={
                "id": node.node_id,
                "front": {
                    "title": "Quick Check",
                    "content": front_content
                },
                "back": {
                    "title": "Answer",
                    "content": back_content
                }
            },
            id=node.node_id
        )

    def _build_cardgrid_block(
        self,
        content: ContentBlock,
        visual: VisualComponent,
        node,
        section
    ) -> FrontendBlock:
        """Build a CardGrid block."""
        # Extract related items from examples and key points
        items = []

        # Add examples as cards
        for example in content.examples[:6]:
            items.append({
                "name": f"Example",
                "description": example,
                "keywords": content.keywords[:3]
            })

        # Add key points as cards if we need more
        if len(items) < 3:
            for point in content.key_points[:3]:
                items.append({
                    "name": "Key Point",
                    "description": point,
                    "keywords": content.keywords[:2]
                })

        return FrontendBlock(
            type=BlockType.CARDGRID,
            role=visual.role,
            content={
                "title": content.title,
                "items": items
            },
            title=content.title
        )

    def _build_timeline_block(
        self,
        content: ContentBlock,
        visual: VisualComponent,
        node,
        section
    ) -> FrontendBlock:
        """Build a Timeline block."""
        # Try to extract structured timeline data from content
        items = []

        # If content has numbered steps or examples, use them
        if content.examples:
            for i, example in enumerate(content.examples):
                items.append({
                    "year": str(i + 1),
                    "label": f"Step {i + 1}",
                    "title": f"Phase {i + 1}",
                    "description": example,
                    "keywords": content.keywords[:3]
                })

        # Fallback: create items from key points
        if len(items) < 2:
            items = []
            for i, point in enumerate(content.key_points):
                items.append({
                    "year": str(i + 1),
                    "title": f"Stage {i + 1}",
                    "description": point,
                    "keywords": content.keywords[:2]
                })

        return FrontendBlock(
            type=BlockType.TIMELINE,
            role=visual.role,
            content={
                "title": content.title,
                "items": items
            },
            title=content.title
        )

    def _build_cloze_block(
        self,
        content: ContentBlock,
        visual: VisualComponent,
        node
    ) -> FrontendBlock:
        """Build a Cloze (fill-in-the-blank) block."""
        # Convert quiz questions into cloze format
        cloze_text = content.main_content

        # Replace key terms with {{answer}} format
        for keyword in content.keywords[:5]:
            cloze_text = cloze_text.replace(keyword, f"{{{{{keyword}}}}}", 1)

        return FrontendBlock(
            type=BlockType.CLOZE,
            role=visual.role,
            content=cloze_text,
            title=f"Practice: {content.title}"
        )

    def _build_flashcardgrid_block(
        self,
        content: ContentBlock,
        visual: VisualComponent,
        node
    ) -> FrontendBlock:
        """Build a FlashcardGrid block."""
        cards = []

        # Create flashcards from quiz questions
        for i, (question, answer) in enumerate(zip(content.quiz_questions, content.quiz_answers)):
            cards.append({
                "type": "Flashcard",
                "id": f"{node.node_id}-card-{i}",
                "front": {
                    "title": f"Question {i + 1}",
                    "content": question
                },
                "back": {
                    "title": "Answer",
                    "content": answer
                }
            })

        # If no quiz questions, use key points
        if not cards:
            for i, point in enumerate(content.key_points[:6]):
                cards.append({
                    "type": "Flashcard",
                    "id": f"{node.node_id}-card-{i}",
                    "front": {
                        "title": f"Key Point {i + 1}",
                        "content": "What is this about?"
                    },
                    "back": {
                        "title": point[:30] + "...",
                        "content": point
                    }
                })

        return FrontendBlock(
            type=BlockType.FLASHCARDGRID,
            role=visual.role,
            content={
                "title": content.title,
                "cards": cards
            },
            title=content.title
        )

    def _build_codeplayground_block(
        self,
        content: ContentBlock,
        visual: VisualComponent,
        node
    ) -> FrontendBlock:
        """Build a CodePlayground block."""
        # Determine mode from visual config
        mode = visual.config.get("mode", "tokenizer")

        return FrontendBlock(
            type=BlockType.CODEPLAYGROUND,
            role=visual.role,
            content={
                "mode": mode,
                "initialText": visual.config.get("initialText", "Try this out!"),
                "codeTemplate": visual.config.get("codeTemplate")
            },
            title=f"Interactive: {content.title}"
        )

    def _build_deepdive_zigzag_block(
        self,
        content: ContentBlock,
        visual: VisualComponent,
        node,
        section
    ) -> FrontendBlock:
        """Build a DeepDiveZigZag block."""
        # Collect items from the section (for 2-5 related topics)
        items = []
        for other_node in section.nodes:
            # Only include nodes that are part of this concept group
            # (same subdomain and conceptually related)
            other_content = self._get_content_from_node(other_node, section)
            if other_content:
                items.append({
                    "name": other_content.title,
                    "title": other_content.title,  # DeepDiveZigZag uses both
                    "description": other_content.main_content[:500] + "..." if len(other_content.main_content) > 500 else other_content.main_content,
                    "keywords": other_content.keywords[:5] if other_content.keywords else [],
                    "common_misconceptions": other_content.examples or []
                })

        return FrontendBlock(
            type=BlockType.DEEP_DIVE_ZIGZAG,
            role=visual.role or "deep-dive",
            content={
                "title": content.title,
                "items": items[:5]  # Limit to 5 items for DeepDiveZigZag
            },
            title=content.title
        )

    def _build_split_pane_lab_block(
        self,
        content: ContentBlock,
        visual: VisualComponent,
        node,
        section
    ) -> FrontendBlock:
        """Build a SplitPaneLab block."""
        # Collect items from the section (for 2-4 theory+code topics)
        items = []
        for other_node in section.nodes:
            # Only include nodes that are part of this theory group
            other_content = self._get_content_from_node(other_node, section)
            if other_content:
                items.append({
                    "name": other_content.title,
                    "title": other_content.title,  # SplitPaneLab uses both
                    "description": other_content.main_content[:500] + "..." if len(other_content.main_content) > 500 else other_content.main_content,
                    "keywords": other_content.keywords[:5] if other_content.keywords else [],
                    "common_misconceptions": other_content.examples or []
                })

        return FrontendBlock(
            type=BlockType.SPLIT_PANE_LAB,
            role=visual.role or "lab",
            content={
                "title": content.title,
                "items": items[:4]  # Limit to 4 items for SplitPaneLab
            },
            title=content.title
        )

    def _get_content_from_node(self, node, section) -> Optional[ContentBlock]:
        """Helper to get content for a node (used by DeepDiveZigZag and SplitPaneLab)."""
        # This is a simplified version - in real implementation,
        # you'd have access to content_map from the assemble method
        # For now, we'll create a minimal ContentBlock-like object
        from collections import namedtuple
        ContentBlockLike = namedtuple('ContentBlockLike', ['node_id', 'title', 'main_content', 'keywords', 'examples'])

        return ContentBlockLike(
            node_id=node.node_id,
            title=node.title,
            main_content=node.original_description or node.title,
            keywords=node.keywords or [],
            examples=node.common_misconceptions or []
        )

    def _determine_layout_intent(self, section) -> str:
        """Determine layout intent for a section."""
        section_type = section.section_type

        if section_type == SectionType.HISTORY:
            return "timeline"
        elif section_type == SectionType.THEORY:
            return "wide"
        elif section_type == SectionType.APPLICATION:
            return "split"
        elif section_type == SectionType.PRACTICE:
            return "interactive"
        else:
            return "default"

    def _determine_page_mode(self, skeleton: PageSkeleton) -> str:
        """Determine page mode based on content."""
        section_types = {s.section_type for s in skeleton.sections}

        if SectionType.HISTORY in section_types:
            return "history"
        elif SectionType.THEORY in section_types:
            return "deepdive"
        elif SectionType.PRACTICE in section_types:
            return "practice"
        else:
            return "overview"

    def _validate_final_schema(self, schema: FrontendPageSchema) -> None:
        """Validate the final schema."""
        print("🔍 Running final validation...")

        # Check sections exist
        if not schema.sections:
            self.warnings.append("No sections in schema")

        # Check components exist
        if not schema.components:
            self.errors.append("No components in schema")
            return

        # Validate CardGrid items
        for block in schema.components:
            if block.type == BlockType.CARDGRID:
                items = block.content.get("items", [])
                if len(items) < 2:
                    self.warnings.append(
                        f"CardGrid '{block.title}' has only {len(items)} items (min 2)"
                    )

            # Validate Timeline items
            if block.type == BlockType.TIMELINE:
                items = block.content.get("items", [])
                if len(items) < 2:
                    self.warnings.append(
                        f"Timeline '{block.title}' has only {len(items)} items (min 2)"
                    )

        print("✅ Final validation complete")

    def export_to_json(self, schema: FrontendPageSchema, filepath: str) -> None:
        """Export schema to JSON file."""
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(schema.model_dump(mode='json'), f, indent=2, ensure_ascii=False)

        print(f"💾 Exported schema to {filepath}")


# ============ Quality Assurance ============

class QualityAssurance:
    """
    Quality assurance checks for generated content.
    """

    @staticmethod
    def check_content_variety(schema: FrontendPageSchema) -> List[str]:
        """Check if there's good component variety."""
        block_types = [b.type for b in schema.components]
        type_counts = {}
        for bt in block_types:
            type_counts[bt] = type_counts.get(bt, 0) + 1

        warnings = []
        markdown_count = type_counts.get(BlockType.MARKDOWN, 0)
        total_count = len(block_types)

        if markdown_count / total_count > 0.7:
            warnings.append(f"High Markdown usage: {markdown_count}/{total_count}")

        return warnings

    @staticmethod
    def check_content_length(schema: FrontendPageSchema) -> List[str]:
        """Check if content length is appropriate."""
        warnings = []

        for block in schema.components:
            if block.type == BlockType.MARKDOWN:
                content_len = len(str(block.content))
                if content_len < 100:
                    warnings.append(f"Short Markdown block: {block.title}")

        return warnings

    @staticmethod
    def check_learning_objectives(schema: FrontendPageSchema) -> List[str]:
        """Check if learning objectives are clear."""
        warnings = []

        # Check if sections have pedagogical goals
        for section in schema.sections or []:
            if not section.pedagogical_goal:
                warnings.append(f"Section '{section.title}' missing pedagogical goal")

        return warnings
