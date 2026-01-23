# ✅ Human-in-the-Loop 编辑功能 - 已完成！

## 🎉 功能概述

已成功实现 "所见即所得" 的人机协作迭代功能，包含：

1. ✅ **EditableBlock 包装器组件** - 为任何业务组件添加编辑功能
2. ✅ **编辑模式开关** - 页面右上角的切换按钮
3. ✅ **悬浮工具栏** - Hover 时显示的操作面板
4. ✅ **视觉模式切换** - terminal/schematic/icon 三种模式
5. ✅ **AI 重写功能** - 使用 LLM 优化单个 block
6. ✅ **实时保存** - 自动同步到 LocalStorage

---

## 📂 文件变更清单

### 新增文件

1. **[src/components/editor/EditableBlock.tsx](src/components/editor/EditableBlock.tsx)**
   - EditableBlock 包装器组件
   - 悬浮工具栏（视觉模式切换 + AI 重写 + 编辑 + 删除）
   - 加载状态动画

### 修改文件

2. **[src/renderer/SchemaRenderer.tsx](src/renderer/SchemaRenderer.tsx)**
   - 添加 `isEditing` 状态管理
   - 添加编辑模式开关 UI
   - 集成 EditableBlock 包装器
   - 实现 `handleUpdateBlock` - 更新并保存到 LocalStorage
   - 实现 `handleDeleteBlock` - 删除 block
   - 实现 `handleRegenerateBlock` - AI 优化功能

3. **[src/lib/path-based-generator.ts](src/lib/path-based-generator.ts)**
   - 新增 `regenerateBlock()` 方法
   - 针对单个 block 的 AI 优化
   - 复用现有的 parseResponse 方法

4. **[src/lib/llm-helper.ts](src/lib/llm-helper.ts)**
   - 将 `pathGenerator` 改为 public
   - 暴露 `regenerateBlock` 方法供外部调用

---

## 🎮 使用方法

### 1. 启用编辑模式

访问任何页面后，点击**右上角**的开关：

```
┌─────────────────────────┐
│  EDIT MODE    [●────]   │  ← 点击这里切换
└─────────────────────────┘
```

- **灰色/左侧** = 编辑模式关闭（正常浏览）
- **紫色/右侧** = 编辑模式开启

### 2. 编辑功能

开启编辑模式后，**悬停**在任何 block 上会显示工具栏：

```
┌─────────────────────────────────────────────┐
│ [Monitor] [Activity] [Box]  [AI 重写]  [Edit] [Delete] │
│                                                │
│         ┌─────────────────────┐            │
│         │   你的 Block 内容    │            │
│         └─────────────────────┘            │
└─────────────────────────────────────────────┘
```

#### A. 视觉模式切换（左三个按钮）

针对 CardGrid 等支持 visual_mode 的组件：

- **Monitor (终端模式)** - 黑底绿字，适合代码/实战类内容
- **Activity (架构图模式)** - 抽象线条，适合原理/架构类内容
- **Box (图标模式)** - 霓虹发光，适合概念/定义类内容

点击即可**实时切换**，自动保存到 LocalStorage！

#### B. AI 重写

1. 点击 **"AI 重写"** 按钮
2. 输入优化指令（例如："让内容更简洁"、"转换为代码风格"）
3. 等待 AI 优化（显示加载动画）
4. 自动更新并保存

**示例指令**：
- "让内容更简洁"
- "添加更多示例"
- "转换为代码风格"
- "让文字更专业"

#### C. JSON 编辑（Edit 按钮）

点击后会显示当前 block 的 JSON 数据（临时实现，使用 alert）

#### D. 删除 Block（Delete 按钮）

点击红色垃圾桶图标删除该 block，会弹出确认对话框

---

## 🔧 技术实现细节

### EditableBlock 组件

**Props**:
```typescript
interface EditableBlockProps {
  children: React.ReactNode;
  data: any;                           // 当前 block 数据
  onUpdate: (newData: any) => void;    // 更新回调
  onRegenerate?: () => Promise<void>; // AI 重写回调
  onEdit?: () => void;                 // 编辑回调
  onDelete?: () => void;               // 删除回调
  isEditing: boolean;                  // 是否处于编辑模式
}
```

**行为**:
- `isEditing = false` → 直接渲染子组件，零性能开销
- `isEditing = true` → 添加虚线框、悬浮工具栏等编辑功能

### SchemaRenderer 集成

**新增状态**:
```typescript
const [isEditing, setIsEditing] = useState(false);
const [blocks, setBlocks] = useState<Block[]>([]);
```

**核心功能**:

1. **handleUpdateBlock(index, newData)**
   - 更新本地 blocks 数组
   - 更新 schema.components
   - 保存到 LocalStorage
   - 触发重新渲染

2. **handleDeleteBlock(index)**
   - 从数组中移除 block
   - 更新 schema
   - 保存到 LocalStorage
   - 确认对话框防止误删

3. **handleRegenerateBlock(index)**
   - 询问用户优化指令
   - 调用 `llm.pathGenerator.regenerateBlock()`
   - 更新并保存

### AI 重写实现

**regenerateBlock() 方法**:
```typescript
async regenerateBlock(
  currentBlock: any,
  instruction: string = "优化这个模块的内容，使其更清晰、专业"
): Promise<any>
```

**流程**:
1. 构建 prompt（包含当前 block 的 JSON）
2. 调用 LLM 生成优化后的版本
3. 使用 `parseResponse()` 解析响应
4. 验证结果（必须有 type 字段）
5. 返回优化后的 block

