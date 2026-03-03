"""
Backend API endpoint for json-render streaming with realistic jitter simulation

This endpoint tests json-render's character-by-character parser under realistic
LLM streaming conditions with variable delays, stuttering, and nested structure pauses.
"""

import asyncio
import random
import json
from typing import AsyncGenerator
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from pathlib import Path
import sys

# Add parent directory to path for imports
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from models.schemas import GenerationRequest


class StreamingJitterSimulator:
    """
    Simulates realistic LLM streaming behavior with variable delays.
    Tests json-render's parser resilience under adverse conditions.
    """

    def __init__(self, base_delay_ms: float = 30, jitter_factor: float = 3.0):
        self.base_delay_ms = base_delay_ms
        self.jitter_factor = jitter_factor  # Multiplier for burst delays

    async def stream_with_jitter(self, json_string: str) -> AsyncGenerator[str, None]:
        """
        Stream JSON character-by-character with realistic delays.

        Simulates:
        - Base token emission rate (base_delay_ms)
        - Burst pauses (1-5x base_delay, random)
        - Nested structure delays (pause before closing braces/brackets)
        - Occasional longer hiccups (10-20x base_delay)
        """
        i = 0
        chars = list(json_string)
        nesting_level = 0

        while i < len(chars):
            char = chars[i]

            # Calculate delay for this character
            delay_ms = self.base_delay_ms

            # Track nesting for pauses at structure boundaries
            if char in ['{', '[']:
                nesting_level += 1
            elif char in ['}', ']']:
                nesting_level -= 1
                # Pause before closing deeply nested structures
                if nesting_level >= 2:  # Nested 2+ levels deep
                    delay_ms *= self.jitter_factor * 2

            # Random burst pauses (simulate LLM thinking)
            if random.random() < 0.05:  # 5% chance per character
                delay_ms *= random.uniform(1, 5)  # 1-5x normal delay

            # Simulate hiccup on deeply nested structures
            # (e.g., test_cases inside CodePlayground)
            if nesting_level >= 3 and random.random() < 0.1:  # 10% chance
                delay_ms *= self.jitter_factor * 5  # Major pause
                print(f"⏸️ Simulated LLM hiccup at nesting level {nesting_level}")

            # Occasionally simulate network hiccup
            if random.random() < 0.01:  # 1% chance
                await asyncio.sleep(0.2)  # 200ms network delay
                print(f"🌐 Simulated network hiccup")

            # Yield character
            yield char

            # Apply delay
            await asyncio.sleep(delay_ms / 1000)

            i += 1


# ============ Test Schemas for json-render ============

def create_json_render_spec_flashcard() -> dict:
    """Create a json-render spec for Flashcard component"""
    return {
        "root": "flashcard-1",
        "elements": {
            "flashcard-1": {
                "type": "Flashcard",
                "props": {
                    "id": "test-flashcard-1",
                    "content": {
                        "front": "What is the difference between supervised and unsupervised learning?",
                        "back": "**Supervised learning** uses labeled data to learn patterns, while **unsupervised learning** finds patterns in unlabeled data without explicit guidance.",
                        "hints": [
                            "Think about the presence or absence of labels",
                            "Consider the role of feedback during training"
                        ],
                        "difficulty": "intermediate"
                    }
                },
                "children": []
            }
        }
    }


