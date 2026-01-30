#!/bin/bash

echo "🤖 AI评测集生成进度监控"
echo "================================"
echo ""

# 检查evaluation_results目录
if [ -d "evaluation_results" ]; then
    echo "📁 已完成的主题:"
    ls -1 evaluation_results/*.json 2>/dev/null | grep -v "_latest" | grep -v "batch_results" | while read file; do
        set_id=$(basename "$file" .json)
        if [ -f "../public/pages/$set_id.json" ]; then
            echo "  ✅ $set_id - 已生成前端页面"
        else
            echo "  📄 $set_id - 已生成JSON"
        fi
    done
    
    echo ""
    echo "📊 统计:"
    generated_count=$(ls -1 evaluation_results/ai_*.json 2>/dev/null | grep -v "_latest" | grep -v "batch_results" | wc -l)
    echo "  已生成: $generated_count/10"
    
    if [ -f "evaluation_results/_latest.json" ]; then
        successful=$(python3 -c "import json; data=json.load(open('evaluation_results/_latest.json')); print(data.get('successful', 0))" 2>/dev/null || echo "?")
        echo "  成功: $successful/10"
    fi
else
    echo "⏳ 等待生成..."
fi

echo ""
echo "💡 查看实时日志:"
echo "   tail -f evaluation_results/verification_log.txt"
echo ""
echo "💡 查看后台任务:"
echo "   ps aux | grep verify_ai_evaluation"
