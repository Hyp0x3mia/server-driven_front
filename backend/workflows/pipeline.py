"""
LangGraph Multi-Agent Content Generation Pipeline

This module defines the complete workflow using LangGraph:
1. Planner Agent generates skeleton
2. Content Expert + Visual Director run in parallel
3. Assembler merges and validates output
"""

import time
from typing import Optional

from langgraph.graph import StateGraph, END

from models.schemas import WorkflowState, GenerationRequest, GenerationResponse
from agents.planner import PlannerAgent
from agents.content_expert import ContentExpertAgent
from agents.visual_director import VisualDirectorAgent
from agents.assembler import AssemblerAgent


class ContentGenerationPipeline:
    """
    Multi-agent content generation pipeline using LangGraph.

    Architecture:
    ┌─────────────────────────────────────────────────────────────┐
    │                      User Request                            │
    │                  (topic, audience, etc.)                     │
    └────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                   Stage 1: Planner                           │
    │  Generates page skeleton (sections, nodes, relationships)    │
    └────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
    ┌─────────────────────────────────────────────────────────────┐
    │              Stage 2: Parallel Workers                       │
    │  ┌──────────────────┐          ┌──────────────────┐        │
    │  │  Content Expert  │          │ Visual Director  │        │
    │  │  (pedagogy,      │          │ (component       │        │
    │  │   accuracy)      │          │  selection)      │        │
    │  └──────────────────┘          └──────────────────┘        │
    │           │                              │                   │
    │           └──────────┬───────────────────┘                   │
    │                      ▼                                       │
    │              Content + Visual Mapping                        │
    └────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                 Stage 3: Assembler                           │
    │  Merges content + visual, validates with Pydantic            │
    └────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                    Final Output                              │
    │              (Frontend-compatible JSON)                      │
    └─────────────────────────────────────────────────────────────┘
    """

    def __init__(
        self,
        model_name: str = "claude-sonnet-4-20250514",
        checkpoint_path: str = "./checkpoints"
    ):
        """
        Initialize the pipeline.

        Args:
            model_name: Anthropic model to use for all agents
            checkpoint_path: Path for LangGraph checkpointing (optional, not used currently)
        """
        self.model_name = model_name

        # Initialize agents
        self.planner = PlannerAgent(model_name=model_name)
        self.content_expert = ContentExpertAgent(model_name=model_name)
        self.visual_director = VisualDirectorAgent(model_name=model_name)
        self.assembler = AssemblerAgent()

        # Build workflow
        self.workflow = self._build_workflow()

    def _build_workflow(self) -> StateGraph:
        """Build the LangGraph workflow."""

        # Define the graph
        workflow = StateGraph(WorkflowState)

        # Add nodes
        workflow.add_node("planner", self._planner_node)
        workflow.add_node("content_expert", self._content_expert_node)
        workflow.add_node("visual_director", self._visual_director_node)
        workflow.add_node("assembler", self._assembler_node)

        # Define edges
        workflow.set_entry_point("planner")

        # After planner, run workers sequentially (avoid concurrent API calls)
        workflow.add_edge("planner", "content_expert")
        workflow.add_edge("content_expert", "visual_director")
        workflow.add_edge("visual_director", "assembler")

        # End after assembler
        workflow.add_edge("assembler", END)

        # Compile workflow (without checkpointer for now)
        return workflow.compile()

    def _planner_node(self, state: WorkflowState) -> WorkflowState:
        """Planner Agent node."""
        print("\n" + "="*60)
        print("🏗️  STAGE 1: PLANNER AGENT")
        print("="*60)

        try:
            skeleton = self.planner.plan(state.request)
            state.skeleton = skeleton
            state.tokens_used += 2000  # Estimated token usage

        except Exception as e:
            state.errors.append(f"Planner failed: {e}")

        return state

    def _content_expert_node(self, state: WorkflowState) -> WorkflowState:
        """Content Expert Agent node."""
        print("\n" + "="*60)
        print("📚 STAGE 2A: CONTENT EXPERT AGENT")
        print("="*60)

        # Add delay to avoid API rate limiting
        import time
        time.sleep(2)

        # Only proceed if skeleton exists
        if not state.skeleton:
            state.errors.append("Content Expert: No skeleton to work with")
            return state

        try:
            content = self.content_expert.generate_content(
                skeleton=state.skeleton,
                target_audience=state.request.target_audience
            )
            state.content = content
            state.tokens_used += 5000  # Estimated token usage

        except Exception as e:
            state.errors.append(f"Content Expert failed: {e}")

        return state

    def _visual_director_node(self, state: WorkflowState) -> WorkflowState:
        """Visual Director Agent node."""
        print("\n" + "="*60)
        print("🎨 STAGE 2B: VISUAL DIRECTOR AGENT")
        print("="*60)

        # Add delay to avoid API rate limiting
        import time
        time.sleep(2)

        # Only proceed if skeleton exists
        if not state.skeleton:
            state.errors.append("Visual Director: No skeleton to work with")
            return state

        try:
            visual_mapping = self.visual_director.map_content_to_visuals(
                skeleton=state.skeleton
            )
            state.visual_mapping = visual_mapping
            state.tokens_used += 1500  # Estimated token usage

        except Exception as e:
            state.errors.append(f"Visual Director failed: {e}")

        return state

    def _assembler_node(self, state: WorkflowState) -> WorkflowState:
        """Assembler Agent node."""
        print("\n" + "="*60)
        print("🔧 STAGE 3: ASSEMBLER & VALIDATOR")
        print("="*60)

        # Check if both workers completed
        if not state.skeleton:
            state.errors.append("Assembler: No skeleton available")
            return state

        if not state.content:
            state.errors.append("Assembler: No content available")
            return state

        if not state.visual_mapping:
            state.errors.append("Assembler: No visual mapping available")
            return state

        try:
            final_schema = self.assembler.assemble(
                skeleton=state.skeleton,
                content=state.content,
                visual_mapping=state.visual_mapping
            )

            state.final_schema = final_schema
            state.warnings.extend(self.assembler.warnings)

            print("\n" + "="*60)
            print("✅ PIPELINE COMPLETE")
            print("="*60)

        except Exception as e:
            state.errors.append(f"Assembler failed: {e}")

        return state

    def run(self, request: GenerationRequest, thread_id: str = None) -> GenerationResponse:
        """
        Run the complete pipeline.

        Args:
            request: Generation request
            thread_id: Optional thread ID for resuming conversations

        Returns:
            GenerationResponse with final schema and metadata
        """
        print("\n🚀 Starting Multi-Agent Content Generation Pipeline")
        print(f"   Topic: {request.topic}")
        print(f"   Audience: {request.target_audience}")
        print(f"   Difficulty: {request.difficulty.value}")

        # Initialize state
        initial_state = WorkflowState(
            request=request,
            start_time=time.time()
        )

        # Run workflow
        config = {"configurable": {"thread_id": thread_id or "default"}}
        final_state = self.workflow.invoke(initial_state, config)

        # Handle potential dict return from LangGraph (in case state is serialized)
        if isinstance(final_state, dict):
            # Convert dict back to WorkflowState
            final_state = WorkflowState(**final_state)

        # Calculate timing
        end_time = time.time()
        generation_time = end_time - initial_state.start_time

        # Build response with error handling
        try:
            response = GenerationResponse(
                success=len(final_state.errors) == 0,
                page_schema=final_state.final_schema,
                planning_stage=final_state.skeleton,
                content_stage=final_state.content,
                visual_stage=final_state.visual_mapping,
                tokens_used=final_state.tokens_used,
                generation_time_seconds=generation_time,
                error="; ".join(final_state.errors) if final_state.errors else None,
                warnings=final_state.warnings if hasattr(final_state, 'warnings') else []
            )
        except Exception as e:
            print(f"⚠️  Error building response: {e}")
            # Return minimal error response
            return GenerationResponse(
                success=False,
                error=f"Pipeline execution error: {e}",
                tokens_used=final_state.tokens_used if hasattr(final_state, 'tokens_used') else 0,
                generation_time_seconds=generation_time
            )

        return response

    def run_streaming(self, request: GenerationRequest):
        """
        Run the pipeline with streaming output.

        Yields status updates as the pipeline progresses.
        """
        print("\n🚀 Starting Multi-Agent Content Generation Pipeline (Streaming)")

        # Initialize state
        initial_state = WorkflowState(
            request=request,
            start_time=time.time()
        )

        # Run with streaming
        config = {"configurable": {"thread_id": "streaming"}}

        async def stream_generator():
            async for event in self.workflow.astream_events(initial_state, config, version="v1"):
                # Yield relevant events
                if "event" in event:
                    yield {
                        "type": "event",
                        "data": event
                    }

        return stream_generator()


