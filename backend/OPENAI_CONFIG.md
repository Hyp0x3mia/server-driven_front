# OpenAI 兼容 API 配置指南

## ✅ 已更新为 OpenAI 兼容格式

系统现在支持任何 OpenAI 兼容的 API：

- ✅ **GLM (智谱)** - 推荐用于中文内容
- ✅ **SiliconFlow** - 中文优化
- ✅ **OpenAI** (官方)
- ✅ **Azure OpenAI**
- ✅ **任何其他 OpenAI 兼容的 API**

## 🔧 配置方式

### 方式 1: 环境变量（推荐）

```bash
# 创建 .env 文件
cat > .env << 'EOF'
# 基础配置
LLM_API_KEY=your-api-key-here
LLM_BASE_URL=https://api.siliconflow.cn/v1
LLM_MODEL=deepseek-ai/DeepSeek-V3

# 可选参数
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=4096
EOF
```

### 方式 2: 使用 GLM 专用环境变量

```bash
# GLM (智谱)
export GLM_API_KEY="your-glm-key"
export GLM_BASE_URL="https://open.bigmodel.cn/api/paas/v4/"
export GLM_MODEL="glm-4-flash"
```

### 方式 3: 直接使用 OpenAI 标准变量

```bash
# OpenAI
export OPENAI_API_KEY="sk-..."
export OPENAI_BASE_URL="https://api.openai.com/v1"

# SiliconFlow
export OPENAI_API_KEY="sk-..."
export OPENAI_BASE_URL="https://api.siliconflow.cn/v1"
```

## 📊 支持的服务商

### GLM (智谱) - 推荐用于中文

```bash
GLM_API_KEY=your-glm-api-key
GLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4/
GLM_MODEL=glm-4-flash
```

**推荐模型**：
- `glm-4-flash` - 快速经济（推荐）
- `glm-4-plus` - 更高质量
- `glm-4` - 最新模型

**获取 API Key**: https://open.bigmodel.cn/

### SiliconFlow（中文优化）

```bash
LLM_API_KEY=sk-xxxxxxxxxxxxx
LLM_BASE_URL=https://api.siliconflow.cn/v1
LLM_MODEL=deepseek-ai/DeepSeek-V3
```

**推荐模型**：
- `deepseek-ai/DeepSeek-V3` - 通用性能强
- `Qwen/Qwen2.5-72B-Instruct` - 中文优化

### OpenAI 官方

```bash
LLM_API_KEY=sk-xxxxxxxxxxxxx
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o
```

**可用模型**：
- `gpt-4o` - 最新，多模态
- `gpt-4-turbo` - 快速经济
- `gpt-3.5-turbo` - 最便宜

### Azure OpenAI

```bash
LLM_API_KEY=your-azure-key
LLM_BASE_URL=https://your-resource.openai.azure.com/
LLM_MODEL=gpt-4o
```

## 🚀 使用示例

### Python SDK

```python
from llm.client import LLMConfig, create_llm

# 方式 1: 从环境变量加载（推荐）
llm = create_llm_from_env()

# 方式 2: 显式配置
config = LLMConfig(
    provider="custom",
    api_key="your-key",
    base_url="https://api.siliconflow.cn/v1",
    model="deepseek-ai/DeepSeek-V3"
)
llm = create_llm(config)

# 使用
response = llm.invoke("Hello, world!")
print(response.content)
```

### API 调用

```bash
# 确保设置了环境变量
export LLM_API_KEY="your-key"
export LLM_BASE_URL="https://api.siliconflow.cn/v1"

# 启动 API 服务器
python api/main.py
```

## 🔍 验证配置

```bash
# 测试配置
python -c "
from llm.client import create_llm_from_env
llm = create_llm_from_env()
print('✅ LLM 配置成功')
print(f'Model: {llm.model_name}')
"
```

## 📝 完整示例

### GLM 配置（推荐用于中文）

```bash
# 1. 设置环境变量
export GLM_API_KEY="your-glm-api-key"
export GLM_BASE_URL="https://open.bigmodel.cn/api/paas/v4/"
export GLM_MODEL="glm-4-flash"

# 2. 运行测试
python test_imports.py

# 3. 运行示例
python example_knowledge_path.py
```

### SiliconFlow 配置

```bash
# 1. 设置环境变量
export LLM_API_KEY="sk-xxxxxxxxxxxxx"
export LLM_BASE_URL="https://api.siliconflow.cn/v1"
export LLM_MODEL="deepseek-ai/DeepSeek-V3"

# 2. 运行测试
python test_imports.py

# 3. 运行示例
python example_knowledge_path.py
```

### OpenAI 配置

```bash
# 1. 设置环境变量
export OPENAI_API_KEY="sk-xxxxxxxxxxxxx"
export OPENAI_BASE_URL="https://api.openai.com/v1"

# 2. 或者使用 .env 文件
cat > .env << 'EOF'
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
OPENAI_BASE_URL=https://api.openai.com/v1
EOF

# 3. 运行
python example_knowledge_path.py
```

## ⚙️ 高级配置

### 调整 Temperature

```bash
# 更有创造性（0.7-1.0）
LLM_TEMPERATURE=0.7

# 更确定（0.1-0.3）
LLM_TEMPERATURE=0.2
```

### 调整 Max Tokens

```bash
# 更长输出
LLM_MAX_TOKENS=8192

# 更短输出（更快，更便宜）
LLM_MAX_TOKENS=2048
```

## 🐛 故障排除

### 问题 1: API Key 无效

```bash
❌ Error: 401 Unauthorized
```

**解决**：检查 API Key 是否正确
```bash
echo $LLM_API_KEY  # 应该显示你的 key
```

### 问题 2: Base URL 错误

```bash
❌ Error: Connection refused
```

**解决**：确保 Base URL 正确
- SiliconFlow: `https://api.siliconflow.cn/v1`
- OpenAI: `https://api.openai.com/v1`
- **注意**：末尾必须有 `/v1`

### 问题 3: 模型不存在

```bash
❌ Error: Model not found
```

**解决**：检查模型名称
- SiliconFlow: 使用完整路径，如 `deepseek-ai/DeepSeek-V3`
- OpenAI: 使用短名称，如 `gpt-4o`

### 问题 4: 导入错误

```bash
❌ ModuleNotFoundError: No module named 'langchain_openai'
```

**解决**：
```bash
pip install -r requirements.txt --upgrade
```

## 📚 相关文档

- **[llm/client.py](llm/client.py)** - LLM 客户端实现
- **[.env.example](.env.example)** - 环境变量模板
- **[README.md](README.md)** - 主文档

## ✨ 主要优势

1. **灵活性** - 轻松切换不同的 API 提供商
2. **成本优化** - 选择性价比最高的服务
3. **兼容性** - 标准的 OpenAI 格式
4. **简单配置** - 只需设置 3 个环境变量

## 🎯 推荐配置

### 用于中文内容生成（GLM）

```bash
GLM_API_KEY=your-glm-api-key
GLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4/
GLM_MODEL=glm-4-flash
LLM_TEMPERATURE=0.3
```

### 用于中文内容生成（SiliconFlow）

```bash
LLM_API_KEY=your-siliconflow-key
LLM_BASE_URL=https://api.siliconflow.cn/v1
LLM_MODEL=deepseek-ai/DeepSeek-V3
LLM_TEMPERATURE=0.3
```

### 用于英文/多语言内容

```bash
LLM_API_KEY=your-openai-key
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o
LLM_TEMPERATURE=0.3
```

开始使用吧！🚀
