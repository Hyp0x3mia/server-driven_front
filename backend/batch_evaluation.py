#!/usr/bin/env python3
"""
批量生成评测集内容

自动为所有评测集样本生成教育内容，并保存结果。
"""

import os
import sys
import time
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.schemas import (
    KnowledgePath,
    KnowledgePoint,
    CognitiveLevel,
    GenerationRequest,
    DifficultyLevel
)
from workflows.pipeline import create_pipeline
from agents.assembler import AssemblerAgent
from evaluation_set import EVALUATION_SETS


def convert_evaluation_set_to_request(eval_set):
    """将评测集转换为生成请求"""
    knowledge_points = []

    for kp_data in eval_set["knowledge_points"]:
        # 创建知识点对象
        kp = KnowledgePoint(
            knowledge_id=kp_data["knowledge_id"],
            name=kp_data["name"],
            description=kp_data["description"],
            domain=kp_data["domain"],
            subdomain=kp_data["subdomain"],
            difficulty=kp_data["difficulty"],
            cognitive_level=CognitiveLevel(kp_data["cognitive_level"]),
            importance=kp_data["importance"],
            abstraction=kp_data["abstraction"],
            estimated_time=kp_data["estimated_time"],
            is_key_point=kp_data["is_key_point"],
            is_difficult=kp_data["is_difficult"],
            prerequisites=kp_data["prerequisites"],
            successors=kp_data["successors"],
            keywords=kp_data["keywords"],
            application_scenarios=kp_data["application_scenarios"],
            common_misconceptions=kp_data["common_misconceptions"],
            mastery_criteria=kp_data["mastery_criteria"]
        )
        knowledge_points.append(kp)

    # 创建知识路径
    knowledge_path = KnowledgePath(
        knowledge_points=knowledge_points,
        domain=eval_set["domain"],
        target_audience=eval_set["target_audience"]
    )

    # 创建生成请求
    request = GenerationRequest(
        knowledge_path=knowledge_path,
        target_audience=eval_set["target_audience"],
        difficulty=DifficultyLevel(eval_set["difficulty"]),
        user_intent=eval_set["user_intent"],
        custom_title=eval_set["topic"],
        page_id=eval_set["set_id"]
    )

    return request


def evaluate_components(generated_schema, expected_components):
    """评估生成的组件是否符合预期"""
    generated_components = set()
    for block in generated_schema.components:
        generated_components.add(block.type.value)

    expected = set(expected_components)

    # 计算匹配度
    matched = generated_components & expected
    coverage = len(matched) / len(expected) if expected else 0

    return {
        "expected": list(expected),
        "generated": list(generated_components),
        "matched": list(matched),
        "missing": list(expected - generated_components),
        "unexpected": list(generated_components - expected),
        "coverage": coverage
    }


def run_evaluation(eval_set, pipeline):
    """运行单个评测集的生成"""
    print(f"\n{'='*70}")
    print(f"🎯 评测集: {eval_set['set_id']} - {eval_set['topic']}")
    print(f"{'='*70}")
    print(f"   领域: {eval_set['domain']}")
    print(f"   受众: {eval_set['target_audience']}")
    print(f"   难度: {eval_set['difficulty']}")
    print(f"   知识点数: {len(eval_set['knowledge_points'])}")
    print(f"   预期组件: {', '.join(eval_set['expected_components'])}")

    start_time = time.time()

    try:
        # 转换为请求
        request = convert_evaluation_set_to_request(eval_set)

        # 运行 pipeline
        response = pipeline.run(request)

        elapsed_time = time.time() - start_time

        if response.success:
            # 评估组件
            component_eval = evaluate_components(
                response.page_schema,
                eval_set["expected_components"]
            )

            print(f"\n✅ 生成成功！")
            print(f"   用时: {elapsed_time:.2f}秒")
            print(f"   Tokens: {response.tokens_used}")
            print(f"   章节数: {len(response.page_schema.sections)}")
            print(f"   组件数: {len(response.page_schema.components)}")

            print(f"\n📊 组件评估:")
            print(f"   覆盖率: {component_eval['coverage']*100:.0f}%")
            print(f"   匹配: {', '.join(component_eval['matched']) if component_eval['matched'] else '无'}")
            if component_eval['missing']:
                print(f"   缺失: {', '.join(component_eval['missing'])}")
            if component_eval['unexpected']:
                print(f"   额外: {', '.join(component_eval['unexpected'])}")

            # 保存结果
            result = {
                "set_id": eval_set["set_id"],
                "topic": eval_set["topic"],
                "domain": eval_set["domain"],
                "success": True,
                "generation_time": elapsed_time,
                "tokens_used": response.tokens_used,
                "sections": len(response.page_schema.sections),
                "components": len(response.page_schema.components),
                "component_evaluation": component_eval,
                "generated_at": datetime.now().isoformat()
            }

            # 导出 JSON
            output_dir = "evaluation_results"
            os.makedirs(output_dir, exist_ok=True)
            output_path = f"{output_dir}/{eval_set['set_id']}.json"

            assembler = AssemblerAgent()
            assembler.export_to_json(response.page_schema, output_path)

            return result
        else:
            print(f"\n❌ 生成失败: {response.error}")
            return {
                "set_id": eval_set["set_id"],
                "success": False,
                "error": response.error,
                "generated_at": datetime.now().isoformat()
            }

    except Exception as e:
        elapsed_time = time.time() - start_time
        print(f"\n❌ 异常: {e}")
        import traceback
        traceback.print_exc()

        return {
            "set_id": eval_set["set_id"],
            "success": False,
            "error": str(e),
            "elapsed_time": elapsed_time,
            "generated_at": datetime.now().isoformat()
        }


