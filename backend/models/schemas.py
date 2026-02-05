"""
Pydantic Schemas for Multi-Agent Content Generation Pipeline

Defines data models for each stage:
- Stage 1: Planning (skeleton structure)
- Stage 2: Content Generation (pedagogy-focused)
- Stage 3: Visual Mapping (component selection)
- Stage 4: Final Assembly (validated output)
"""

from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Optional, Literal, Any, Callable
from enum import Enum
import time


# ============ Enums ============

class DifficultyLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class SectionType(str, Enum):
    CONCEPT = "Concept"
    HISTORY = "History"
    THEORY = "Theory"
    APPLICATION = "Application"
    PRACTICE = "Practice"
    SUMMARY = "Summary"


class BlockType(str, Enum):
    """All available UI component types"""
    HERO = "Hero"
    MARKDOWN = "Markdown"
    FLASHCARD = "Flashcard"
    CARDGRID = "CardGrid"
    TIMELINE = "Timeline"
    CLOZE = "Cloze"
    FLASHCARDGRID = "FlashcardGrid"
    CODEPLAYGROUND = "CodePlayground"
    DEEP_DIVE_ZIGZAG = "DeepDiveZigZag"
    SPLIT_PANE_LAB = "SplitPaneLab"


class PedagogicalIntent(str, Enum):
    """What pedagogical purpose this content serves"""
    INTRODUCTION = "introduction"
    COMPARISON = "comparison"
    SEQUENTIAL_LEARNING = "sequential_learning"
    INTERACTIVE_PRACTICE = "interactive_practice"
    ASSESSMENT = "assessment"
    DEMONSTRATION = "demonstration"
    HISTORICAL_CONTEXT = "historical_context"


class ContentCategory(str, Enum):
    """Type of content being represented"""
    ABSTRACT_CONCEPT = "abstract_concept"
    CONCRETE_EXAMPLE = "concrete_example"
    PROCESS_FLOW = "process_flow"
    CODE_EXAMPLE = "code_example"
    DEFINITION = "definition"
    COMPARISON_ANALYSIS = "comparison_analysis"
    HISTORICAL_EVENT = "historical_event"
    PRACTICE_EXERCISE = "practice_exercise"


# ============ Input: Knowledge Path Format ============

class CognitiveLevel(str, Enum):
    """Cognitive levels based on Bloom's Taxonomy"""
    COG_L1 = "COG_L1"  # Remember
    COG_L2 = "COG_L2"  # Understand
    COG_L3 = "COG_L3"  # Apply
    COG_L4 = "COG_L4"  # Analyze
    COG_L5 = "COG_L5"  # Evaluate
    COG_L6 = "COG_L6"  # Create


class KnowledgePoint(BaseModel):
    """
    A single knowledge point from the learning path.

    This matches the format from your existing system.
    """
    knowledge_id: str = Field(..., description="Unique identifier (e.g., D02-M01-K008)")
    name: str = Field(..., description="Knowledge point name")
    description: str = Field(..., description="Detailed description")
    domain: str = Field(..., description="Main domain (e.g., '自然语言处理')")
    subdomain: str = Field(..., description="Subdomain (e.g., '基础概念')")

    # Difficulty and complexity
    difficulty: int = Field(..., ge=1, le=4, description="Difficulty level (1-4)")
    cognitive_level: CognitiveLevel = Field(..., description="Cognitive level (COG_L1-L6)")
    importance: float = Field(..., ge=0, le=1, description="Importance score (0-1)")
    abstraction: int = Field(..., ge=1, le=5, description="Abstraction level (1-5)")

    # Timing
    estimated_time: int = Field(..., description="Estimated learning time in minutes")

    # Flags
    is_key_point: bool = Field(default=False, description="Is this a key knowledge point?")
    is_difficult: bool = Field(default=False, description="Is this considered difficult?")

    # Relationships
    prerequisites: List[str] = Field(default_factory=list, description="IDs of prerequisite knowledge points")
    successors: List[str] = Field(default_factory=list, description="IDs of successor knowledge points")

    # Content metadata
    keywords: List[str] = Field(default_factory=list, description="Key terms and concepts")
    application_scenarios: List[str] = Field(default_factory=list, description="Real-world applications")
    common_misconceptions: List[str] = Field(default_factory=list, description="Common student mistakes")
    mastery_criteria: str = Field(..., description="Criteria for mastering this knowledge point")


