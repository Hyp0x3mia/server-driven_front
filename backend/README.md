# Multi-Agent Content Generation Pipeline

A LangGraph-powered multi-agent system for generating educational content with intelligent component selection and pedagogical optimization.

## ✨ Features

- **🎯 Dual Input Modes**: Simple topic strings OR structured knowledge paths
- **🤚 Multi-Agent Pipeline**: 3-stage collaborative generation with LangGraph
- **🎨 Intelligent Component Selection**: Automatic UI component mapping
- **📚 Pedagogical Optimization**: ContentExpert agent focuses on learning effectiveness
- **🔌 OpenAI-Compatible APIs**: Supports GLM, SiliconFlow, OpenAI, Azure, and more
- **📊 Knowledge Path Support**: Direct conversion from structured educational data
- **✅ Frontend-Ready Output**: JSON schema compatible with SchemaRenderer

## 🎯 Overview

This pipeline transforms educational content into a complete, frontend-compatible page through a 3-stage process:

1. **🏗️ Planner Agent** - Generates page structure and learning path
2. **📚 Content Expert + 🎨 Visual Director** - Parallel content generation and UI mapping
3. **🔧 Assembler & Validator** - Merges outputs and validates with Pydantic

## 📁 Project Structure

```
backend/
├── agents/
│   ├── planner.py              # Stage 1: Structure generation
│   ├── content_expert.py       # Stage 2A: Pedagogy-focused content
│   ├── visual_director.py      # Stage 2B: Component selection
│   └── assembler.py            # Stage 3: Merge & validate
├── models/
│   ├── schemas.py              # Pydantic models for all stages
│   ├── adapters.py             # Knowledge path to skeleton converter
│   └── narrative.py            # Structured to narrative context builder
├── workflows/
│   └── pipeline.py             # LangGraph workflow definition
├── llm/
│   └── client.py               # Unified OpenAI-compatible LLM client ⭐
├── api/
│   └── main.py                 # FastAPI REST API
├── requirements.txt
├── .env.example
├── GLM_CONFIG.md               # GLM API configuration guide ⭐
├── OPENAI_CONFIG.md            # OpenAI-compatible API guide ⭐
├── OPENAI_MIGRATION.md         # Migration guide ⭐
├── setup_llm.py                # Configuration helper ⭐
└── README.md
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure LLM API

Choose any OpenAI-compatible API:

#### Option 1: GLM (智谱) - Recommended for Chinese

```bash
export GLM_API_KEY="your-glm-api-key"
export GLM_BASE_URL="https://open.bigmodel.cn/api/paas/v4/"
export GLM_MODEL="glm-4-flash"
```

#### Option 2: SiliconFlow

```bash
export LLM_API_KEY="your-siliconflow-key"
export LLM_BASE_URL="https://api.siliconflow.cn/v1"
export LLM_MODEL="deepseek-ai/DeepSeek-V3"
```

#### Option 3: OpenAI

```bash
export OPENAI_API_KEY="your-openai-key"
export OPENAI_BASE_URL="https://api.openai.com/v1"
```

#### Or create .env file

```bash
cp .env.example .env
# Edit .env with your API configuration
```

**See configuration guides:**
- **[GLM_CONFIG.md](GLM_CONFIG.md)** - GLM API setup (recommended for Chinese)
- **[OPENAI_CONFIG.md](OPENAI_CONFIG.md)** - All OpenAI-compatible APIs
- **[setup_llm.py](setup_llm.py)** - Interactive configuration helper

### 3. Run the API Server

```bash
python api/main.py
```

Or using uvicorn directly:

```bash
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Generate Content

```bash
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Transformer Architecture",
    "target_audience": "ML engineers",
    "difficulty": "intermediate"
  }'
```

## 📚 Usage Examples

### Python SDK

#### Simple Topic Mode

```python
from workflows.pipeline import quick_generate

# Generate content
response = quick_generate(
    topic="Natural Language Processing",
    target_audience="Data Scientists",
    difficulty="intermediate"
)

if response.success:
    # Access the frontend-compatible schema
    schema = response.page_schema

    # Export to JSON
    from agents.assembler import AssemblerAgent
    assembler = AssemblerAgent()
    assembler.export_to_json(schema, "output/nlp-page.json")

    print(f"✅ Generated in {response.generation_time_seconds:.2f}s")
else:
    print(f"❌ Error: {response.error}")
```

#### Knowledge Path Mode (Structured Input)

