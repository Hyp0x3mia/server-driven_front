"""
FastAPI REST API for Multi-Agent Content Generation Pipeline

Provides endpoints for:
1. Generating educational content
2. Streaming generation progress
3. Managing generation history
4. Health checks
"""

import os
import time
import uuid
from datetime import datetime
from typing import Optional, List
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel, Field

# Import models and pipeline
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.schemas import (
    GenerationRequest,
    GenerationResponse,
    DifficultyLevel,
    KnowledgePath,
    KnowledgePoint
)
from workflows.pipeline import ContentGenerationPipeline, create_pipeline
from agents.assembler import AssemblerAgent


# ============ Configuration ============

class Config:
    """API Configuration"""
    # Support multiple API keys (GLM, LLM, OpenAI)
    API_KEY = (
        os.getenv("GLM_API_KEY") or
        os.getenv("LLM_API_KEY") or
        os.getenv("OPENAI_API_KEY") or
        os.getenv("ANTHROPIC_API_KEY") or
        ""
    )
    MODEL_NAME = os.getenv("GLM_MODEL") or os.getenv("LLM_MODEL") or os.getenv("MODEL_NAME", "glm-4-flash")
    CHECKPOINT_PATH = os.getenv("CHECKPOINT_PATH", "./checkpoints")
    MAX_CONCURRENT_GENERATIONS = int(os.getenv("MAX_CONCURRENT_GENERATIONS", "5"))

    @classmethod
    def validate(cls):
        """Validate configuration"""
        if not cls.API_KEY:
            raise ValueError("No API key found. Please set GLM_API_KEY, LLM_API_KEY, or OPENAI_API_KEY")


# ============ Request/Response Models ============

class GenerationRequestAPI(BaseModel):
    """
    API request model for content generation.

    Supports TWO modes:
    1. Simple mode: Provide just a topic
    2. Knowledge path mode: Provide structured knowledge_path
    """
    # Mode 1: Simple topic
    topic: Optional[str] = Field(None, description="Main topic (for simple mode)")

    # Mode 2: Knowledge path (primary)
    knowledge_path: Optional[KnowledgePath] = Field(None, description="Structured knowledge path")

    # Common settings
    target_audience: str = Field(default="general learners", description="Who is this content for?")
    difficulty: DifficultyLevel = Field(default=DifficultyLevel.INTERMEDIATE, description="Content difficulty level")
    user_intent: Optional[str] = Field(None, description="Specific user goals or requests")
    max_sections: int = Field(default=6, ge=1, le=10, description="Maximum number of sections")
    include_interactive: bool = Field(default=True, description="Include interactive components")
    thread_id: Optional[str] = Field(None, description="Thread ID for conversation continuity")

    # Page metadata
    page_id: Optional[str] = Field(None, description="Custom page ID")
    custom_title: Optional[str] = Field(None, description="Custom page title")


class GenerationStatus(BaseModel):
    """Status of a generation task"""
    task_id: str
    status: str  # pending, running, completed, failed
    created_at: datetime
    updated_at: datetime
    request: GenerationRequestAPI
    error: Optional[str] = None
    progress: float = 0.0  # 0.0 to 1.0


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    version: str
    model: str
    uptime_seconds: float


# ============ Global State ============

generation_tasks: dict[str, GenerationStatus] = {}
pipeline: Optional[ContentGenerationPipeline] = None
start_time: float = time.time()


