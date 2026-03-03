# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI-powered educational content generation platform that combines a React frontend with a Python FastAPI backend using LangGraph multi-agent workflows. The system generates comprehensive, pedagogically-optimized educational content with progressive streaming capabilities.

## Architecture

### Tech Stack

**Frontend**
- React 18 with JSX/TypeScript
- Vite 5.4.11 for bundling
- Tailwind CSS + Radix UI components
- React Router DOM (hash-based routing)
- TanStack Query for API state management
- Custom SchemaRenderer for dynamic content

**Backend**
- FastAPI with async support
- LangGraph for multi-agent orchestration
- OpenAI-compatible LLM APIs (GLM, SiliconFlow, OpenAI, Azure)
- Pydantic for schema validation

### Multi-Agent Pipeline

The system uses a 4-stage LangGraph pipeline:

1. **Planner Agent** (`backend/agents/planner.py`)
   - Generates page structure and learning skeleton
   - Creates sections: Concept, History, Theory, Application, Practice, Summary
   - Defines content nodes with prerequisites and learning objectives

2. **Content Expert Agent** (`backend/agents/content_expert.py`)
   - Generates pedagogically-optimized content
   - Focuses on clarity, examples, misconceptions, and assessment
   - Creates rich markdown content with key points

3. **Visual Director Agent** (`backend/agents/visual_director.py`)
   - Maps content to appropriate UI components
   - Intelligently selects components based on content type
   - Generates visual mappings (Hero, CardGrid, Timeline, Flashcard, etc.)

4. **Assembler Agent** (`backend/agents/assembler.py`)
   - Merges all outputs and validates with Pydantic
   - Transforms to frontend-compatible JSON schema
   - Runs quality checks and exports to `backend/public/pages/`

### Key Data Flow

```
User Request → FastAPI → LangGraph Pipeline → SSE Events → Frontend
     ↓              ↓           ↓                    ↓            ↓
  topic/      Generation   4-Stage Agents      Progressive   SchemaRenderer
knowledge_path   Request    (planner →         Block-by-block  Dynamic UI
                   content + visual          Rendering
                        → assembler)
```

## Development Commands

### Frontend (port 8080)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Build for development
npm run build:dev

# Lint code
npm run lint

# Preview build
npm run preview
```

### Backend (port 8000)

```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Run API server
python api/main.py

# Or with uvicorn
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload

# Run tests
pytest

# Run specific test
python test_pipeline_direct.py

# Test streaming functionality
bash ../test_stream.sh
```

### Environment Setup

Create a `.env` file or set environment variables:

```bash
# GLM (推荐)
export GLM_API_KEY="your-glm-api-key"
export GLM_BASE_URL="https://open.bigmodel.cn/api/pas/v4/"
export GLM_MODEL="glm-4-flash"

# OR SiliconFlow/Other
export LLM_API_KEY="your-api-key"
export LLM_BASE_URL="https://api.siliconflow.cn/v1"
export LLM_MODEL="deepseek-ai/DeepSeek-V3"

# OR OpenAI
export OPENAI_API_KEY="your-openai-key"
export OPENAI_BASE_URL="https://api.openai.com/v1"
```

## Directory Structure

```
nocode/
├── src/                          # Frontend source
│   ├── components/ui/           # Radix UI components
│   ├── pages/
│   │   ├── SchemaPage.tsx       # Static schema rendering
│   │   └── StreamingSchemaPage.tsx # Streaming generation
│   ├── renderer/
│   │   ├── SchemaRenderer.tsx   # Main renderer
│   │   └── StreamingSchemaRenderer.tsx # Streaming renderer
│   └── App.jsx                  # Main app with routing
├── backend/
│   ├── agents/                  # Multi-agent system
│   ├── api/main.py             # FastAPI endpoints
│   ├── models/                  # Pydantic schemas
│   ├── workflows/pipeline.py   # LangGraph workflow
│   ├── llm/                     # LLM client abstraction
│   └── public/pages/           # Generated JSON schemas
└── public/                      # Static assets
```

## API Endpoints

### Content Generation
- `POST /generate` - Synchronous generation
- `POST /generate/stream` - SSE streaming with progressive updates
- `GET /tasks` - List generation tasks
- `GET /tasks/{task_id}` - Get task status
- `DELETE /tasks/{task_id}` - Delete task
- `GET /health` - Health check

### SSE Event Types (Streaming)
- `stage_start` - Stage beginning
- `stage_complete` - Stage finished with metadata
- `skeleton_ready` - Page structure available (show titles)
- `block_ready` - Individual component ready to render
- `progress` - Detailed progress "5/12 (42%)"
- `complete` - Generation finished, auto-saved to JSON
- `error` - Error occurred

## Component Library

The SchemaRenderer supports these UI components:

- **Hero** - Introductions with features
- **Markdown** - Rich text content with LaTeX support
- **CardGrid** - Concept mapping and comparisons
- **Timeline** - Process flows and historical content
- **Flashcard** - Definitions and Q&A
- **CodePlayground** - Interactive coding exercises
- **Cloze** - Fill-in-the-blank exercises

## Key Patterns

1. **Schema-Driven Architecture** - All content generated as JSON schemas
2. **Component-Based Rendering** - UI components dynamically mapped to content
3. **Event-Streaming** - Real-time updates via SSE for better UX
4. **Agent Collaboration** - Specialized agents for different aspects
5. **Provider-Agnostic LLM** - Supports multiple AI providers

## Dual Input Modes

### Simple Mode
Generate content from just a topic:
```json
{
  "topic": "Machine Learning Basics",
  "target_audience": "beginners",
  "difficulty": "beginner"
}
```

### Knowledge Path Mode
Structured educational data with cognitive levels:
```json
{
  "knowledge_path": {
    "domain": "Machine Learning",
    "knowledge_points": [
      {
        "id": "ml-basics-001",
        "title": "Supervised Learning",
        "cognitive_level": "understanding"
      }
    ]
  }
}
```

## Common Issues

1. **Import Errors**: Run `pip install -r requirements.txt` in backend
2. **API Key Issues**: Check environment variables are set correctly
3. **Port Conflicts**: Frontend on 8080, backend on 8000
4. **CORS Issues**: Configured for development in `backend/api/main.py`
5. **Streaming Issues**: Check that SSE is not buffered by proxy/server

## Testing

- **Unit Tests**: Individual agent testing
- **Pipeline Tests**: End-to-end workflow (`test_pipeline_direct.py`)
- **Streaming Tests**: Verify progressive generation (`test_streaming.py`)
- **Integration Tests**: GLM API integration (`test_glm_integration.py`)
