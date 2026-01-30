# ✅ 已更新为 OpenAI 兼容格式

## 🔧 主要变更

### 1. 统一的 LLM 客户端

**新增文件**: [llm/client.py](llm/client.py)

```python
# 统一的 LLM 客户端，支持所有 OpenAI 兼容 API
from llm.client import create_llm_from_env

# 自动从环境变量加载配置
llm = create_llm_from_env()
```

### 2. 更新的 Agent 文件

所有 agent 已更新为使用 OpenAI 兼容 API：

- ✅ [agents/planner.py](agents/planner.py)
- ✅ [agents/content_expert.py](agents/content_expert.py)
- ✅ [agents/visual_director.py](agents/visual_director.py)
- ✅ [agents/content_expert_enhanced.py](agents/content_expert_enhanced.py)

### 3. 更新的依赖

**requirements.txt** 已更新：
- ❌ 移除 `langchain-anthropic`
- ❌ 移除 `anthropic`
- ✅ 添加 `langchain-openai>=0.2.0`

## 🚀 快速开始

### 方式 1: 环境变量（推荐）

```bash
# GLM (推荐用于中文)
export GLM_API_KEY="your-glm-api-key"
export GLM_BASE_URL="https://open.bigmodel.cn/api/paas/v4/"
export GLM_MODEL="glm-4-flash"

# SiliconFlow
export LLM_API_KEY="your-api-key"
export LLM_BASE_URL="https://api.siliconflow.cn/v1"
export LLM_MODEL="deepseek-ai/DeepSeek-V3"

# 或使用 OpenAI 标准变量
export OPENAI_API_KEY="your-openai-key"
export OPENAI_BASE_URL="https://api.openai.com/v1"
```

### 方式 2: .env 文件

```bash
# GLM
cat > .env << 'EOF'
GLM_API_KEY=your-glm-api-key
GLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4/
GLM_MODEL=glm-4-flash
EOF

# SiliconFlow
cat > .env << 'EOF'
LLM_API_KEY=your-siliconflow-key
LLM_BASE_URL=https://api.siliconflow.cn/v1
LLM_MODEL=deepseek-ai/DeepSeek-V3
EOF

# 或 OpenAI
cat > .env << 'EOF'
OPENAI_API_KEY=your-openai-key
OPENAI_BASE_URL=https://api.openai.com/v1
EOF
```

## 🔍 验证配置

```bash
# 1. 安装/更新依赖
pip install -r requirements.txt

# 2. 测试配置
python test_imports.py

# 3. 测试 LLM 连接
python setup_llm.py
# 选择 3 - 测试当前配置
```

## 📁 新增文件

```
backend/
├── llm/
│   ├── __init__.py
│   └── client.py              # 统一的 LLM 客户端 ⭐
├── OPENAI_CONFIG.md           # OpenAI 配置指南 ⭐
└── setup_llm.py               # 配置助手 ⭐
```

## 🎯 支持的 API

| 服务商 | Base URL | 推荐模型 | 说明 |
|--------|-----------|---------|------|
| **GLM (智谱)** | `https://open.bigmodel.cn/api/paas/v4/` | `glm-4-flash` | 推荐用于中文 |
| **SiliconFlow** | `https://api.siliconflow.cn/v1` | `deepseek-ai/DeepSeek-V3` | 中文优化 |
| **OpenAI** | `https://api.openai.com/v1` | `gpt-4o` | 官方 API |
| **Azure OpenAI** | `https://your-resource.openai.azure.com/` | `gpt-4o` | Azure 版 |

## 💡 配置示例

### GLM（中文推荐）

```bash
GLM_API_KEY=your-glm-api-key
GLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4/
GLM_MODEL=glm-4-flash
LLM_TEMPERATURE=0.3
```

### SiliconFlow（中文优化）

```bash
LLM_API_KEY=sk-xxxxxxxxxxxxx
LLM_BASE_URL=https://api.siliconflow.cn/v1
LLM_MODEL=deepseek-ai/DeepSeek-V3
LLM_TEMPERATURE=0.3
```

### OpenAI（通用）

```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
OPENAI_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o
```

### 自定义服务

任何 OpenAI 兼容的 API：

```bash
LLM_API_KEY=your-key
LLM_BASE_URL=https://your-api.com/v1
LLM_MODEL=your-model
```

## 📊 代码对比

### 之前（Anthropic）

```python
from langchain_anthropic import ChatAnthropic

llm = ChatAnthropic(
    model_name="claude-sonnet-4-20250514",
    temperature=0.3
)
```

### 现在（OpenAI 兼容）

```python
from llm.client import create_llm_from_env

llm = create_llm_from_env()
# 自动从环境变量加载配置
# 支持 OpenAI、SiliconFlow、Azure 等
```

## 🎉 主要优势

1. **灵活性** - 轻松切换不同的 API 提供商
2. **兼容性** - 标准的 OpenAI 格式
3. **简单性** - 只需设置 3 个环境变量
4. **成本优化** - 选择性价比最高的服务
5. **中文支持** - GLM 和 SiliconFlow 对中文优化
6. **国产支持** - GLM 是智谱 AI 的国产大模型

## 📚 相关文档

- **[OPENAI_CONFIG.md](OPENAI_CONFIG.md)** - 详细配置指南
- **[llm/client.py](llm/client.py)** - LLM 客户端实现
- **[setup_llm.py](setup_llm.py)** - 配置助手
- **[.env.example](.env.example)** - 环境变量模板

## 🚀 立即开始

```bash
cd backend

# 1. 配置 API（选择一种方式）
# GLM (推荐用于中文)
export GLM_API_KEY="your-glm-key"
export GLM_BASE_URL="https://open.bigmodel.cn/api/paas/v4/"
export GLM_MODEL="glm-4-flash"

# SiliconFlow
export LLM_API_KEY="your-key"
export LLM_BASE_URL="https://api.siliconflow.cn/v1"
export LLM_MODEL="deepseek-ai/DeepSeek-V3"

# 或使用配置助手
python setup_llm.py

# 2. 安装依赖（如果需要）
pip install -r requirements.txt

# 3. 测试
python test_imports.py

# 4. 运行示例
python example_knowledge_path.py
```

## ✨ 完全兼容

- ✅ 保留所有原有功能
- ✅ 支持你的知识路径格式
- ✅ 叙述化上下文生成
- ✅ 智能组件选择
- ✅ 前端兼容输出

现在可以使用任何 OpenAI 兼容的 API 了！🎉
