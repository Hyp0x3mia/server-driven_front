#!/bin/bash

echo "🧪 Testing streaming API (progressive block display)"
echo "================================================================"
echo ""
echo "📡 Sending request..."
echo ""

OUTPUT_FILE="/tmp/streaming_test_output.txt"
rm -f "$OUTPUT_FILE"

# Start curl in background
curl -N -X POST http://localhost:8000/generate/stream \
  -H "Content-Type: application/json" \
  -d '{"topic": "快速测试", "target_audience": "学习者", "difficulty": "intermediate", "max_sections": 2}' \
  2>&1 | while read -r line; do
    # Print events with timestamps
    echo "[$(date '+%H:%M:%S')] $line"
    echo "$line" >> "$OUTPUT_FILE"
  done &

CURL_PID=$!
echo "Started curl with PID: $CURL_PID"
echo ""

# Monitor for 120 seconds
for i in {1..120}; do
    sleep 1

    # Count events received so far
    if [ -f "$OUTPUT_FILE" ]; then
        BLOCK_COUNT=$(grep -c "event: block_ready" "$OUTPUT_FILE" 2>/dev/null || echo "0")
        STAGE_COUNT=$(grep -c "event: stage_" "$OUTPUT_FILE" 2>/dev/null || echo "0")

        if [ $i -eq 1 ] || [ $((i % 10)) -eq 0 ] || [ "$BLOCK_COUNT" -gt 0 ]; then
            echo "[$i/120s] Events received: $STAGE_COUNT stages, $BLOCK_COUNT blocks"
        fi

        # Stop after receiving complete event
        if grep -q "event: complete" "$OUTPUT_FILE" 2>/dev/null; then
            echo ""
            echo "✅ Generation complete!"
            break
        fi
    fi
done

# Kill curl
kill $CURL_PID 2>/dev/null
wait $CURL_PID 2>/dev/null

echo ""
echo "================================================================"
echo "📊 ANALYSIS"
echo "================================================================"

if [ -f "$OUTPUT_FILE" ]; then
    TOTAL_EVENTS=$(grep -c "event:" "$OUTPUT_FILE" 2>/dev/null || echo "0")
    BLOCK_EVENTS=$(grep -c "event: block_ready" "$OUTPUT_FILE" 2>/dev/null || echo "0")
    STAGE_EVENTS=$(grep -c "event: stage_" "$OUTPUT_FILE" 2>/dev/null || echo "0")
    SKELETON_EVENTS=$(grep -c "event: skeleton_ready" "$OUTPUT_FILE" 2>/dev/null || echo "0")

    echo "Total SSE events: $TOTAL_EVENTS"
    echo "- Stage events: $STAGE_EVENTS"
    echo "- Skeleton events: $SKELETON_EVENTS"
    echo "- Block events: $BLOCK_EVENTS"

    if [ "$BLOCK_EVENTS" -gt 0 ]; then
        echo ""
        echo "🔍 Block event timing:"
        grep -n "event: block_ready" "$OUTPUT_FILE" | head -10

        # Analyze timing
        echo ""
        FIRST_BLOCK=$(grep -n "event: block_ready" "$OUTPUT_FILE" | head -1 | cut -d: -f1)
        LAST_BLOCK=$(grep -n "event: block_ready" "$OUTPUT_FILE" | tail -1 | cut -d: -f1)

        if [ -n "$FIRST_BLOCK" ] && [ -n "$LAST_BLOCK" ]; then
            echo "First block at line: $FIRST_BLOCK"
            echo "Last block at line: $LAST_BLOCK"

            if [ "$FIRST_BLOCK" -eq "$LAST_BLOCK" ]; then
                echo "⚠️  WARNING: All block events appear on same line (batched)"
            else
                LINE_DIFF=$((LAST_BLOCK - FIRST_BLOCK))
                if [ "$LINE_DIFF" -lt "$BLOCK_EVENTS" ]; then
                    echo "⚠️  WARNING: Block events may be batched (only $LINE_DIFF lines for $BLOCK_EVENTS events)"
                else
                    echo "✅ Block events appear to be progressive"
                fi
            fi
        fi
    fi
fi

echo ""
echo "Full output saved to: $OUTPUT_FILE"