# ============ Lifecycle Management ============

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle"""
    # Startup
    print("\n" + "="*60)
    print("🚀 Starting Multi-Agent Content Generation API")
    print("="*60)

    try:
        Config.validate()
        global pipeline
        pipeline = create_pipeline(
            model_name=Config.MODEL_NAME,
            checkpoint_path=Config.CHECKPOINT_PATH
        )
        print("✅ Pipeline initialized successfully")
        print(f"   Model: {Config.MODEL_NAME}")
        print(f"   Checkpoints: {Config.CHECKPOINT_PATH}")
    except Exception as e:
        print(f"❌ Failed to initialize pipeline: {e}")
        raise

    yield

    # Shutdown
    print("\n👋 Shutting down API...")


# ============ FastAPI App ============

app = FastAPI(
    title="Multi-Agent Content Generation API",
    description="LangGraph-powered multi-agent pipeline for educational content generation",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============ Endpoints ============

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        model=Config.MODEL_NAME,
        uptime_seconds=time.time() - start_time
    )


@app.post("/generate", response_model=GenerationResponse)
async def generate_content(
    request: GenerationRequestAPI,
    background_tasks: BackgroundTasks
):
    """
    Generate educational content using the multi-agent pipeline.

    This endpoint runs the complete 3-stage pipeline:
    1. Planner Agent generates structure
    2. Content Expert + Visual Director (parallel)
    3. Assembler merges and validates

    Returns the final frontend-compatible JSON schema.
    """
    if not pipeline:
        raise HTTPException(status_code=503, detail="Pipeline not initialized")

    # Create task ID
    task_id = str(uuid.uuid4())

    # Create status
    status = GenerationStatus(
        task_id=task_id,
        status="running",
        created_at=datetime.now(),
        updated_at=datetime.now(),
        request=request,
        progress=0.0
    )
    generation_tasks[task_id] = status

    try:
        print(f"\n📝 Task {task_id}: Starting generation")

        # Determine mode
        if request.knowledge_path:
            print(f"   Mode: Knowledge Path")
            print(f"   Domain: {request.knowledge_path.domain}")
            print(f"   Knowledge Points: {len(request.knowledge_path.knowledge_points)}")
        else:
            print(f"   Mode: Topic")
            print(f"   Topic: {request.topic}")

        print(f"   Audience: {request.target_audience}")

        # Convert to internal request model
        gen_request = GenerationRequest(
            topic=request.topic,
            knowledge_path=request.knowledge_path,
            target_audience=request.target_audience,
            difficulty=request.difficulty,
            user_intent=request.user_intent,
            max_sections=request.max_sections,
            include_interactive=request.include_interactive,
            page_id=request.page_id,
            custom_title=request.custom_title
        )

        # Run pipeline
        response = pipeline.run(
            request=gen_request,
            thread_id=request.thread_id
        )

        # Update status
        status.status = "completed" if response.success else "failed"
        status.progress = 1.0
        status.updated_at = datetime.now()
        status.error = response.error

        print(f"✅ Task {task_id}: Completed in {response.generation_time_seconds:.2f}s")

        return response

    except Exception as e:
        # Update status
        status.status = "failed"
        status.error = str(e)
        status.updated_at = datetime.now()

        print(f"❌ Task {task_id}: Failed - {e}")

        raise HTTPException(
            status_code=500,
            detail=f"Generation failed: {str(e)}"
        )


@app.get("/generate/{task_id}")
async def get_generation_status(task_id: str):
    """
    Get the status of a generation task.

    Returns the current status, progress, and result if available.
    """
    if task_id not in generation_tasks:
        raise HTTPException(status_code=404, detail="Task not found")

    return generation_tasks[task_id]


@app.get("/tasks")
async def list_tasks(
    status_filter: Optional[str] = None,
    limit: int = 50
):
    """
    List recent generation tasks.

    Optionally filter by status (pending, running, completed, failed).
    """
    tasks = list(generation_tasks.values())

    if status_filter:
        tasks = [t for t in tasks if t.status == status_filter]

    # Sort by created_at, most recent first
    tasks.sort(key=lambda t: t.created_at, reverse=True)

    return tasks[:limit]


@app.post("/generate/stream")
async def generate_content_stream(request: GenerationRequestAPI):
    """
    Generate content with streaming progress updates.

    Returns Server-Sent Events (SSE) with real-time progress.
    """
    if not pipeline:
        raise HTTPException(status_code=503, detail="Pipeline not initialized")

    task_id = str(uuid.uuid4())

    async def event_generator():
        """Generate SSE events"""
        try:
            yield f"event: start\ndata: {{'task_id': '{task_id}', 'status': 'starting'}}\n\n"

            # Convert to internal request
            gen_request = GenerationRequest(**request.model_dump())

            # Run pipeline (you'd modify the pipeline to support streaming)
            response = pipeline.run(request=gen_request, thread_id=task_id)

            # Send progress events
            yield f"event: progress\ndata: {{'stage': 'planner', 'progress': 0.33}}\n\n"
            yield f"event: progress\ndata: {{'stage': 'content_expert', 'progress': 0.66}}\n\n"
            yield f"event: progress\ndata: {{'stage': 'visual_director', 'progress': 0.66}}\n\n"
            yield f"event: progress\ndata: {{'stage': 'assembler', 'progress': 1.0}}\n\n"

            # Send final result
            if response.success:
                import json
                result_data = response.model_dump_json(exclude_unset=True)
                yield f"event: complete\ndata: {result_data}\n\n"
            else:
                yield f"event: error\ndata: {{'error': '{response.error}'}}\n\n"

        except Exception as e:
            yield f"event: error\ndata: {{'error': '{str(e)}'}}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@app.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    """Delete a task from history"""
    if task_id not in generation_tasks:
        raise HTTPException(status_code=404, detail="Task not found")

    del generation_tasks[task_id]
    return {"message": "Task deleted"}


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "Multi-Agent Content Generation API",
        "version": "1.0.0",
        "description": "LangGraph-powered educational content generation",
        "endpoints": {
            "health": "/health",
            "generate": "/generate",
            "generate_stream": "/generate/stream",
            "tasks": "/tasks",
            "docs": "/docs"
        },
        "pipeline_stages": [
            "Planner Agent (Structure)",
            "Content Expert (Pedagogy)",
            "Visual Director (UI Components)",
            "Assembler (Validation)"
        ]
    }


# ============ Error Handlers ============

@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    """Handle ValueError"""
    return JSONResponse(
        status_code=400,
        content={"error": str(exc)}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle unexpected errors"""
    print(f"❌ Unexpected error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"}
    )


# ============ Main ============

if __name__ == "__main__":
    import uvicorn

    # Check environment
    try:
        Config.validate()
    except ValueError as e:
        print(f"❌ Configuration error: {e}")
        print("\nPlease set one of the following environment variables:")
        print("  export GLM_API_KEY='your-glm-key'          # GLM (推荐)")
        print("  export LLM_API_KEY='your-api-key'          # SiliconFlow/其他")
        print("  export OPENAI_API_KEY='your-openai-key'    # OpenAI")
        print("\nOr create a .env file:")
        print("  GLM_API_KEY=your-glm-api-key")
        print("  GLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4/")
        print("  GLM_MODEL=glm-4-flash")
        exit(1)

    # Run server
    print("\n🚀 Starting API server...")
    print(f"   Model: {Config.MODEL_NAME}")
    print(f"   URL: http://localhost:8000")
    print(f"   Docs: http://localhost:8000/docs")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
