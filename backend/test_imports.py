#!/usr/bin/env python3
"""
简单的知识路径生成测试
"""
import os
import sys

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """测试所有导入"""
    print("测试导入...")

    try:
        print("1. 导入 schemas...")
        from models.schemas import (
            GenerationRequest,
            KnowledgePath,
            KnowledgePoint,
            DifficultyLevel,
            CognitiveLevel
        )
        print("   ✅ schemas 导入成功")

        print("2. 导入 adapters...")
        from models.adapters import knowledge_path_to_skeleton
        print("   ✅ adapters 导入成功")

        print("3. 导入 narrative...")
        from models.narrative import create_narrative_profile
        print("   ✅ narrative 导入成功")

        print("4. 导入 agents...")
        from agents.planner import PlannerAgent
        from agents.content_expert import ContentExpertAgent
        from agents.visual_director import VisualDirectorAgent
        from agents.assembler import AssemblerAgent
        print("   ✅ agents 导入成功")

        print("5. 导入 pipeline...")
        from workflows.pipeline import create_pipeline
        print("   ✅ pipeline 导入成功")

        print("\n✅ 所有导入测试通过！")
        return True

    except Exception as e:
        print(f"\n❌ 导入失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_knowledge_path_creation():
    """测试知识路径创建"""
    print("\n\n测试知识路径创建...")

    try:
        from models.schemas import KnowledgePath, KnowledgePoint, CognitiveLevel

        # 创建一个简单的知识点
        kp = KnowledgePoint(
            knowledge_id="TEST-001",
            name="测试知识点",
            description="这是一个测试",
            domain="测试领域",
            subdomain="测试子域",
            difficulty=1,
            cognitive_level=CognitiveLevel.COG_L1,
            importance=0.8,
            abstraction=2,
            estimated_time=15,
            is_key_point=True,
            is_difficult=False,
            prerequisites=[],
            successors=[],
            keywords=["测试", "知识点"],
            application_scenarios=["测试场景"],
            common_misconceptions=["常见错误"],
            mastery_criteria="能够理解测试内容"
        )

        print(f"   ✅ 创建知识点: {kp.name}")

        # 创建知识路径
        path = KnowledgePath(
            knowledge_points=[kp],
            domain="测试领域",
            target_audience="测试用户"
        )

        print(f"   ✅ 创建知识路径: {path.domain}")
        print(f"   知识点数量: {len(path.knowledge_points)}")
        print(f"   总时间: {path.get_total_estimated_time()} 分钟")

        return True

    except Exception as e:
        print(f"   ❌ 创建失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    print("="*60)
    print("后端代码测试")
    print("="*60)

    # 测试导入
    if not test_imports():
        print("\n❌ 导入测试失败，请先安装依赖：")
        print("   pip install -r requirements.txt")
        return False

    # 测试知识路径创建
    if not test_knowledge_path_creation():
        return False

    print("\n" + "="*60)
    print("✅ 所有测试通过！代码可以正常运行。")
    print("="*60)
    print("\n下一步：")
    print("1. 设置 LLM API Key (GLM/SiliconFlow/OpenAI):")
    print("   - GLM: export GLM_API_KEY='your-key'")
    print("   - SiliconFlow: export LLM_API_KEY='your-key'")
    print("   - OpenAI: export OPENAI_API_KEY='your-key'")
    print("2. 运行完整示例: python example_knowledge_path.py")
    print("3. 或启动 API: python api/main.py")

    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
