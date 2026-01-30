# Multi-Agent Content Generation Pipeline - Architecture Overview

## 🎯 Problem Statement

Current LLM-based content generation has significant limitations:

1. **Single-shot prompting** - Unstable results, hard to control
2. **Low component utilization** - Doesn't leverage available UI components effectively
3. **Poor pedagogy** - Content lacks educational structure
4. **No visual design** - Text-heavy, not optimized for learning

## 💡 Solution: Multi-Agent Pipeline

A **3-stage LangGraph workflow** that separates concerns:

```
Input Topic
    │
    ▼
┌─────────────────────────────────┐
│  Stage 1: Planner Agent         │  ← Structure & Learning Path
│  - Sections & nodes             │
│  - Prerequisites                │
│  - Learning objectives          │
└────────────┬────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────┐
│  Stage 2: Parallel Workers                           │
│  ┌──────────────────┐      ┌──────────────────┐     │
│  │ Content Expert   │      │ Visual Director  │     │
│  │ - Pedagogy       │      │ - Component      │     │
│  │ - Accuracy       │      │   selection      │     │
│  │ - Examples       │      │ - Visual design  │     │
│  │ - Analogies      │      │ - Layout         │     │
│  └──────────────────┘      └──────────────────┘     │
└────────────┬───────────────────────┬────────────────┘
             │                       │
             └───────────┬───────────┘
                         ▼
┌─────────────────────────────────────────────────┐
│  Stage 3: Assembler & Validator                 │
│  - Merge content + visual                       │
│  - Transform to frontend schema                 │
│  - Pydantic validation                          │
│  - Quality checks                               │
└────────────┬────────────────────────────────────┘
             │
             ▼
      Frontend-Compatible JSON
```

## 🏗️ Stage 1: Planner Agent

### Purpose
Generate lightweight page skeleton without writing actual content.

### Responsibilities
- Analyze topic and break into learnable units
- Design learning flow (prerequisites, progression)
- Organize into sections (Concept, History, Theory, etc.)
- Estimate time and difficulty

### Output: PageSkeleton
```python
{
  "page_id": "transformer-architecture",
  "title": "Understanding Transformers",
  "sections": [
    {
      "section_id": "section-01-intro",
      "section_type": "Concept",
      "title": "Introduction to Transformers",
      "nodes": [
        {
          "node_id": "section-01-intro-node-01-attention",
          "title": "What is Attention?",
          "category": "abstract_concept",
          "difficulty": "intermediate",
          "prerequisites": [],
          "learning_objectives": [
            "Understand the attention mechanism",
            "Compare with previous approaches"
          ]
        }
      ]
    }
  ]
}
```

### Key Features
- **Scaffolding**: Starts simple, builds complexity
- **Dependency tracking**: `prerequisites` field ensures proper ordering
- **Time estimates**: Realistic learning time per node
- **Clear objectives**: Each node has 1-3 learning goals

## 📚 Stage 2A: Content Expert Agent

### Purpose
Generate pedagogically-effective content for each node.

### Responsibilities
- Write clear, accurate explanations
- Provide concrete examples and analogies
- Identify common misconceptions
- Create assessment questions
- Use proper formatting (Markdown)

### Output: ContentCollection
```python
{
  "contents": [
    {
      "node_id": "section-01-intro-node-01-attention",
      "title": "What is Attention?",
      "category": "abstract_concept",

      "main_content": """
# Attention Mechanism

The attention mechanism allows a model to focus on relevant parts of the input...
      """,

      "key_points": [
        "Attention learns importance weights",
        "It replaces sequential processing"
      ],

      "examples": [
        "Reading comprehension: focus on relevant sentences",
        "Image captioning: attend to relevant regions"
      ],

      "analogies": """
Think of attention like a spotlight in a dark room.
You can only see what the spotlight illuminates...
      """,

      "keywords": ["attention", "weights", "sequential"],
      "common_misconceptions": [
        "Attention is not the same as RNNs"
      ],

      "quiz_questions": [
        "What problem does attention solve?"
      ],
      "quiz_answers": [
        "Long-range dependencies in sequential data"
      ]
    }
  ]
}
```

### Key Features
- **Pedagogy-first**: Uses analogies, examples, scaffolding
- **Misconception-aware**: Explicitly addresses common errors
- **Assessment-integrated**: Built-in quiz questions
- **Rich formatting**: Markdown with headings, lists, code

## 🎨 Stage 2B: Visual Director Agent

### Purpose
Map each content node to the best UI component.

### Responsibilities
- Analyze content type and pedagogical intent
- Select appropriate UI component
- Configure component-specific settings
- Ensure variety and engagement

### Output: VisualMapping
```python
{
  "mappings": [
    {
      "node_id": "section-01-intro-node-01-attention",
      "block_type": "CardGrid",
      "role": "core-concept",
      "config": {},

      "rationale": """
CardGrid: Multiple related concepts benefit from equal visual weight.
Students can scan and compare key ideas easily.
      """
    },
    {
      "node_id": "section-02-history-node-01-timeline",
      "block_type": "Timeline",
      "role": "historical-narrative",
      "config": {},

      "rationale": """
Timeline: Historical development requires chronological display.
Shows progression from RNNs to Transformers.
      """
    }
  ]
}
```

### Decision Matrix