class KnowledgePath(BaseModel):
    """
    A complete learning path consisting of multiple knowledge points.

    This is the PRIMARY input format for the pipeline.
    """
    knowledge_points: List[KnowledgePoint] = Field(..., description="Ordered list of knowledge points")
    domain: str = Field(..., description="Main domain/subject area")
    target_audience: str = Field(default="general learners", description="Who is this path for?")
    learning_goals: Optional[List[str]] = Field(None, description="Overall learning goals for this path")

    def get_total_estimated_time(self) -> int:
        """Calculate total estimated time for all knowledge points"""
        return sum(kp.estimated_time for kp in self.knowledge_points)

    def get_by_subdomain(self) -> Dict[str, List[KnowledgePoint]]:
        """Group knowledge points by subdomain"""
        grouped = {}
        for kp in self.knowledge_points:
            if kp.subdomain not in grouped:
                grouped[kp.subdomain] = []
            grouped[kp.subdomain].append(kp)
        return grouped

    def get_difficulty_distribution(self) -> Dict[int, int]:
        """Get distribution of difficulty levels"""
        distribution = {1: 0, 2: 0, 3: 0, 4: 0}
        for kp in self.knowledge_points:
            distribution[kp.difficulty] += 1
        return distribution


# ============ Stage 1: Planning Output ============

class ContentNode(BaseModel):
    """A single node in the content skeleton - now extended from KnowledgePoint"""
    # Core identity (from KnowledgePoint)
    node_id: str = Field(..., description="Unique identifier for this node")
    knowledge_id: str = Field(..., description="Original knowledge point ID")
    title: str = Field(..., description="Title of this content section")

    # Classification
    category: ContentCategory = Field(..., description="Type of content")
    difficulty: DifficultyLevel = Field(..., description="Difficulty level")
    cognitive_level: Optional[CognitiveLevel] = Field(None, description="Cognitive level from original")

    # Timing
    estimated_time_minutes: int = Field(default=15, ge=1, le=120)

    # Relationships
    prerequisites: List[str] = Field(default_factory=list, description="IDs of prerequisite nodes")

    # Pedagogy
    learning_objectives: List[str] = Field(default_factory=list, description="Learning goals")
    mastery_criteria: Optional[str] = Field(None, description="How to master this content")

    # Additional metadata from KnowledgePoint
    keywords: List[str] = Field(default_factory=list)
    importance: float = Field(default=0.5)
    is_key_point: bool = Field(default=False)
    is_difficult: bool = Field(default=False)

    # Content references
    original_description: Optional[str] = Field(None, description="Original description from knowledge point")
    application_scenarios: List[str] = Field(default_factory=list)
    common_misconceptions: List[str] = Field(default_factory=list)


class SectionPlan(BaseModel):
    """A section in the page structure"""
    section_id: str
    section_type: SectionType
    title: str
    nodes: List[ContentNode]
    pedagogical_goal: str


class PageSkeleton(BaseModel):
    """Output from Planner Agent - lightweight structure"""
    page_id: str
    title: str
    summary: str
    target_audience: str
    sections: List[SectionPlan]
    total_estimated_time: int = Field(description="Total estimated learning time in minutes")


# ============ Stage 2: Content Generation Output ============

class ContentBlock(BaseModel):
    """Generated content from Content Expert"""
    node_id: str
    title: str
    category: ContentCategory

    # Rich content
    main_content: str = Field(..., description="Main educational content in Markdown")
    key_points: List[str] = Field(default_factory=list)
    examples: List[str] = Field(default_factory=list)
    analogies: Optional[str] = Field(None, description="Analogy to explain complex concepts")

    # Metadata
    difficulty: DifficultyLevel
    keywords: List[str] = Field(default_factory=list)
    common_misconceptions: List[str] = Field(default_factory=list)

    # Assessment
    quiz_questions: List[str] = Field(default_factory=list)
    quiz_answers: List[str] = Field(default_factory=list)