def main():
    """批量运行所有评测集"""
    print("\n" + "="*70)
    print("🚀 批量生成评测集内容")
    print("="*70)

    # 检查 API key
    api_key = os.getenv("GLM_API_KEY") or os.getenv("LLM_API_KEY") or os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("\n❌ 错误: 未设置 LLM API Key")
        print("\n请设置以下之一:")
        print("  export GLM_API_KEY='your-glm-key'")
        print("  export LLM_API_KEY='your-api-key'")
        print("  export OPENAI_API_KEY='your-openai-key'")
        return

    # 创建 pipeline
    print("\n🔧 初始化 Pipeline...")
    pipeline = create_pipeline()
    print("✅ Pipeline 初始化完成")

    # 选择评测集
    print(f"\n📋 可用评测集: {len(EVALUATION_SETS)} 个")
    for i, eval_set in enumerate(EVALUATION_SETS, 1):
        print(f"  {i}. {eval_set['set_id']} - {eval_set['topic']} ({eval_set['domain']})")

    choice = input("\n运行哪个评测集? (1-10, 或 'all'): ").strip().lower()

    results = []
    start_time = time.time()

    if choice == "all":
        # 运行所有评测集
        for i, eval_set in enumerate(EVALUATION_SETS, 1):
            print(f"\n进度: {i}/{len(EVALUATION_SETS)}")
            result = run_evaluation(eval_set, pipeline)
            results.append(result)

            # 保存中间结果
            with open("evaluation_results/_latest.json", "w", encoding="utf-8") as f:
                json.dump(results, f, ensure_ascii=False, indent=2)

    elif choice.isdigit() and 1 <= int(choice) <= len(EVALUATION_SETS):
        # 运行单个评测集
        eval_set = EVALUATION_SETS[int(choice) - 1]
        result = run_evaluation(eval_set, pipeline)
        results.append(result)
    else:
        print("无效选择")
        return

    # 生成总结报告
    total_time = time.time() - start_time

    print("\n" + "="*70)
    print("📊 评测总结")
    print("="*70)

    successful = sum(1 for r in results if r.get("success", False))
    failed = len(results) - successful

    print(f"\n总评测集数: {len(results)}")
    print(f"✅ 成功: {successful}")
    print(f"❌ 失败: {failed}")
    print(f"⏱️  总用时: {total_time:.1f}秒 ({total_time/60:.1f}分钟)")

    if successful > 0:
        total_tokens = sum(r.get("tokens_used", 0) for r in results if r.get("success"))
        avg_time = sum(r.get("generation_time", 0) for r in results if r.get("success")) / successful

        print(f"\n📈 性能指标:")
        print(f"   总 Tokens: {total_tokens}")
        print(f"   平均用时: {avg_time:.1f}秒")

        # 组件覆盖统计
        all_coverage = [r.get("component_evaluation", {}).get("coverage", 0)
                       for r in results if r.get("success")]
        if all_coverage:
            avg_coverage = sum(all_coverage) / len(all_coverage)
            print(f"   平均组件覆盖率: {avg_coverage*100:.1f}%")

    # 保存完整结果
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    results_file = f"evaluation_results/batch_results_{timestamp}.json"
    with open(results_file, "w", encoding="utf-8") as f:
        json.dump({
            "summary": {
                "total": len(results),
                "successful": successful,
                "failed": failed,
                "total_time": total_time,
                "generated_at": datetime.now().isoformat()
            },
            "results": results
        }, f, ensure_ascii=False, indent=2)

    print(f"\n💾 结果已保存到: {results_file}")
    print(f"💾 生成的内容保存在: evaluation_results/")

    # 显示失败的评测集
    if failed > 0:
        print(f"\n❌ 失败的评测集:")
        for result in results:
            if not result.get("success", False):
                print(f"   - {result['set_id']}: {result.get('error', 'Unknown error')}")


if __name__ == "__main__":
    main()
