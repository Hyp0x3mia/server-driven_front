#!/usr/bin/env python3
"""
示例：使用知识路径生成教育内容

这个示例演示如何使用你现有的知识路径数据格式来生成完整的教育页面。
"""

import os
import sys
import json

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.schemas import (
    GenerationRequest,
    KnowledgePath,
    KnowledgePoint,
    CognitiveLevel,
    DifficultyLevel
)
from workflows.pipeline import create_pipeline
from models.adapters import parse_knowledge_path_from_json
from agents.assembler import AssemblerAgent
from dotenv import load_dotenv
load_dotenv()


# ============ 示例知识路径（来自你的项目）============

EXAMPLE_KNOWLEDGE_PATH = [
    {
        "knowledge_id": "D02-M01-K008",
        "name": "自然语言处理概述",
        "description": "自然语言处理是人工智能十分重要的研究领域，有漫长的发展历史、丰富的技术内涵和广泛的应用价值。",
        "domain": "自然语言处理",
        "subdomain": "领域概述",
        "difficulty": 1,
        "cognitive_level": "COG_L1",
        "importance": 0.8,
        "abstraction": 4,
        "estimated_time": 15,
        "is_key_point": True,
        "is_difficult": False,
        "prerequisites": [],
        "successors": [],
        "keywords": ["自然语言处理", "人工智能", "大语言模型"],
        "application_scenarios": ["文本分析", "信息处理", "智能交互"],
        "common_misconceptions": [],
        "mastery_criteria": "能够概述自然语言处理的定义、历史地位及主要技术方向"
    },
    {
        "knowledge_id": "D02-M01-K001",
        "name": "自然语言处理的定义与作用",
        "description": "自然语言处理（NLP）是引导机器模拟和延伸人类语言能力的基础性和关键性研究方向。",
        "domain": "自然语言处理",
        "subdomain": "基础概念",
        "difficulty": 1,
        "cognitive_level": "COG_L1",
        "importance": 0.9,
        "abstraction": 3,
        "estimated_time": 15,
        "is_key_point": True,
        "is_difficult": False,
        "prerequisites": [],
        "successors": [],
        "keywords": ["NLP", "机器表示", "分析", "理解", "生成"],
        "application_scenarios": ["各行各业", "日常生活"],
        "common_misconceptions": [],
        "mastery_criteria": "能够解释自然语言处理的定义、作用及其应用领域"
    },
    {
        "knowledge_id": "D02-M01-K002",
        "name": "自然语言处理的4个历史阶段",
        "description": "自然语言处理的发展历程可分为4个阶段：萌芽期、快速发展期、低谷期和复苏繁荣期。",
        "domain": "自然语言处理",
        "subdomain": "历史发展",
        "difficulty": 2,
        "cognitive_level": "COG_L2",
        "importance": 0.8,
        "abstraction": 4,
        "estimated_time": 20,
        "is_key_point": True,
        "is_difficult": False,
        "prerequisites": [],
        "successors": [],
        "keywords": ["历史阶段", "萌芽期", "快速发展期", "低谷期", "复苏繁荣期"],
        "application_scenarios": [],
        "common_misconceptions": [],
        "mastery_criteria": "能够列举自然语言处理的4个历史阶段及其时间范围"
    }
]


def example_knowledge_path_generation():
    """示例 1: 使用知识路径生成内容"""
    print("\n" + "="*70)
    print("示例 1: 使用知识路径生成内容")
    print("="*70)

    # 1. 解析知识路径
    print("\n📚 步骤 1: 解析知识路径...")
    knowledge_path = parse_knowledge_path_from_json(EXAMPLE_KNOWLEDGE_PATH)
    print(f"   领域: {knowledge_path.domain}")
    print(f"   知识点数量: {len(knowledge_path.knowledge_points)}")
    print(f"   总预计时间: {knowledge_path.get_total_estimated_time()} 分钟")

    # 显示子域分组
    grouped = knowledge_path.get_by_subdomain()
    print(f"   子域: {list(grouped.keys())}")

    # 2. 创建生成请求
    print("\n🔧 步骤 2: 创建生成请求...")
    request = GenerationRequest(
        knowledge_path=knowledge_path,  # 使用知识路径模式
        target_audience="AI 初学者",
        difficulty=DifficultyLevel.BEGINNER,
        user_intent="全面了解自然语言处理的基础概念",
        page_id="nlp-introduction"  # 可选：自定义页面 ID
    )

    print(f"   模式: {request.get_mode()}")
    print(f"   难度: {request.get_effective_difficulty()}")

    # 3. 运行流水线
    print("\n🚀 步骤 3: 运行多智能体流水线...")
    pipeline = create_pipeline()
    response = pipeline.run(request)

    # 4. 显示结果
    if response.success:
        print("\n✅ 生成成功！")
        print(f"   时间: {response.generation_time_seconds:.2f}s")
        print(f"   Tokens: {response.tokens_used}")
        print(f"   章节数: {len(response.page_schema.sections)}")
        print(f"   组件数: {len(response.page_schema.components)}")

        # 显示章节结构
        print("\n📋 生成的章节结构:")
        for section in response.page_schema.sections:
            print(f"   - {section.title} ({section.section_type})")
            print(f"     包含 {len(section.blocks)} 个模块")

        # 导出为 JSON
        os.makedirs("output", exist_ok=True)
        output_path = "output/nlp-from-knowledge-path.json"
        assembler = AssemblerAgent()
        assembler.export_to_json(response.page_schema, output_path)
        print(f"\n💾 已导出到: {output_path}")

        return response.page_schema
    else:
        print(f"\n❌ 生成失败: {response.error}")
        return None