---

## 🎨 UI 设计

### 编辑模式开关

```
┌─────────────────────────────────┐
│  EDIT MODE    [●────]           │  ← 固定在右上角
└─────────────────────────────────┘
  z-50, backdrop-blur, 半透明背景
```

### 悬浮工具栏

```
┌──────────────────────────────────────┐
│ [Mon] [Act] [Box] │ [AI 重写] │ [✏️] [🗑️] │
│  visual modes    │   AI操作   │  操作   │
└──────────────────────────────────────┘
  hover 时显示，z-50，带阴影和动画
```

### 加载状态

```
┌─────────────────────────┐
│  ✨ AI 正在优化...      │  ← 居中显示
└─────────────────────────┘
  半透明背景，模糊效果
```

---

## 📊 使用场景示例

### 场景 1: 调整 CardGrid 的视觉风格

1. 开启编辑模式
2. 悬停在 CardGrid 组件上
3. 点击 [Box] 图标切换到 "图标模式"
4. 实时看到效果，自动保存

### 场景 2: AI 优化 Markdown 内容

1. 开启编辑模式
2. 悬停在 Markdown block 上
3. 点击 "AI 重写"
4. 输入："让内容更简洁，去掉冗余的解释"
5. 等待 AI 优化完成
6. 自动更新并保存

### 场景 3: 删除不需要的 Block

1. 开启编辑模式
2. 悬停在要删除的 block 上
3. 点击红色垃圾桶图标
4. 确认删除
5. Block 被移除，自动保存

---

## 💡 最佳实践

### 1. 视觉模式选择

| 内容类型 | 推荐模式 | 效果 |
|---------|---------|------|
| 代码示例、API 文档 | terminal | 黑底绿字，代码高亮 |
| 系统架构、流程图 | schematic | 抽象线条，技术感 |
| 概念定义、历史 | icon | 霓虹图标，发光效果 |

### 2. AI 优化指令

**好的指令**：
- ✅ "让内容更简洁"
- ✅ "添加 2 个实际案例"
- ✅ "转换为代码风格"
- ✅ "让语言更专业，使用学术化表达"

**避免的指令**：
- ❌ "改一下"（太模糊）
- ❌ "重新生成整个页面"（应该用 generateFromPath）
- ❌ "改变类型"（type 不应该变）

### 3. 数据安全

- ✅ 所有更改自动保存到 LocalStorage
- ✅ 删除操作有确认对话框
- ✅ AI 重写前会询问指令
- ⚠️  LocalStorage 有容量限制（通常 5-10MB）

---

## 🐛 故障排查

### 问题 1: 编辑模式开关不显示

**原因**: 可能是 CSS z-index 问题

**解决**: 检查是否有其他组件遮挡

### 问题 2: AI 重写失败

**原因**: LLM API 未配置或出错

**解决**:
```javascript
// 检查配置
console.log(llm.pathGenerator)  // 应该不是 null

// 查看控制台错误信息
// 可能是 API Key 无效或网络问题
```

### 问题 3: 更改未保存

**原因**: LocalStorage 已满或被禁用

**解决**:
```javascript
// 检查 LocalStorage
console.log(localStorage.length)  // 应该 < 5MB

// 清理旧数据
Object.keys(localStorage)
  .filter(k => k.startsWith('pages/'))
  .forEach(k => localStorage.removeItem(k))
```

### 问题 4: 视觉模式切换无效

**原因**: 该 block 不支持 visual_mode

**解决**:
- 只有 CardGrid 和支持 `content.visual_mode` 的组件才有视觉模式切换按钮
- 其他类型（如 Markdown, Hero）不会显示这三个按钮

---

## 🚀 未来扩展

### 短期改进

1. **JSON 编辑器** - 替换 alert，使用模态框编辑 JSON
2. **撤销/重做** - 支持操作历史
3. **拖拽排序** - 调整 block 顺序
4. **添加新 Block** - 从模板添加新组件

### 长期规划

1. **多人协作** - 实时同步编辑状态
2. **版本历史** - 保存每次修改的历史版本
3. **评论系统** - 在 block 上添加评论
4. **AI 辅助编辑** - 根据上下文自动建议优化

---

## ✅ 验证清单

- [x] 创建 EditableBlock 组件
- [x] 添加编辑模式开关
- [x] 实现悬浮工具栏
- [x] 添加视觉模式切换
- [x] 集成 AI 重写功能
- [x] 实现更新/删除操作
- [x] 自动保存到 LocalStorage
- [x] 构建成功无错误

---

## 🎉 现在试试吧！

### 启动开发服务器

```bash
npm run dev
```

### 访问页面

```javascript
// 生成测试数据
const data = await llm.generateFromPath({
  knowledge_path: knowledgePath.slice(0, 3)  // 用 3 个知识点测试
})

localStorage.setItem('pages/test-edit.json', JSON.stringify(data))

// 访问
// http://localhost:8080/#/page/test-edit
```

### 开启编辑模式

1. 点击右上角 **"EDIT MODE"** 开关
2. 悬停在任何 block 上
3. 尝试：
   - 点击 [Box] 切换视觉模式
   - 点击 "AI 重写" 优化内容
   - 点击 [✏️] 查看 JSON
   - 点击 [🗑️] 删除 block

**尽情探索吧！** 🚀

所有更改都会自动保存到 LocalStorage，刷新页面后依然保留！