```python
from models.schemas import KnowledgePath, KnowledgePoint, CognitiveLevel
from workflows.pipeline import quick_generate

# Create structured knowledge path
knowledge_path = KnowledgePath(
    knowledge_points=[
        KnowledgePoint(
            knowledge_id="NLP-001",
            name="自然语言处理定义",
            description="NLP是AI的一个分支",
            domain="人工智能",
            subdomain="自然语言处理",
            difficulty=1,
            cognitive_level=CognitiveLevel.COG_L1,
            importance=0.9,
            # ... all fields preserved
        ),
        # ... more knowledge points
    ],
    domain="人工智能",
    target_audience="初学者"
)

# Generate from knowledge path
response = quick_generate(
    knowledge_path=knowledge_path
)

if response.success:
    schema = response.page_schema
    print(f"✅ Generated {len(schema.sections)} sections")
```

### Advanced Usage

```python
from models.schemas import GenerationRequest, DifficultyLevel
from workflows.pipeline import create_pipeline

# Create pipeline (uses configured LLM from env)
pipeline = create_pipeline()

# Create custom request
request = GenerationRequest(
    topic="Reinforcement Learning",
    target_audience="AI Researchers",
    difficulty=DifficultyLevel.ADVANCED,
    user_intent="Focus on Q-Learning algorithms",
    max_sections=8,
    include_interactive=True
)

# Run pipeline
response = pipeline.run(request)

# Access intermediate stages
print(f"Planning: {response.planning_stage}")
print(f"Content: {response.content_stage}")
print(f"Visual: {response.visual_stage}")
```

## 🏗️ Architecture

### Stage 1: Planner Agent

**Responsibility**: Generate lightweight page skeleton

**Input**:
- User topic
- Target audience
- Difficulty level
- User intent

**Output**:
- PageSkeleton with:
  - Sections (Concept, History, Theory, Application, Practice, Summary)
  - Content nodes with prerequisites
  - Learning objectives
  - Time estimates

### Stage 2A: Content Expert Agent

**Responsibility**: Generate pedagogically-effective content

**Focus Areas**:
- ✅ Accuracy and clarity
- ✅ Analogies and examples
- ✅ Common misconceptions
- ✅ Assessment questions
- ✅ Key learning points

**Runs in parallel with Visual Director**

### Stage 2B: Visual Director Agent

**Responsibility**: Map content to UI components

**Component Decision Matrix**:

| Content Type | Best Component | Alternative |
|--------------|----------------|-------------|
| Abstract concepts | CardGrid | Flashcard |
| Comparisons | CardGrid | FlashcardGrid |
| Processes/Sequences | Timeline | Markdown |
| Code examples | CodePlayground | Markdown |
| Definitions | Flashcard | Markdown |
| Practice | Flashcard/Cloze | FlashcardGrid |
| Historical | Timeline | Markdown |

**Runs in parallel with Content Expert**

### Stage 3: Assembler & Validator

**Responsibility**: Merge and validate

**Process**:
1. Combine content from Content Expert with visual mappings from Visual Director
2. Transform to frontend-compatible JSON schema
3. Validate with Pydantic
4. Run quality checks
5. Export final schema

## 🔌 API Endpoints

### POST /generate

Generate educational content.

**Request**:
```json
{
  "topic": "Transformer Architecture",
  "target_audience": "ML engineers",
  "difficulty": "intermediate",
  "user_intent": "Focus on attention mechanisms",
  "max_sections": 6,
  "include_interactive": true
}
```

**Response**:
```json
{
  "success": true,
  "page_schema": { ... },
  "generation_time_seconds": 45.2,
  "tokens_used": 8500,
  "warnings": []
}
```

### POST /generate/stream

Generate content with streaming progress updates (Server-Sent Events).

### GET /tasks

List recent generation tasks.

### GET /health

Health check endpoint.

## 🧪 Testing

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_pipeline.py

# Run with coverage
pytest --cov=agents --cov=workflows --cov=api
```

## 🔧 Configuration

### Environment Variables

#### Required (choose one)

| Variable | Description | Example |
|----------|-------------|---------|
| `GLM_API_KEY` | GLM (智谱) API key | `your-glm-key` |
| `LLM_API_KEY` | Generic OpenAI-compatible API key | `your-api-key` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |

#### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `GLM_BASE_URL` | `https://open.bigmodel.cn/api/paas/v4/` | GLM API endpoint |
| `LLM_BASE_URL` | - | Custom API base URL |
| `LLM_MODEL` | Provider default | Model name |
| `LLM_TEMPERATURE` | `0.3` | Generation temperature |
| `LLM_MAX_TOKENS` | `4096` | Max output tokens |
| `MAX_CONCURRENT_GENERATIONS` | `5` | Max parallel jobs |