def create_json_render_spec_cloze() -> dict:
    """Create a json-render spec for Cloze component with multiple gaps"""
    return {
        "root": "cloze-1",
        "elements": {
            "cloze-1": {
                "type": "Cloze",
                "props": {
                    "id": "test-cloze-1",
                    "content": "Machine learning is a subset of {{gap1}} that enables computers to {{gap2}} from data. The main types are {{gap3}} learning, {{gap4}} learning, and {{gap5}} learning.",
                    "gaps": [
                        {
                            "gap_id": "gap1",
                            "correct_answer": "artificial intelligence",
                            "alternatives": ["AI"],
                            "case_sensitive": False,
                            "hint": "Think of the broader field"
                        },
                        {
                            "gap_id": "gap2",
                            "correct_answer": "learn",
                            "alternatives": ["improve", "adapt"],
                            "case_sensitive": False,
                            "hint": "What do students do in school?"
                        },
                        {
                            "gap_id": "gap3",
                            "correct_answer": "supervised",
                            "case_sensitive": False,
                            "hint": "Uses labeled data"
                        },
                        {
                            "gap_id": "gap4",
                            "correct_answer": "unsupervised",
                            "case_sensitive": False,
                            "hint": "Finds patterns without labels"
                        },
                        {
                            "gap_id": "gap5",
                            "correct_answer": "reinforcement",
                            "case_sensitive": False,
                            "hint": "Uses rewards and punishments"
                        }
                    ],
                    "evaluation": {
                        "auto_verify": True,
                        "show_feedback": True,
                        "max_attempts": 3
                    }
                },
                "children": []
            }
        }
    }


def create_json_render_spec_codeplayground() -> dict:
    """Create a json-render spec for CodePlayground with deeply nested test cases"""
    return {
        "root": "playground-1",
        "elements": {
            "playground-1": {
                "type": "CodePlayground",
                "props": {
                    "id": "test-playground-1",
                    "content": {
                        "mode": "tokenizer",
                        "language": "python",
                        "code_template": "def tokenize(text):\n    # TODO: Implement\n    pass"
                    },
                    "test_cases": [
                        {
                            "id": "test-1",
                            "name": "Simple tokenization",
                            "input_code": "tokenize('hello world')",
                            "expected_output": {
                                "tokens": [
                                    {"token": "hello", "position": [0, 5], "tag": "WORD"},
                                    {"token": "world", "position": [6, 11], "tag": "WORD"}
                                ]
                            },
                            "evaluation_criteria": [
                                "Tokenizes words correctly",
                                "Preserves character positions",
                                "Assigns correct POS tags"
                            ]
                        },
                        {
                            "id": "test-2",
                            "name": "Punctuation handling",
                            "input_code": "tokenize('hello, world!')",
                            "expected_output": {
                                "tokens": [
                                    {"token": "hello", "position": [0, 5], "tag": "WORD"},
                                    {"token": ",", "position": [5, 6], "tag": "PUNCT"},
                                    {"token": "world", "position": [7, 12], "tag": "WORD"},
                                    {"token": "!", "position": [12, 13], "tag": "PUNCT"}
                                ]
                            },
                            "evaluation_criteria": [
                                "Separates punctuation from words",
                                "Preserves original spacing"
                            ]
                        }
                    ]
                },
                "children": []
            }
        }
    }


def create_json_render_spec_all_components() -> dict:
    """Create a json-render spec with all three components for testing"""
    return {
        "root": "flashcard-1",
        "elements": {
            "flashcard-1": {
                "type": "Flashcard",
                "props": {
                    "id": "test-flashcard-1",
                    "content": {
                        "front": "What is the difference between supervised and unsupervised learning?",
                        "back": "**Supervised learning** uses labeled data, while **unsupervised** finds patterns without labels."
                    }
                },
                "children": []
            },
            "cloze-1": {
                "type": "Cloze",
                "props": {
                    "id": "test-cloze-1",
                    "content": "Machine learning is a subset of {{gap1}} that enables computers to {{gap2}} from data.",
                    "gaps": [
                        {"gap_id": "gap1", "correct_answer": "artificial intelligence", "case_sensitive": False},
                        {"gap_id": "gap2", "correct_answer": "learn", "case_sensitive": False}
                    ]
                },
                "children": []
            },
            "playground-1": {
                "type": "CodePlayground",
                "props": {
                    "id": "test-playground-1",
                    "content": {"mode": "tokenizer", "language": "python"},
                    "test_cases": [
                        {
                            "id": "test-1",
                            "name": "Simple test",
                            "input_code": "tokenize('test')",
                            "expected_output": {
                                "tokens": [{"token": "test", "position": [0, 4], "tag": "WORD"}]
                            }
                        }
                    ]
                },
                "children": []
            }
        }
    }