# ============ Helper Functions ============

def create_pipeline(
    model_name: str = "claude-sonnet-4-20250514",
    checkpoint_path: str = "./checkpoints"
) -> ContentGenerationPipeline:
    """
    Create a content generation pipeline.

    Args:
        model_name: Anthropic model to use
        checkpoint_path: Path for checkpointing

    Returns:
        Configured ContentGenerationPipeline
    """
    return ContentGenerationPipeline(
        model_name=model_name,
        checkpoint_path=checkpoint_path
    )


def quick_generate(
    topic: str,
    target_audience: str = "general learners",
    difficulty: str = "intermediate",
    model_name: str = "claude-sonnet-4-20250514"
) -> GenerationResponse:
    """
    Quick helper to generate content without setting up the full pipeline.

    Args:
        topic: Topic to generate content for
        target_audience: Who is this for?
        difficulty: beginner, intermediate, or advanced
        model_name: Model to use

    Returns:
        GenerationResponse with final schema
    """
    from models.schemas import DifficultyLevel

    request = GenerationRequest(
        topic=topic,
        target_audience=target_audience,
        difficulty=DifficultyLevel(difficulty)
    )

    pipeline = create_pipeline(model_name=model_name)
    return pipeline.run(request)


# ============ CLI Interface ============

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Generate educational content using multi-agent pipeline")
    parser.add_argument("--topic", required=True, help="Topic to generate content for")
    parser.add_argument("--audience", default="general learners", help="Target audience")
    parser.add_argument("--difficulty", default="intermediate", choices=["beginner", "intermediate", "advanced"])
    parser.add_argument("--output", help="Output JSON file path")
    parser.add_argument("--model", default="claude-sonnet-4-20250514", help="Anthropic model")

    args = parser.parse_args()

    # Generate
    response = quick_generate(
        topic=args.topic,
        target_audience=args.audience,
        difficulty=args.difficulty,
        model_name=args.model
    )

    # Print results
    if response.success:
        print("\n✅ Generation successful!")
        print(f"   Time: {response.generation_time_seconds:.2f}s")
        print(f"   Tokens: {response.tokens_used}")

        if response.warnings:
            print(f"\n⚠️  Warnings: {len(response.warnings)}")

        # Export if requested
        if args.output and response.page_schema:
            assembler = AssemblerAgent()
            assembler.export_to_json(response.page_schema, args.output)
    else:
        print(f"\n❌ Generation failed: {response.error}")
