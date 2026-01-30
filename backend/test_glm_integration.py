#!/usr/bin/env python3
"""
GLM API 集成测试脚本

测试 GLM (智谱) API 的连接和基本功能
"""

import os
import sys
import time
from datetime import datetime

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from dotenv import load_dotenv

load_dotenv()

def print_section(title):
    """打印分节标题"""
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70)


def test_env_config():
    """测试 1: 环境变量配置"""
    print_section("测试 1: 环境变量配置")

    # 检查 GLM 相关环境变量
    glm_key = os.getenv("GLM_API_KEY")
    glm_base = os.getenv("GLM_BASE_URL")
    glm_model = os.getenv("GLM_MODEL")

    print(f"\n📋 环境变量检查:")
    print(f"   GLM_API_KEY: {'✅ 已设置' if glm_key else '❌ 未设置'}")
    print(f"   GLM_BASE_URL: {'✅ ' + glm_base if glm_base else '❌ 未设置'}")
    print(f"   GLM_MODEL: {'✅ ' + glm_model if glm_model else '❌ 未设置'}")

    # 检查通用变量
    llm_key = os.getenv("LLM_API_KEY")
    llm_base = os.getenv("LLM_BASE_URL")
    llm_model = os.getenv("LLM_MODEL")

    print(f"\n   LLM_API_KEY: {'✅ 已设置' if llm_key else '❌ 未设置'}")
    print(f"   LLM_BASE_URL: {'✅ ' + llm_base if llm_base else '❌ 未设置'}")
    print(f"   LLM_MODEL: {'✅ ' + llm_model if llm_model else '❌ 未设置'}")

    # 判断是否有 API key
    api_key = glm_key or llm_key or os.getenv("OPENAI_API_KEY")
    if not api_key:
        print(f"\n❌ 错误: 未找到任何 API Key")
        print(f"   请设置以下环境变量之一:")
        print(f"   - GLM_API_KEY (推荐)")
        print(f"   - LLM_API_KEY")
        print(f"   - OPENAI_API_KEY")
        return False

    print(f"\n✅ API 配置检查通过")
    return True


def test_llm_import():
    """测试 2: LLM 客户端导入"""
    print_section("测试 2: LLM 客户端导入")

    try:
        from llm.client import create_llm_from_env, LLMConfig
        print("   ✅ llm.client 导入成功")

        from llm.client import create_llm
        print("   ✅ create_llm 函数导入成功")

        return True
    except ImportError as e:
        print(f"   ❌ 导入失败: {e}")
        return False


def test_llm_connection():
    """测试 3: LLM 连接测试"""
    print_section("测试 3: LLM 连接测试")

    try:
        from llm.client import create_llm_from_env

        print("\n📡 正在连接 LLM...")
        llm = create_llm_from_env()

        # 显示配置信息
        print(f"\n📋 LLM 配置:")
        print(f"   Model: {llm.model_name}")
        print(f"   Temperature: {llm.temperature}")
        print(f"   Max Tokens: {llm.max_tokens}")
        if hasattr(llm, 'base_url'):
            base_url = llm.base_url or "Default (OpenAI)"
            print(f"   Base URL: {base_url}")

        # 测试调用
        print(f"\n🔄 测试简单调用...")
        start_time = time.time()

        test_message = "你好，请用一句话介绍你自己。"
        response = llm.invoke(test_message)

        elapsed_time = time.time() - start_time

        print(f"   ✅ 调用成功 (耗时 {elapsed_time:.2f}s)")
        print(f"\n📝 响应内容:")
        print(f"   {response.content[:200]}")

        return True

    except Exception as e:
        print(f"   ❌ 连接失败: {e}")
        print(f"\n💡 可能的原因:")
        print(f"   1. API Key 错误")
        print(f"   2. Base URL 错误")
        print(f"   3. 模型名称错误")
        print(f"   4. 网络连接问题")
        return False


