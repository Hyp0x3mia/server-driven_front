# GLM (智谱) API 配置指南

## 🎯 为什么选择 GLM?

GLM (智谱) 是智谱 AI 的国产大模型，特别适合中文内容生成：

- ✅ **中文优化** - 专门针对中文场景优化
- ✅ **性价比高** - 价格相对较低
- ✅ **响应快速** - glm-4-flash 模型响应速度快
- ✅ **国产支持** - 符合国内数据安全要求
- ✅ **OpenAI 兼容** - 标准 OpenAI API 格式

## 🚀 快速开始

### 1. 获取 API Key

访问 [智谱AI开放平台](https://open.bigmodel.cn/)：

1. 注册账号
2. 进入控制台
3. 创建 API Key
4. 复制你的 API Key

### 2. 配置环境变量

#### 方式 1: 使用 GLM 专用环境变量（推荐）

```bash
export GLM_API_KEY="your-glm-api-key"
export GLM_BASE_URL="https://open.bigmodel.cn/api/paas/v4/"
export GLM_MODEL="glm-4-flash"
```

#### 方式 2: 使用通用环境变量

```bash
export LLM_API_KEY="your-glm-api-key"
export LLM_BASE_URL="https://open.bigmodel.cn/api/paas/v4/"
export LLM_MODEL="glm-4-flash"
```

#### 方式 3: 创建 .env 文件

```bash
cat > .env << 'EOF'
# GLM (智谱) 配置
GLM_API_KEY=your-glm-api-key
GLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4/
GLM_MODEL=glm-4-flash
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=4096
EOF
```

### 3. 验证配置

```bash
# 测试导入
python test_imports.py

# 或使用配置助手
python setup_llm.py
# 选择 1 - 查看 GLM 配置指南
```

## 📊 可用模型

| 模型 | 特点 | 推荐场景 |
|------|------|----------|
| **glm-4-flash** | 快速经济 | 日常使用（推荐） |
| **glm-4-plus** | 更高质量 | 复杂任务 |
| **glm-4** | 最新模型 | 追求最佳效果 |
| **glm-3-turbo** | 最经济 | 简单任务 |

### 推荐配置

```bash
# 快速响应（推荐）
GLM_MODEL=glm-4-flash

# 更高质量
GLM_MODEL=glm-4-plus

# 最佳效果
GLM_MODEL=glm-4
```

## 💻 使用示例

### Python SDK

```python
from llm.client import LLMConfig, create_llm

# 方式 1: 从环境变量加载（推荐）
llm = create_llm_from_env()

# 方式 2: 显式配置
config = LLMConfig(
    provider="glm",
    api_key="your-glm-api-key",
    base_url="https://open.bigmodel.cn/api/paas/v4/",
    model="glm-4-flash",
    temperature=0.3
)
llm = create_llm(config)

# 使用
response = llm.invoke("你好，请介绍一下自然语言处理")
print(response.content)
```

### 运行完整示例

```bash
# 确保设置了环境变量
export GLM_API_KEY="your-glm-api-key"

# 运行知识路径生成示例
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
echo $GLM_API_KEY  # 应该显示你的 key
```

### 问题 2: Base URL 错误

```bash
❌ Error: Connection refused
```

**解决**：确保 Base URL 正确
```bash
echo $GLM_BASE_URL  # 应该是 https://open.bigmodel.cn/api/paas/v4/
```

**注意**：末尾必须有 `/`

### 问题 3: 模型不存在

```bash
❌ Error: Model not found
```

**解决**：检查模型名称
- ✅ 正确: `glm-4-flash`
- ❌ 错误: `glm4-flash` 或 `glm_4_flash`

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
- **[OPENAI_CONFIG.md](OPENAI_CONFIG.md)** - 通用配置指南
- **[setup_llm.py](setup_llm.py)** - 配置助手
- **[智谱AI官方文档](https://open.bigmodel.cn/dev/api)**

## 🎉 主要优势

1. **中文优化** - 专门针对中文场景优化
2. **性价比高** - 价格相对较低
3. **响应快速** - glm-4-flash 模型响应速度快
4. **国产支持** - 符合国内数据安全要求
5. **易于使用** - 标准 OpenAI 兼容格式

## 🔗 快速链接

- **注册地址**: https://open.bigmodel.cn/
- **控制台**: https://open.bigmodel.cn/usercenter/apikeys
- **官方文档**: https://open.bigmodel.cn/dev/api
- **价格说明**: https://open.bigmodel.cn/pricing

## 🚀 立即开始

```bash
cd backend

# 1. 设置环境变量
export GLM_API_KEY="your-glm-api-key"
export GLM_BASE_URL="https://open.bigmodel.cn/api/paas/v4/"
export GLM_MODEL="glm-4-flash"

# 2. 测试配置
python test_imports.py

# 3. 运行示例
python example_knowledge_path.py

# 4. 启动 API 服务器
python api/main.py
```

开始使用 GLM 生成高质量中文内容吧！🎉
