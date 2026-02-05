#!/bin/bash

# 重新生成 ai_002 到 ai_010 的所有内容
# 使用新注册的组件 (DeepDiveZigZag, SplitPaneLab)
# 预计用时: 约 20-25 分钟

echo "🚀 开始重新生成 ai_002 到 ai_010..."
echo "📝 这将使用所有 10 种组件类型，包括新的 DeepDiveZigZag 和 SplitPaneLab"
echo ""
echo "⏱️  预计用时: 约 20-25 分钟"
echo "────────────────────────────────────"
echo ""

# 切换到 backend 目录
cd /Users/hyp0x3mia/BUPT_Master/Master/2025/教育/nocode/backend

# 运行验证脚本
python3 verify_ai_evaluation.py

echo ""
echo "────────────────────────────────────"
echo "✅ 生成完成！"
echo ""
echo "📂 查看生成的内容:"
echo "   ls public/pages/"
echo ""
echo "🌐 在浏览器中查看:"
echo "   http://localhost:8080/"
echo ""
echo "📄 各主题页面:"
for i in {002..010}; do
    echo "   http://localhost:8080/#/page?file=pages/ai_$i.json"
done