def test_knowledge_path_creation():
    """测试 4: 知识路径创建"""
    print_section("测试 4: 知识路径创建")

    try:
        from models.schemas import KnowledgePath, KnowledgePoint, CognitiveLevel

        # 创建测试知识点
        kp1 = KnowledgePoint(
            knowledge_id="TEST-001",
            name="自然语言处理",
            description="NLP 是人工智能的一个重要分支",
            domain="人工智能",
            subdomain="自然语言处理",
            difficulty=1,
            cognitive_level=CognitiveLevel.COG_L1,
            importance=0.9,
            abstraction=2,
            estimated_time=15,
            is_key_point=True,
            is_difficult=False,
            prerequisites=[],
            successors=[],
            keywords=["NLP", "AI", "文本处理"],
            application_scenarios=["机器翻译", "智能客服"],
            common_misconceptions=["NLP 只能处理英文"],
            mastery_criteria="能够理解 NLP 的基本定义和应用"
        )

        kp2 = KnowledgePoint(
            knowledge_id="TEST-002",
            name="Transformer 模型",
            description="Transformer 是一种基于注意力机制的神经网络架构",
            domain="人工智能",
            subdomain="深度学习",
            difficulty=2,
            cognitive_level=CognitiveLevel.COG_L2,
            importance=0.8,
            abstraction=3,
            estimated_time=30,
            is_key_point=True,
            is_difficult=True,
            prerequisites=["TEST-001"],
            successors=[],
            keywords=["Transformer", "Attention", "神经网络"],
            application_scenarios=["机器翻译", "文本生成"],
            common_misconceptions=["Transformer 只能用于 NLP"],
            mastery_criteria="能够理解 Transformer 的基本原理"
        )

        # 创建知识路径
        knowledge_path = KnowledgePath(
            knowledge_points=[kp1, kp2],
            domain="人工智能",
            target_audience="初学者"
        )

        print(f"\n✅ 知识路径创建成功")
        print(f"   知识点数量: {len(knowledge_path.knowledge_points)}")
        print(f"   总预计时间: {knowledge_path.get_total_estimated_time()} 分钟")
        print(f"   领域: {knowledge_path.domain}")

        return True, knowledge_path

    except Exception as e:
        print(f"   ❌ 创建失败: {e}")
        return False, None


def test_narrative_generation(knowledge_path):
    """测试 5: 叙述化上下文生成"""
    print_section("测试 5: 叙述化上下文生成")

    try:
        from models.adapters import knowledge_path_to_skeleton
        from models.narrative import create_narrative_profile

        # 转换为 skeleton
        print(f"\n🔄 转换知识路径为 PageSkeleton...")
        skeleton = knowledge_path_to_skeleton(knowledge_path)

        # 计算总节点数
        total_nodes = sum(len(section.nodes) for section in skeleton.sections)

        print(f"   ✅ 转换成功")
        print(f"   Sections 数量: {len(skeleton.sections)}")
        print(f"   总节点数: {total_nodes}")

        # 生成叙述化描述
        print(f"\n📝 生成叙述化描述...")
        node_count = 0
        for section in skeleton.sections:
            for node in section.nodes:
                if node_count >= 2:  # 只显示前两个
                    break
                profile = create_narrative_profile(node, style="full")
                print(f"\n--- 节点 {node_count + 1}: {node.title} ---")
                print(profile[:300] + "..." if len(profile) > 300 else profile)
                node_count += 1
            if node_count >= 2:
                break

        return True, skeleton

    except Exception as e:
        print(f"   ❌ 失败: {e}")
        import traceback
        traceback.print_exc()
        return False, None