class ContentCollection(BaseModel):
    """Collection of all generated content"""
    contents: List[ContentBlock]


# ============ Stage 3: Visual Mapping Output ============

class VisualComponent(BaseModel):
    """Visual component mapping from Visual Director"""
    node_id: str
    block_type: BlockType
    role: str = Field(..., description="Role of this component (e.g., 'intro', 'core-concept')")

    # Component-specific configuration
    config: Dict[str, Any] = Field(default_factory=dict)

    # Rationale
    rationale: str = Field(..., description="Why this component was chosen")


class VisualMapping(BaseModel):
    """Complete visual mapping from Visual Director"""
    mappings: List[VisualComponent]


# ============ Stage 4: Final Assembly (Frontend-compatible) ============

class HeroContent(BaseModel):
    title: str
    subtitle: Optional[str] = None
    features: Optional[List[str]] = None


class CardGridItem(BaseModel):
    name: str
    description: str
    keywords: Optional[List[str]] = None
    common_misconceptions: Optional[List[str]] = None
    subdomain: Optional[str] = None


class CardGridContent(BaseModel):
    title: Optional[str] = None
    items: List[CardGridItem]


class TimelineItem(BaseModel):
    year: Optional[str] = None
    label: Optional[str] = None
    title: str
    description: Optional[str] = None
    keywords: Optional[List[str]] = None
    common_misconceptions: Optional[List[str]] = None
    subdomain: Optional[str] = None


class TimelineContent(BaseModel):
    title: Optional[str] = None
    items: List[TimelineItem]


class FlashcardFront(BaseModel):
    title: Optional[str] = None
    content: str


class FlashcardBack(BaseModel):
    title: Optional[str] = None
    content: str


class FlashcardContent(BaseModel):
    type: Literal["Flashcard"] = Field(default="Flashcard")
    id: str
    front: FlashcardFront
    back: FlashcardBack


class ClozeContent(BaseModel):
    type: Literal["Cloze"] = Field(default="Cloze")
    text: str  # Supports {{answer}} format


class CodePlaygroundContent(BaseModel):
    type: Literal["CodePlayground"] = Field(default="CodePlayground")
    mode: Literal["tokenizer", "hyperparameter"]
    initialText: Optional[str] = None
    codeTemplate: Optional[str] = None


# Frontend-compatible Block (union type)
class FrontendBlock(BaseModel):
    """A block that matches the frontend registry schema"""
    type: BlockType
    role: Optional[str] = None

    # Content (different per type)
    content: Optional[Dict[str, Any]] = Field(default_factory=dict)

    # Allow additional fields
    title: Optional[str] = None
    id: Optional[str] = None


class FrontendSection(BaseModel):
    """A section in the frontend schema"""
    section_id: Optional[str] = None
    section_type: Optional[str] = None
    title: Optional[str] = None
    layout_intent: Optional[str] = None
    pedagogical_goal: Optional[str] = None
    blocks: List[FrontendBlock]


class FrontendPageSchema(BaseModel):
    """Final output compatible with frontend SchemaRenderer"""
    page_id: str
    page_mode: Optional[str] = Field(None, alias="pageMode")
    title: str
    summary: Optional[str] = None

    # V2 format: sections
    sections: Optional[List[FrontendSection]] = None

    # V1/V2 compatibility: flattened components
    components: List[FrontendBlock] = Field(default_factory=list)

    # Metadata
    metadata: Optional[Dict[str, Any]] = None


# ============ Input/Output Models ============

