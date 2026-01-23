# 🚀 Human-in-the-Loop 功能 - 快速开始

## ✅ 已修复

错误 `cn is not defined` 已修复！现在可以正常使用了。

---

## 🎯 立即体验

### 1. 生成测试页面

在浏览器控制台运行：

```javascript
// 用少量知识点生成测试页面
const data = await llm.generateFromPath({
  knowledge_path: knowledgePath.slice(0, 3),  // 只用前 3 个
  style: 'comprehensive'
})

// 保存到 LocalStorage
localStorage.setItem('pages/hil-test.json', JSON.stringify(data))

console.log('✅ 测试页面已生成')
console.log('访问: http://localhost:8080/#/page/hil-test')
```

### 2. 开启编辑模式

访问页面后，点击**右上角**的开关：

```
┌─────────────────────────┐
│  EDIT MODE    [●────]   │  ← 点击这里
└─────────────────────────┘
```

### 3. 悬停在任何 Block 上

工具栏会自动显示：

```
[Monitor] [Activity] [Box] │ [AI 重写] │ [Edit] [Delete]
```

### 4. 尝试各种功能

#### A. 切换视觉模式
- 点击三个图标切换 **terminal** / **schematic** / **icon** 模式
- 适合 CardGrid 组件

#### B. AI 重写内容
- 点击 "AI 重写"
- 输入指令（例如："让内容更简洁"）
- 等待 AI 优化完成

#### C. 查看 JSON
- 点击编辑按钮
- 查看当前 block 的 JSON 数据

#### D. 删除 Block
- 点击删除按钮
- 确认后删除

---

## 🎬 功能演示

### 演示 1: 快速切换视觉风格

```
1. 开启编辑模式
2. 悬停在 CardGrid 上
3. 点击 [Box] → 切换到图标模式
4. 点击 [Monitor] → 切换到终端模式
5. 实时看到效果变化！
```

### 演示 2: AI 优化内容

```
1. 开启编辑模式
2. 悬停在 Markdown block 上
3. 点击 "AI 重写"
4. 输入："让内容更简洁，去掉冗余的解释"
5. 等待 10-30 秒
6. 内容自动更新！
```

### 演示 3: 调整页面结构

```
1. 开启编辑模式
2. 删除不需要的 blocks
3. 调整剩余 blocks 的视觉模式
4. 所有更改自动保存
5. 刷新页面后依然保留
```

---

## 💡 使用技巧

### 最佳实践

1. **视觉模式选择**
   - 代码内容 → Monitor (terminal)
   - 架构原理 → Activity (schematic)
   - 概念定义 → Box (icon)

2. **AI 优化指令**
   - ✅ "让内容更简洁"
   - ✅ "添加 2 个实际案例"
   - ✅ "转换为代码风格"
   - ❌ "改变类型" (type 不应该变)

3. **数据管理**
   - 所有更改自动保存到 LocalStorage
   - 刷新页面后依然保留
   - 可以导出为 JSON 文件长期保存

### 常见问题

**Q: 编辑模式开关不显示？**
- 确保页面已加载完成
- 检查是否有其他 UI 遮挡

**Q: AI 重写失败？**
- 检查控制台错误信息
- 确保 LLM API 已配置
- 查看网络连接

**Q: 视觉模式切换无效？**
- 该组件可能不支持 visual_mode
- 只有 CardGrid 等组件才有此功能

---

## 🔍 技术细节

### 文件结构

```
src/
├── components/
│   └── editor/
│       └── EditableBlock.tsx          ← 编辑包装器
├── renderer/
│   └── SchemaRenderer.tsx             ← 页面渲染器
├── lib/
│   ├── path-based-generator.ts        ← AI 重写方法
│   └── llm-helper.ts                  ← API 暴露
└── lib/
    └── utils.js                       ← cn 工具函数
```

### 数据流

```
用户操作
   ↓
EditableBlock 触发回调
   ↓
SchemaRenderer 处理
   ↓
更新 LocalStorage
   ↓
触发重新渲染
   ↓
显示新内容
```

---

## 📚 完整文档

详细功能说明：[HUMAN_IN_LOOP_FEATURE.md](HUMAN_IN_LOOP_FEATURE.md)

---

## 🎉 现在试试吧！

**所有功能已就绪，立即开始你的 "Human-in-the-Loop" 编辑之旅！** 🚀
