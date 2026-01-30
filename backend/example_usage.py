#!/usr/bin/env python3
"""
Example usage of the Multi-Agent Content Generation Pipeline

This script demonstrates how to use the pipeline to generate educational content.
"""

import os
import sys
import json

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.schemas import GenerationRequest, DifficultyLevel
from workflows.pipeline import create_pipeline
from agents.assembler import AssemblerAgent


def example_basic_generation():
    """Example 1: Basic content generation"""
    print("\n" + "="*70)
    print("EXAMPLE 1: Basic Content Generation")
    print("="*70)

    # Create pipeline
    pipeline = create_pipeline()

    # Create request
    request = GenerationRequest(
        topic="Transformer Architecture in Deep Learning",
        target_audience="Machine Learning Engineers",
        difficulty=DifficultyLevel.INTERMEDIATE,
        user_intent="Understand the core attention mechanism"
    )

    # Run pipeline
    response = pipeline.run(request)

    # Print results
    if response.success:
        print(f"\n✅ SUCCESS!")
        print(f"   Time: {response.generation_time_seconds:.2f}s")
        print(f"   Tokens: {response.tokens_used}")
        print(f"   Sections: {len(response.page_schema.sections)}")
        print(f"   Components: {len(response.page_schema.components)}")

        # Print component breakdown
        from collections import Counter
        components = [c.type for c in response.page_schema.components]
        print(f"\n📊 Component Breakdown:")
        for comp_type, count in Counter(components).most_common():
            print(f"   {comp_type}: {count}")

        # Export to JSON
        os.makedirs("output", exist_ok=True)
        output_path = "output/transformer-example.json"
        assembler = AssemblerAgent()
        assembler.export_to_json(response.page_schema, output_path)
        print(f"\n💾 Exported to: {output_path}")

        return response.page_schema
    else:
        print(f"\n❌ FAILED: {response.error}")
        return None


def example_chinese_content():
    """Example 2: Chinese content generation"""
    print("\n" + "="*70)
    print("EXAMPLE 2: Chinese Content Generation")
    print("="*70)

    pipeline = create_pipeline()

    request = GenerationRequest(
        topic="自然语言处理基础",
        target_audience="AI初学者",
        difficulty=DifficultyLevel.BEGINNER,
        user_intent="了解NLP的核心概念和应用"
    )

    response = pipeline.run(request)

    if response.success:
        print(f"\n✅ 生成成功！")
        print(f"   时间: {response.generation_time_seconds:.2f}s")
        print(f"   章节数: {len(response.page_schema.sections)}")

        # Export
        os.makedirs("output", exist_ok=True)
        assembler = AssemblerAgent()
        assembler.export_to_json(response.page_schema, "output/nlp-chinese.json")
        print(f"💾 已导出到: output/nlp-chinese.json")

        return response.page_schema
    else:
        print(f"\n❌ 生成失败: {response.error}")
        return None


def example_advanced_usage():
    """Example 3: Advanced usage with custom parameters"""
    print("\n" + "="*70)
    print("EXAMPLE 3: Advanced Usage")
    print("="*70)

    pipeline = create_pipeline(model_name="claude-sonnet-4-20250514")

    request = GenerationRequest(
        topic="Reinforcement Learning: Q-Learning",
        target_audience="AI Researchers",
        difficulty=DifficultyLevel.ADVANCED,
        user_intent="Deep dive into Q-learning algorithm with mathematical foundations",
        max_sections=8,
        include_interactive=True
    )

    response = pipeline.run(request)

    if response.success:
        print(f"\n✅ Advanced generation completed!")

        # Access intermediate stages
        print(f"\n📋 Planning Stage:")
        print(f"   Sections: {len(response.planning_stage.sections)}")
        for section in response.planning_stage.sections:
            print(f"   - {section.title}: {len(section.nodes)} nodes")

        print(f"\n📚 Content Stage:")
        print(f"   Content blocks: {len(response.content_stage.contents)}")

        print(f"\n🎨 Visual Stage:")
        print(f"   Component mappings: {len(response.visual_stage.mappings)}")

        # Export
        os.makedirs("output", exist_ok=True)
        assembler = AssemblerAgent()
        assembler.export_to_json(response.page_schema, "output/rl-qlearning.json")
        print(f"\n💾 Exported to: output/rl-qlearning.json")

        return response.page_schema
    else:
        print(f"\n❌ Failed: {response.error}")
        return None


def example_export_to_frontend():
    """Example 4: Export to frontend public/pages directory"""
    print("\n" + "="*70)
    print("EXAMPLE 4: Frontend Integration")
    print("="*70)

    pipeline = create_pipeline()

    request = GenerationRequest(
        topic="React Hooks Explained",
        target_audience="Web Developers",
        difficulty=DifficultyLevel.BEGINNER
    )

    response = pipeline.run(request)

    if response.success:
        # Export to frontend public directory
        frontend_path = "../public/pages/react-hooks-demo.json"
        os.makedirs(os.path.dirname(frontend_path), exist_ok=True)

        assembler = AssemblerAgent()
        assembler.export_to_json(response.page_schema, frontend_path)

        print(f"\n✅ Exported for frontend!")
        print(f"   Path: {frontend_path}")
        print(f"   Access at: /pages/react-hooks-demo")

        return response.page_schema
    else:
        print(f"\n❌ Failed: {response.error}")
        return None


def main():
    """Run all examples"""
    print("\n" + "="*70)
    print("🚀 Multi-Agent Content Generation Pipeline - Examples")
    print("="*70)

    # Check API key
    if not os.getenv("ANTHROPIC_API_KEY"):
        print("\n❌ Error: ANTHROPIC_API_KEY environment variable not set")
        print("\nPlease set it:")
        print("  export ANTHROPIC_API_KEY='your-key-here'")
        return

    examples = [
        ("Basic Generation", example_basic_generation),
        ("Chinese Content", example_chinese_content),
        ("Advanced Usage", example_advanced_usage),
        ("Frontend Integration", example_export_to_frontend),
    ]

    print("\nAvailable examples:")
    for i, (name, _) in enumerate(examples, 1):
        print(f"  {i}. {name}")

    choice = input("\nWhich example to run? (1-4, or 'all'): ").strip().lower()

    if choice == "all":
        for name, func in examples:
            try:
                func()
            except Exception as e:
                print(f"\n❌ Example failed: {e}")
    elif choice.isdigit() and 1 <= int(choice) <= len(examples):
        _, func = examples[int(choice) - 1]
        try:
            func()
        except Exception as e:
            print(f"\n❌ Example failed: {e}")
    else:
        print("Invalid choice")


if __name__ == "__main__":
    main()