def test_planner_agent(skeleton):
    """测试 6: Planner Agent"""
    print_section("测试 6: Planner Agent (如果需要 LLM)")

    try:
        from agents.planner import PlannerAgent

        print(f"\n🤖 创建 Planner Agent...")
        planner = PlannerAgent()

        print(f"   ✅ Planner Agent 创建成功")

        # 注意: skeleton 已经通过 adapter 生成，不需要 LLM
        print(f"\n✅ Planner 可以直接使用 adapter 生成的 skeleton")
        print(f"   (无需调用 LLM)")

        return True

    except Exception as e:
        print(f"   ❌ 失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_simple_content_generation():
    """测试 7: 简单内容生成"""
    print_section("测试 7: 简单内容生成 (完整流程测试)")

    try:
        from models.schemas import GenerationRequest
        from workflows.pipeline import create_pipeline

        print(f"\n🤖 创建 Pipeline...")
        pipeline = create_pipeline()

        # 创建简单请求
        request = GenerationRequest(
            topic="机器学习基础",
            target_audience="初学者",
            user_intent="简单介绍机器学习的基本概念",
            max_sections=3
        )

        print(f"   ✅ 请求创建成功")
        print(f"   主题: {request.topic}")
        print(f"   目标受众: {request.target_audience}")

        # 询问是否要运行完整流程
        print(f"\n⚠️  完整流程需要调用 LLM API，可能需要一些时间")
        print(f"   是否继续? (这是一个自动测试，将自动跳过)")

        # 自动跳过，避免消耗 API
        print(f"\n✅ Pipeline 创建测试通过")
        print(f"   💡 提示: 运行 'python example_knowledge_path.py' 进行完整测试")

        return True

    except Exception as e:
        print(f"   ❌ 失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def print_summary(results):
    """打印测试总结"""
    print_section("测试总结")

    total = len(results)
    passed = sum(results.values())

    print(f"\n📊 测试结果:")
    print(f"   总计: {total}")
    print(f"   通过: {passed}")
    print(f"   失败: {total - passed}")

    print(f"\n📋 详细结果:")
    for i, (test_name, result) in enumerate(results.items(), 1):
        status = "✅ 通过" if result else "❌ 失败"
        print(f"   {i}. {test_name}: {status}")

    if passed == total:
        print(f"\n🎉 所有测试通过！GLM API 集成正常工作。")
        print(f"\n💡 下一步:")
        print(f"   1. 运行完整示例: python example_knowledge_path.py")
        print(f"   2. 或启动 API 服务器: python api/main.py")
    else:
        print(f"\n⚠️  部分测试失败，请检查配置。")

    return passed == total


def main():
    """主函数"""
    print("\n" + "="*70)
    print("  GLM (智谱) API 集成测试")
    print("="*70)
    print(f"\n⏰ 开始时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    results = {}

    # 测试 1: 环境变量配置
    results["环境变量配置"] = test_env_config()
    if not results["环境变量配置"]:
        print("\n❌ 环境变量配置失败，无法继续测试。")
        return False

    # 测试 2: LLM 客户端导入
    results["LLM 客户端导入"] = test_llm_import()
    if not results["LLM 客户端导入"]:
        print("\n❌ LLM 客户端导入失败，无法继续测试。")
        return False

    # 测试 3: LLM 连接测试
    results["LLM 连接测试"] = test_llm_connection()
    if not results["LLM 连接测试"]:
        print("\n❌ LLM 连接失败，无法继续测试。")
        return False

    # 测试 4: 知识路径创建
    success, knowledge_path = test_knowledge_path_creation()
    results["知识路径创建"] = success

    # 测试 5: 叙述化上下文生成
    if knowledge_path:
        success, skeleton = test_narrative_generation(knowledge_path)
        results["叙述化上下文生成"] = success
    else:
        results["叙述化上下文生成"] = False
        skeleton = None

    # 测试 6: Planner Agent
    if skeleton:
        results["Planner Agent"] = test_planner_agent(skeleton)
    else:
        results["Planner Agent"] = False

    # 测试 7: 简单内容生成
    results["Pipeline 创建"] = test_simple_content_generation()

    # 打印总结
    all_passed = print_summary(results)

    print(f"\n⏰ 结束时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    return all_passed


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