| Content Category | Best Component | Rationale |
|------------------|----------------|-----------|
| `abstract_concept` | CardGrid | Multiple facets, equal weight |
| `comparison_analysis` | CardGrid | Side-by-side comparison |
| `process_flow` | Timeline | Sequential steps |
| `code_example` | CodePlayground | Interactive demo |
| `definition` | Flashcard | Isolated practice |
| `practice_exercise` | Flashcard/Cloze | Assessment |
| `historical_event` | Timeline | Chronological display |

### Key Features
- **Variety**: Mixes component types for engagement
- **Appropriateness**: Matches component to content
- **Configuration**: Component-specific settings
- **Rationale**: Explains WHY each choice was made

## 🔧 Stage 3: Assembler & Validator

### Purpose
Merge content and visual mapping into final frontend-compatible schema.

### Process
1. **Match nodes**: Join content with visual mapping by `node_id`
2. **Transform blocks**: Convert to frontend component format
3. **Build sections**: Organize into section structure
4. **Validate**: Pydantic schema validation
5. **Quality checks**: Component-specific rules (min items, etc.)

### Output: FrontendPageSchema
```python
{
  "page_id": "transformer-architecture",
  "title": "Understanding Transformers",
  "summary": "Learn about the Transformer architecture...",

  "sections": [
    {
      "section_id": "section-01-intro",
      "section_type": "Concept",
      "title": "Introduction",
      "layout_intent": "wide",
      "pedagogical_goal": "Introduce core concepts",
      "blocks": [
        {
          "type": "Hero",
          "role": "intro",
          "content": {
            "title": "Understanding Transformers",
            "subtitle": "From attention to GPT",
            "features": [...]
          }
        },
        {
          "type": "CardGrid",
          "role": "core-concept",
          "content": {
            "title": "Key Concepts",
            "items": [...]
          }
        }
      ]
    }
  ],

  "components": [...],  # Flattened for rendering
  "metadata": {...}
}
```

### Key Features
- **Schema validation**: Ensures frontend compatibility
- **Quality checks**: Validates component requirements
- **Flattened components**: For easier rendering
- **Metadata**: Time estimates, warnings, etc.

## 🔄 LangGraph Workflow

### State Management

```python
class WorkflowState:
    request: GenerationRequest        # Input
    skeleton: PageSkeleton            # Stage 1 output
    content: ContentCollection        # Stage 2A output
    visual_mapping: VisualMapping     # Stage 2B output
    final_schema: FrontendPageSchema  # Stage 3 output

    errors: List[str]
    warnings: List[str]
    tokens_used: int
```

### Execution Graph

```
[Entry] → [Planner] → [Content Expert] ──────┐
           ↓                                ↓
      [Skeleton] → [Visual Director] ────→ [Assembler] → [END]
                      ↓                   ↑
                 [Visual Mapping] ─────────┘
                     ↑
                 [Content]
```

### Parallel Execution

```python
# Stage 2 workers run in parallel
workflow.add_edge("planner", "content_expert")
workflow.add_edge("planner", "visual_director")

# Both must complete before assembler
workflow.add_edge("content_expert", "assembler")
workflow.add_edge("visual_director", "assembler")
```

## 🎯 Key Benefits

### 1. Separation of Concerns
- **Planner**: Structure, not content
- **Content Expert**: Pedagogy, not components
- **Visual Director**: UX, not facts
- **Assembler**: Integration, not creation

### 2. Parallel Execution
- Content Expert + Visual Director run simultaneously
- Faster generation time
- Better resource utilization

### 3. Validation at Each Stage
- Pydantic schemas ensure type safety
- Component-specific validation rules
- Quality checks before output

### 4. Debuggability
- Clear intermediate outputs
- Rationales for decisions
- Error tracking per stage

### 5. Customizability
- Swap individual agents
- Add new stages
- Modify decision logic

## 📊 Performance Metrics

### Token Usage (Estimated)
- Stage 1 (Planner): ~2K tokens
- Stage 2A (Content Expert): ~5K tokens
- Stage 2B (Visual Director): ~1.5K tokens
- **Total**: ~8.5K tokens per page

### Generation Time
- Planner: ~10-15s
- Content Expert: ~30-45s (parallel)
- Visual Director: ~5-10s (parallel)
- Assembler: ~1-2s
- **Total**: ~45-70s

### Quality Improvements
- **Component variety**: 3-5 types vs 1-2 in single-shot
- **Pedagogical structure**: Learning objectives, scaffolding
- **Visual engagement**: Appropriate components per content type

## 🚀 Future Enhancements

1. **Add more agents**:
   - Reviewer Agent (quality control)
   - Localization Agent (translations)
   - SEO Agent (metadata optimization)

2. **Improve Visual Director**:
   - Learn from user feedback
   - A/B testing component choices
   - Track engagement metrics

3. **Optimize Content Expert**:
   - Domain-specific fine-tuning
   - RAG for factual accuracy
   - Multi-modal content (images, diagrams)

4. **Better Assembler**:
   - Layout optimization
   - Accessibility checks
   - Responsive design rules

## 📚 References

- [LangGraph Documentation](https://github.com/langchain-ai/langgraph)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Pydantic Validation](https://docs.pydantic.dev/)
- [Frontend Schema Reference](../src/renderer/registry.tsx)

---

**Status**: ✅ Production Ready

**Version**: 1.0.0

**Last Updated**: 2025-01-24
