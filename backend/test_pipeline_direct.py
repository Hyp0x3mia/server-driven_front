#!/usr/bin/env python3
"""
直接测试 pipeline.run_streaming() 方法，不通过 HTTP
这样可以清楚地看到事件是否真的在流式发送
"""

import sys
import os
import time

# 添加路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from workflows.pipeline import create_pipeline
from models.schemas import GenerationRequest, DifficultyLevel

def test_streaming():
    print("="*80)
    print("🧪 直接测试 pipeline.run_streaming()")
    print("="*80)
    print()

    # 创建请求
    request = GenerationRequest(
        topic="流式传输测试",
        target_audience="开发者测试",
        difficulty=DifficultyLevel.INTERMEDIATE,
        max_sections=2  # 只生成2个section以加快测试
    )

    print(f"📝 请求参数:")
    print(f"   Topic: {request.topic}")
    print(f"   Audience: {request.target_audience}")
    print(f"   Difficulty: {request.difficulty}")
    print(f"   Max Sections: {request.max_sections}")
    print()

    # 创建 pipeline
    print("🔧 创建 pipeline...")
    pipeline = create_pipeline()

    print("🚀 开始流式生成...")
    print("="*80)
    print()

    start_time = time.time()
    event_times = []
    block_events = []

    try:
        for event in pipeline.run_streaming(request):
            elapsed = time.time() - start_time
            event_type = event.type.value
            stage = event.stage or ""

            event_times.append({
                'type': event_type,
                'stage': stage,
                'elapsed': elapsed
            })

            # 打印事件
            if event_type == 'block_ready':
                block_info = event.data or {}
                block_type = block_info.get('block', {}).get('type', 'unknown')
                block_index = block_info.get('index', '?')
                progress = block_info.get('progress', '')
                block_events.append({
                    'index': block_index,
                    'type': block_type,
                    'elapsed': elapsed,
                    'progress': progress
                })
                print(f"📦 [{elapsed:6.1f}s] Block #{block_index + 1}: {block_type:20} ({progress})")
            else:
                print(f"📨 [{elapsed:6.1f}s] {event_type:20} {stage:20}")

    except Exception as e:
        print(f"\n❌ 错误: {e}")
        import traceback
        traceback.print_exc()
        return

    total_time = time.time() - start_time

    print()
    print("="*80)
    print("📊 分析")
    print("="*80)
    print(f"总时间: {total_time:.1f}s")
    print(f"总事件数: {len(event_times)}")
    print(f"Block事件数: {len(block_events)}")
    print()

    if len(block_events) > 1:
        print("🔍 Block事件时间线:")
        print("-" * 80)
        for i, block in enumerate(block_events):
            if i == 0:
                gap = 0
            else:
                gap = block['elapsed'] - block_events[i-1]['elapsed']
            print(f"  Block #{block['index'] + 1:2} | {block['type']:20} | {block['elapsed']:6.1f}s | 间隔: {gap:5.1f}s")

        # 计算平均间隔
        if len(block_events) > 2:
            gaps = [block_events[i]['elapsed'] - block_events[i-1]['elapsed']
                   for i in range(1, len(block_events))]
            avg_gap = sum(gaps) / len(gaps)
            print()
            print(f"  平均间隔: {avg_gap:.1f}s")

            if avg_gap > 0.1:
                print("  ✅ Block事件似乎是流式发送的（间隔 > 0.1s）")
            else:
                print("  ⚠️  Block事件可能被批处理了（间隔太小）")

    print()
    print("="*80)

if __name__ == "__main__":
    test_streaming()