def example_from_json_file():
    """示例 2: 从 JSON 文件读取知识路径"""
    print("\n" + "="*70)
    print("示例 2: 从 JSON 文件读取知识路径")
    print("="*70)

    # 假设你有一个包含完整知识路径的 JSON 文件
    # json_file = "path/to/your/knowledge_path.json"

    # 这里使用示例数据
    print("\n📖 从 JSON 数据读取...")
    knowledge_path = parse_knowledge_path_from_json(EXAMPLE_KNOWLEDGE_PATH)

    # 创建请求
    request = GenerationRequest(
        knowledge_path=knowledge_path,
        custom_title="NLP 完整入门"  # 可选：自定义标题
    )

    # 生成
    pipeline = create_pipeline()
    response = pipeline.run(request)

    if response.success:
        print("\n✅ 生成成功！")
        print(f"   页面 ID: {response.page_schema.page_id}")
        print(f"   标题: {response.page_schema.title}")
        print(f"   摘要: {response.page_schema.summary}")

        return response.page_schema
    else:
        print(f"\n❌ 失败: {response.error}")
        return None


def example_topic_vs_knowledge_path():
    """示例 3: 对比两种输入模式"""
    print("\n" + "="*70)
    print("示例 3: 对比两种输入模式")
    print("="*70)

    pipeline = create_pipeline()

    # 模式 1: 简单主题
    print("\n📝 模式 1: 简单主题 (Topic Mode)")
    request_topic = GenerationRequest(
        topic="机器学习基础",
        target_audience="初学者",
        difficulty=DifficultyLevel.BEGINNER
    )

    print(f"   检测到模式: {request_topic.get_mode()}")

    # 模式 2: 知识路径
    print("\n📚 模式 2: 知识路径 (Knowledge Path Mode)")
    knowledge_path = parse_knowledge_path_from_json(EXAMPLE_KNOWLEDGE_PATH)
    request_kp = GenerationRequest(
        knowledge_path=knowledge_path
    )

    print(f"   检测到模式: {request_kp.get_mode()}")
    print(f"   知识点数量: {len(request_kp.knowledge_path.knowledge_points)}")
    print(f"   自动难度: {request_kp.get_effective_difficulty()}")

    print("\n💡 关键区别:")
    print("   主题模式: 使用 LLM 生成结构 (适合快速原型)")
    print("   知识路径模式: 直接转换已有结构 (适合生产环境)")


def example_frontend_integration():
    """示例 4: 前端集成"""
    print("\n" + "="*70)
    print("示例 4: 导出为前端可用格式")
    print("="*70)

    # 生成内容
    knowledge_path = parse_knowledge_path_from_json(EXAMPLE_KNOWLEDGE_PATH)
    request = GenerationRequest(
        knowledge_path=knowledge_path,
        page_id="nlp-intro"
    )

    pipeline = create_pipeline()
    response = pipeline.run(request)

    if response.success:
        # 导出到前端 public 目录
        frontend_path = "../public/pages/nlp-intro.json"
        os.makedirs(os.path.dirname(frontend_path), exist_ok=True)

        assembler = AssemblerAgent()
        assembler.export_to_json(response.page_schema, frontend_path)

        print(f"\n✅ 已导出到前端目录!")
        print(f"   路径: {frontend_path}")
        print(f"   访问: /pages/nlp-intro")

        print("\n📝 在前端使用:")
        print("""
```typescript
import {{ SchemaRenderer }} from './renderer/SchemaRenderer';

function NLPPage() {{
  return <SchemaRenderer pageId="nlp-intro" />;
}}
```
        """)


def main():
    """运行所有示例"""
    print("\n" + "="*70)
    print("🎉 多智能体内容生成 - 知识路径模式示例")
    print("="*70)

    # 检查 API key
    api_key = os.getenv("GLM_API_KEY") or os.getenv("LLM_API_KEY") or os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("\n❌ 错误: 未设置 LLM API Key 环境变量")
        print("\n请设置以下之一:")
        print("  export GLM_API_KEY='your-glm-key'          # GLM (推荐)")
        print("  export LLM_API_KEY='your-api-key'          # SiliconFlow/其他")
        print("  export OPENAI_API_KEY='your-openai-key'    # OpenAI")
        print("\n或在 .env 文件中配置:")
        print("  GLM_API_KEY=your-glm-api-key")
        print("  GLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4/")
        print("  GLM_MODEL=glm-4-flash")
        return

    examples = [
        ("知识路径生成", example_knowledge_path_generation),
        ("从 JSON 文件", example_from_json_file),
        ("模式对比", example_topic_vs_knowledge_path),
        ("前端集成", example_frontend_integration),
    ]

    print("\n可用示例:")
    for i, (name, _) in enumerate(examples, 1):
        print(f"  {i}. {name}")

    choice = input("\n运行哪个示例? (1-4, 或 'all'): ").strip().lower()

    if choice == "all":
        for name, func in examples:
            try:
                func()
            except Exception as e:
                print(f"\n❌ 示例失败: {e}")
    elif choice.isdigit() and 1 <= int(choice) <= len(examples):
        _, func = examples[int(choice) - 1]
        try:
            func()
        except Exception as e:
            print(f"\n❌ 示例失败: {e}")
    else:
        print("无效选择")


if __name__ == "__main__":
    main()