class GenerationRequest(BaseModel):
    """
    Input to the multi-agent pipeline.

    Supports TWO input modes:
    1. Simple mode: Provide just a topic string (quick prototyping)
    2. Knowledge path mode: Provide structured KnowledgePath (production use)

    The pipeline will automatically detect which mode to use.
    """

    # Mode 1: Simple topic-based input
    topic: Optional[str] = Field(None, description="Main topic (for simple mode)")

    # Mode 2: Knowledge path-based input (primary)
    knowledge_path: Optional[KnowledgePath] = Field(None, description="Structured learning path (for production)")

    # Common settings
    target_audience: str = Field(default="general learners", description="Who is this content for?")
    difficulty: DifficultyLevel = Field(default=DifficultyLevel.INTERMEDIATE)
    user_intent: Optional[str] = Field(None, description="Specific user goals or requests")

    # Configuration
    max_sections: int = Field(default=6, ge=1, le=10, description="Maximum number of sections")
    include_interactive: bool = Field(default=True, description="Include interactive components")

    # Page metadata (optional)
    page_id: Optional[str] = Field(None, description="Custom page ID (auto-generated if not provided)")
    custom_title: Optional[str] = Field(None, description="Custom page title")

    def get_mode(self) -> str:
        """Detect which input mode is being used"""
        if self.knowledge_path is not None:
            return "knowledge_path"
        elif self.topic is not None:
            return "topic"
        else:
            raise ValueError("Either 'topic' or 'knowledge_path' must be provided")

    def get_effective_difficulty(self) -> DifficultyLevel:
        """Get the difficulty to use (from request or knowledge path)"""
        if self.knowledge_path and self.knowledge_path.knowledge_points:
            # Calculate average difficulty from knowledge path
            avg_diff = sum(kp.difficulty for kp in self.knowledge_path.knowledge_points) / len(self.knowledge_path.knowledge_points)
            # Map 1-4 scale to DifficultyLevel
            if avg_diff <= 1.5:
                return DifficultyLevel.BEGINNER
            elif avg_diff <= 2.5:
                return DifficultyLevel.INTERMEDIATE
            else:
                return DifficultyLevel.ADVANCED
        return self.difficulty

    def get_domain(self) -> str:
        """Get the domain (from knowledge path or topic)"""
        if self.knowledge_path:
            return self.knowledge_path.domain
        elif self.topic:
            # Simple extraction from topic
            return self.topic.split(":")[0] if ":" in self.topic else self.topic
        return "General"


class GenerationResponse(BaseModel):
    """Output from the multi-agent pipeline"""
    success: bool
    page_schema: Optional[FrontendPageSchema] = None
    planning_stage: Optional[PageSkeleton] = None
    content_stage: Optional[ContentCollection] = None
    visual_stage: Optional[VisualMapping] = None

    # Metadata
    tokens_used: Optional[int] = None
    generation_time_seconds: Optional[float] = None
    error: Optional[str] = None
    warnings: List[str] = Field(default_factory=list)


# ============ Streaming Types ============

class StreamingEventType(str, Enum):
    """Types of events that can be streamed during generation"""
    STAGE_START = "stage_start"
    STAGE_COMPLETE = "stage_complete"
    SKELETON_READY = "skeleton_ready"  # Show structure early
    BLOCK_READY = "block_ready"
    HEARTBEAT = "heartbeat"  # Keep-alive during slow generation
    PROGRESS = "progress"  # Detailed progress updates
    SECTION_COMPLETE = "section_complete"
    ERROR = "error"
    COMPLETE = "complete"


class StreamingEvent(BaseModel):
    """
    Event emitted during streaming generation.

    These events are sent via SSE to the frontend to enable
    progressive rendering of content as it's generated.
    """
    type: StreamingEventType = Field(..., description="Type of event")
    stage: Optional[str] = Field(None, description="Current stage (planner, content_expert, etc.)")
    data: Optional[Dict[str, Any]] = Field(None, description="Event-specific data")
    timestamp: float = Field(default_factory=time.time, description="Event timestamp")


# ============ Validation Helpers ============

def validate_cardgrid_items(items: List[CardGridItem]) -> bool:
    """Validate CardGrid has minimum required items"""
    return len(items) >= 2


def validate_timeline_items(items: List[TimelineItem]) -> bool:
    """Validate Timeline has minimum required items"""
    return len(items) >= 2


# ============ Workflow State ============

class WorkflowState(BaseModel):
    """State passed between LangGraph nodes"""
    request: GenerationRequest

    # Stage outputs
    skeleton: Optional[PageSkeleton] = None
    content: Optional[ContentCollection] = None
    visual_mapping: Optional[VisualMapping] = None

    # Final output
    final_schema: Optional[FrontendPageSchema] = None

    # Error tracking
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)

    # Metadata
    start_time: float = Field(default_factory=lambda: 0)
    end_time: Optional[float] = None
    tokens_used: int = Field(default=0)