### Supported LLM Providers

| Provider | Models | Best For |
|----------|--------|----------|
| **GLM (智谱)** | `glm-4-flash`, `glm-4-plus`, `glm-4` | Chinese content (推荐) |
| **SiliconFlow** | `deepseek-ai/DeepSeek-V3`, `Qwen/Qwen2.5-72B-Instruct` | Chinese optimization |
| **OpenAI** | `gpt-4o`, `gpt-4-turbo`, `gpt-3.5-turbo` | General purpose |
| **Azure OpenAI** | `gpt-4o` | Enterprise |

**See [GLM_CONFIG.md](GLM_CONFIG.md) or [OPENAI_CONFIG.md](OPENAI_CONFIG.md) for detailed setup.**

## 🎨 Frontend Integration

The generated schema is compatible with the frontend's SchemaRenderer:

```typescript
// Frontend usage
import { SchemaRenderer } from './renderer/SchemaRenderer';

function GeneratedPage({ pageId }) {
  return <SchemaRenderer pageId={pageId} />;
}
```

Place the generated JSON in `/public/pages/{page_id}.json`

## 📊 Monitoring & Observability

### LangSmith Tracing

Enable LangSmith for detailed tracing:

```bash
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=your-langsmith-key
export LANGCHAIN_PROJECT=content-generation
```

### Logging

Logs are printed to console with structured formatting:

```
🏗️  STAGE 1: PLANNER AGENT
✅ Generated 4 sections with 12 total nodes

📚 STAGE 2A: CONTENT EXPERT AGENT
✅ Generated 12 content blocks

🎨 STAGE 2B: VISUAL DIRECTOR AGENT
✅ Mapped 12 nodes to components
📊 Component Summary:
  CardGrid: 4
  Markdown: 3
  Timeline: 2
  Flashcard: 2
  CodePlayground: 1

🔧 STAGE 3: ASSEMBLER & VALIDATOR
✅ Built schema with 4 sections, 12 blocks
```

## 🔧 Troubleshooting

### Import Errors

**Issue**: `ModuleNotFoundError: No module named 'langgraph.checkpoint.sqlite'`

**Solution**: This has been fixed! Make sure you have the latest version of the code. The pipeline no longer uses SQLite checkpointing by default.

```bash
# Test imports
python test_imports.py
```

### API Key Errors

**Issue**: `LLM_API_KEY not found` or `GLM_API_KEY not found`

**Solution**: Set the environment variable:

```bash
# GLM (推荐)
export GLM_API_KEY="your-glm-key"

# SiliconFlow
export LLM_API_KEY="your-siliconflow-key"
export LLM_BASE_URL="https://api.siliconflow.cn/v1"

# OpenAI
export OPENAI_API_KEY="your-openai-key"

# Or create a .env file
cat > .env << 'EOF'
GLM_API_KEY=your-glm-key
GLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4/
GLM_MODEL=glm-4-flash
EOF
```

**Use the configuration helper for guided setup:**
```bash
python setup_llm.py
```

### Dependency Issues

**Issue**: Package conflicts or missing dependencies

**Solution**: Reinstall dependencies:

```bash
pip install -r requirements.txt --upgrade
```

### Common Issues

| Problem | Solution |
|---------|----------|
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` |
| Pipeline not initializing | Check API key is set |
| Generated content is empty | Check LLM API credits |
| JSON validation errors | Check input format |

### Debug Mode

Enable detailed logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 🤝 Contributing

1. Add new agent types in `agents/`
2. Extend schema in `models/schemas.py`
3. Update workflow in `workflows/pipeline.py`
4. Add tests in `tests/`

## 📚 Additional Documentation

- **[GLM_CONFIG.md](GLM_CONFIG.md)** - GLM (智谱) API setup guide
- **[OPENAI_CONFIG.md](OPENAI_CONFIG.md)** - Complete OpenAI-compatible API guide
- **[OPENAI_MIGRATION.md](OPENAI_MIGRATION.md)** - Migration notes and updates
- **[setup_llm.py](setup_llm.py)** - Interactive configuration helper

## 📝 License

MIT

## 🙏 Acknowledgments

- Built with [LangGraph](https://github.com/langchain-ai/langgraph)
- Supports multiple LLM providers: GLM, SiliconFlow, OpenAI, Azure
- Inspired by educational design principles and Paper2Slides

---

**Questions?** Open an issue or contact the maintainers.
