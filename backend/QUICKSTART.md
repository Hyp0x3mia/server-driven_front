# 快速开始指南

## ✅ 导入问题已解决！

LangGraph checkpoint 模块的导入错误已修复。现在代码可以正常运行了。

## 🚀 快速开始

### 1. 安装依赖（如果还没安装）

```bash
cd backend
pip install -r requirements.txt
```

### 2. 设置环境变量

```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

### 3. 测试导入

```bash
python test_imports.py
```

应该看到：
```
✅ 所有导入测试通过！
✅ 所有测试通过！代码可以正常运行。
```

### 4. 运行完整示例

```bash
python example_knowledge_path.py
```

这将演示如何使用你的知识路径数据生成完整的教育页面。

### 5. 启动 API 服务器

```bash
python api/main.py
```

然后访问 http://localhost:8000/docs 查看 API 文档。

## 📝 使用你的知识路径数据

在你的前端项目中：

```javascript
// 导入你的知识路径
const knowledgePath = require('./data/nlp-knowledge-path.json');

// 调用后端生成内容
async function generateContent() {
  const response = await fetch('http://localhost:8000/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      knowledge_path: knowledgePath,
      page_id: 'nlp-introduction',
      target_audience: 'AI 初学者'
    })
  });

  const result = await response.json();

  if (result.success) {
    // 保存生成的页面
    saveAsFile(
      JSON.stringify(result.page_schema, null, 2),
      'public/pages/nlp-introduction.json'
    );
  }
}

generateContent();
```

## 🔍 调试

如果遇到问题：

1. **检查依赖安装**：
   ```bash
   pip list | grep langgraph
   pip list | grep langchain
   ```

2. **检查环境变量**：
   ```bash
   echo $ANTHROPIC_API_KEY
   ```

3. **查看详细日志**：
   ```bash
   python test_imports.py
   ```

## 📚 相关文档

- **[KNOWLEDGE_PATH_GUIDE.md](KNOWLEDGE_PATH_GUIDE.md)** - 完整使用指南
- **[CONTENT_GENERATION_STRATEGY.md](CONTENT_GENERATION_STRATEGY.md)** - 叙述化方法说明
- **[README.md](README.md)** - 主文档
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - 架构详解

## ✨ 主要特性

1. ✅ **支持你的知识路径格式**
2. ✅ **完整的元数据保留**
3. ✅ **叙述化上下文生成**（Paper2Slides 方法）
4. ✅ **智能组件选择**
5. ✅ **前端兼容输出**

## 🎉 开始使用！

所有代码已经准备就绪，可以开始生成了！

```bash
# 测试
python test_imports.py

# 运行示例
python example_knowledge_path.py

# 启动 API
python api/main.py
```
