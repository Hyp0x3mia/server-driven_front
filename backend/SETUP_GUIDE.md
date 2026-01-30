# Installation & Setup Guide

Complete guide to setting up and running the Multi-Agent Content Generation Pipeline.

## 📋 Prerequisites

- Python 3.10 or higher
- pip or poetry
- Anthropic API key ([Get one here](https://www.anthropic.com/))

## 🔧 Installation

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Create Virtual Environment (Recommended)

```bash
# Using venv
python -m venv venv

# Activate on macOS/Linux
source venv/bin/activate

# Activate on Windows
venv\Scripts\activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

Or using poetry:

```bash
poetry install
```

### Step 4: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```bash
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
MODEL_NAME=claude-sonnet-4-20250514
CHECKPOINT_PATH=./checkpoints
```

### Step 5: Create Checkpoints Directory

```bash
mkdir -p checkpoints
```

## 🚀 Running the Pipeline

### Option 1: Python Script

```bash
python example_usage.py
```

### Option 2: API Server

```bash
python api/main.py
```

The API will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

### Option 3: Interactive Python

```python
from workflows.pipeline import quick_generate

response = quick_generate(
    topic="Machine Learning Basics",
    target_audience="Beginners"
)

if response.success:
    print("Generated successfully!")
    print(f"Time: {response.generation_time_seconds:.2f}s")
```

## 🧪 Testing

### Run All Tests

```bash
pytest
```

### Run with Coverage

```bash
pytest --cov=agents --cov=workflows --cov=api
```

### Run Specific Test

```bash
pytest tests/test_planner.py
```

## 📡 API Usage

### Start the Server

```bash
uvicorn api.main:app --reload --port 8000
```

### Generate Content (cURL)

```bash
curl -X POST "http://localhost:8000/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Transformer Architecture",
    "target_audience": "ML Engineers",
    "difficulty": "intermediate"
  }'
```

### Generate Content (Python)

```python
import requests

response = requests.post(
    "http://localhost:8000/generate",
    json={
        "topic": "Transformer Architecture",
        "target_audience": "ML Engineers",
        "difficulty": "intermediate"
    }
)

result = response.json()
print(result)
```

### Stream Generation (Server-Sent Events)

```bash
curl -N -X POST "http://localhost:8000/generate/stream" \
  -H "Content-Type: application/json" \
  -d '{"topic": "React Hooks"}'
```

## 🔍 Troubleshooting

### Issue: ModuleNotFoundError

**Solution**: Make sure you're in the backend directory and have installed dependencies.

```bash
cd backend
pip install -r requirements.txt
```

### Issue: ANTHROPIC_API_KEY not found

**Solution**: Set the environment variable or create `.env` file.

```bash
export ANTHROPIC_API_KEY='your-key-here'
```

### Issue: Port 8000 already in use

**Solution**: Use a different port.

```bash
uvicorn api.main:app --port 8001
```

### Issue: LangGraph checkpoint errors

**Solution**: Ensure checkpoints directory exists and is writable.

```bash
mkdir -p checkpoints
chmod +w checkpoints
```

## 🐳 Docker (Optional)

### Build Image

```bash
docker build -t content-pipeline .
```

### Run Container

```bash
docker run -d \
  -p 8000:8000 \
  -e ANTHROPIC_API_KEY=your-key \
  -v $(pwd)/checkpoints:/app/checkpoints \
  content-pipeline
```

## 📊 Monitoring

### Enable LangSmith Tracing

```bash
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=your-langsmith-key
export LANGCHAIN_PROJECT=content-generation
```

### View Logs

```bash
# API logs
tail -f logs/api.log

# Pipeline logs
tail -f logs/pipeline.log
```

## 🔒 Security

### API Key Management

Never commit `.env` file. It's already in `.gitignore`.

For production:
- Use environment variables
- Consider using a secret manager (AWS Secrets Manager, etc.)
- Rotate keys regularly

### Rate Limiting

Configure max concurrent generations in `.env`:

```bash
MAX_CONCURRENT_GENERATIONS=5
```

## 🚀 Production Deployment

### Using Gunicorn

```bash
pip install gunicorn
gunicorn api.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

### Using Docker Compose

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    volumes:
      - ./checkpoints:/app/checkpoints
```

## 📚 Next Steps

1. Read the [README.md](README.md) for detailed architecture
2. Check [example_usage.py](example_usage.py) for code examples
3. Explore the [API documentation](http://localhost:8000/docs)
4. Integrate with your frontend using the generated schemas

## 💡 Tips

- Start with `claude-sonnet` for best quality/price balance
- Use `claude-haiku` for faster prototyping
- Checkpoint files enable resuming interrupted generations
- Monitor token usage to manage costs
- Use streaming endpoint for better UX

## 🆘 Support

- Open an issue on GitHub
- Check existing issues
- Read the docs at `/docs` endpoint when API is running

---

Happy generating! 🎉
