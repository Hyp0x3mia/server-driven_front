#!/usr/bin/env python3
"""Test script to verify progressive streaming of block events"""

import requests
import json
import time

def test_streaming():
    print("🧪 Testing streaming API...")
    print("="*60)

    url = "http://localhost:8000/generate/stream"
    payload = {
        "topic": "流式传输测试",
        "target_audience": "开发者",
        "difficulty": "intermediate",
        "max_sections": 2
    }

    print(f"📡 Sending request to {url}")
    print(f"   Topic: {payload['topic']}")
    print(f"   Max sections: {payload['max_sections']}")
    print()

    event_times = []
    block_events = []

    try:
        with requests.post(url, json=payload, stream=True, timeout=300) as response:
            if response.status_code != 200:
                print(f"❌ Error: HTTP {response.status_code}")
                return

            print("✅ Connection established, receiving events...\n")

            start_time = time.time()
            buffer = ""

            for line in response.iter_lines():
                if not line:
                    continue

                line_str = line.decode('utf-8')
                buffer += line_str + "\n"

                # SSE events are separated by double newlines
                if "\n\n" in buffer:
                    events_text = buffer.split("\n\n")
                    buffer = events_text.pop()  # Keep incomplete part in buffer

                    for event_text in events_text:
                        if not event_text.strip():
                            continue

                        # Parse SSE event
                        event_data = None
                        for event_line in event_text.split('\n'):
                            if event_line.startswith('data: '):
                                try:
                                    event_data = json.loads(event_line[6:])
                                except:
                                    pass

                        if event_data:
                            elapsed = time.time() - start_time
                            event_type = event_data.get('type', 'unknown')
                            stage = event_data.get('stage', '')
                            timestamp = event_data['timestamp']

                            event_times.append({
                                'type': event_type,
                                'stage': stage,
                                'elapsed': elapsed,
                                'timestamp': timestamp
                            })

                            if event_type == 'block_ready':
                                block_info = event_data.get('data', {})
                                block_events.append({
                                    'index': block_info.get('index', '?'),
                                    'type': block_info.get('block', {}).get('type', 'unknown'),
                                    'elapsed': elapsed,
                                    'progress': block_info.get('progress', '')
                                })
                                print(f"📦 Block {block_info.get('index', '?') + 1}: {block_info.get('block', {}).get('type', 'unknown')} at {elapsed:.1f}s")
                            elif event_type in ['stage_start', 'stage_complete', 'skeleton_ready', 'complete']:
                                print(f"📨 {event_type:20} {stage:20} at {elapsed:.1f}s")

            total_time = time.time() - start_time

            print("\n" + "="*60)
            print("📊 ANALYSIS")
            print("="*60)
            print(f"Total time: {total_time:.1f}s")
            print(f"Total events: {len(event_times)}")
            print(f"Block events: {len(block_events)}")

            if len(block_events) > 1:
                print("\n🔍 Block Timing Analysis:")
                for i, block in enumerate(block_events):
                    if i == 0:
                        gap = 0
                    else:
                        gap = block['elapsed'] - block_events[i-1]['elapsed']
                    print(f"  Block {block['index']}: {block['type']:20} at {block['elapsed']:6.1f}s (gap: {gap:5.1f}s)")

                # Calculate average gap between blocks
                if len(block_events) > 2:
                    gaps = [block_events[i]['elapsed'] - block_events[i-1]['elapsed']
                           for i in range(1, len(block_events))]
                    avg_gap = sum(gaps) / len(gaps)
                    print(f"\n  Average gap between blocks: {avg_gap:.1f}s")

                    # Check if blocks are truly progressive (gaps should vary)
                    if avg_gap > 1:
                        print("  ✅ Blocks appear to be sent progressively!")
                    else:
                        print("  ⚠️  Blocks may be batched (gaps too small)")

    except requests.exceptions.Timeout:
        print("⏱️  Request timed out after 300 seconds")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_streaming()