# ============ API Endpoint ============

def generate_json_render_stream(component_type: str = "all"):
    """
    Generate json-render spec with realistic jitter simulation.

    This endpoint simulates LLM streaming behavior to test json-render's
    character-by-character parser under adverse conditions.

    Args:
        component_type: One of 'flashcard', 'cloze', 'codeplayground', or 'all'

    Returns:
        Async generator for SSE events containing character-by-character JSON
    """
    # Select spec based on component type
    if component_type == "flashcard":
        spec = create_json_render_spec_flashcard()
    elif component_type == "cloze":
        spec = create_json_render_spec_cloze()
    elif component_type == "codeplayground":
        spec = create_json_render_spec_codeplayground()
    else:  # all
        spec = create_json_render_spec_all_components()

    # Convert to JSON string for character-by-character streaming
    json_string = json.dumps(spec, ensure_ascii=False)

    print(f"📡 Starting json-render jitter simulation for {component_type}")
    print(f"   Spec size: {len(json_string)} characters")
    print(f"   Root element: {spec.get('root')}")
    print(f"   Total elements: {len(spec.get('elements', {}))}")

    async def event_generator():
        """Generate SSE events with jitter simulation"""
        jitter = StreamingJitterSimulator(base_delay_ms=30, jitter_factor=3.0)

        buffer = ""
        char_count = 0
        last_log_time = asyncio.get_event_loop().time()

        try:
            async for char in jitter.stream_with_jitter(json_string):
                buffer += char
                char_count += 1

                # Yield in SSE format
                yield f"data: {char}\n\n"

                # Debug logging every 50 characters
                current_time = asyncio.get_event_loop().time()
                if current_time - last_log_time > 1.0:  # Log every second
                    try:
                        json.loads(buffer)  # Test if currently valid
                        print(f"✅ Valid JSON at position {char_count}/{len(json_string)} ({char_count/len(json_string)*100:.1f}%)")
                    except json.JSONDecodeError:
                        print(f"⚠️ Invalid JSON at position {char_count}/{len(json_string)} (expected during streaming)")
                    last_log_time = current_time

            print(f"✅ json-render jitter simulation complete: {char_count} characters sent")

        except Exception as e:
            print(f"❌ Streaming error: {e}")
            import traceback
            traceback.print_exc()
            yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"

    return event_generator()


# ============ Route Registration Helper ============

def register_json_render_routes(app):
    """
    Register json-render streaming routes with the FastAPI app.

    Call this from main.py after creating the app:
        from backend.api.json_render_endpoints import register_json_render_routes
        register_json_render_routes(app)
    """

    @app.get("/api/generate/json-render-stream")
    async def api_generate_json_render_stream(component_type: str = "all"):
        """
        Generate json-render spec with realistic jitter simulation.

        Query Parameters:
            component_type: 'flashcard', 'cloze', 'codeplayground', or 'all' (default)

        Returns:
            SSE stream with character-by-character JSON
        """
        return StreamingResponse(
            generate_json_render_stream(component_type),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",  # Disable nginx buffering
            }
        )

    @app.get("/api/json-render/test-specs")
    async def get_test_specs():
        """Return all test specs for debugging"""
        return {
            "flashcard": create_json_render_spec_flashcard(),
            "cloze": create_json_render_spec_cloze(),
            "codeplayground": create_json_render_spec_codeplayground(),
            "all": create_json_render_spec_all_components()
        }

    print("✅ Registered json-render streaming endpoints:")
    print("   GET  /api/generate/json-render-stream?component_type={flashcard|cloze|codeplayground|all}")
    print("   GET  /api/json-render/test-specs")
