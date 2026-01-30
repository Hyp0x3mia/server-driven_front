#!/usr/bin/env python3
"""
自动化验证并生成所有AI评测集内容

依次生成每个AI主题，如果失败则停止并报告错误。
成功后自动复制到前端页面目录。
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

    knowledge_path = KnowledgePath(
        knowledge_points=knowledge_points,
        domain=eval_set["domain"],
        target_audience=eval_set["target_audience"]
    )

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
    """评估生成的组件"""
    generated_components = set()
    for block in generated_schema.components:
        generated_components.add(block.type.value)

    expected = set(expected_components)
    matched = generated_components & expected
    coverage = len(matched) / len(expected) if expected else 0

    # 计算缺失和意外的组件
    missing = expected - generated_components
    unexpected = generated_components - expected

    return {
        "expected": list(expected),
        "generated": list(generated_components),
        "matched": list(matched),
        "missing": list(missing),
        "unexpected": list(unexpected),
        "coverage": coverage
    }


def main():
    """主函数：依次生成所有AI主题"""
    print("\n" + "="*70)
    print("🤖 AI通识评测集 - 自动化生成验证")
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
    print("✅ Pipeline 初始化完成\n")

    # 创建结果目录
    os.makedirs("evaluation_results", exist_ok=True)
    os.makedirs("../public/pages", exist_ok=True)

    # 生成记录
    results = []
    successful_sets = []

    # 依次生成每个主题
    for i, eval_set in enumerate(EVALUATION_SETS, 1):
        print(f"\n{'='*70}")
        print(f"🤖 [{i}/10] {eval_set['set_id']} - {eval_set['topic']}")
        print(f"{'='*70}")
        print(f"   难度: {eval_set['difficulty']}")
        print(f"   受众: {eval_set['target_audience']}")
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
                print(f"   用时: {elapsed_time:.1f}秒")
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

                # 保存到evaluation_results
                result_path = f"evaluation_results/{eval_set['set_id']}.json"
                assembler = AssemblerAgent()
                assembler.export_to_json(response.page_schema, result_path)
                print(f"   💾 已保存: {result_path}")

                # 复制到前端
                frontend_path = f"../public/pages/{eval_set['set_id']}.json"
                assembler.export_to_json(response.page_schema, frontend_path)
                print(f"   🌐 前端页面: {eval_set['set_id']}.json")

                # 记录结果
                result = {
                    "set_id": eval_set["set_id"],
                    "topic": eval_set["topic"],
                    "success": True,
                    "generation_time": elapsed_time,
                    "tokens_used": response.tokens_used,
                    "sections": len(response.page_schema.sections),
                    "components": len(response.page_schema.components),
                    "component_coverage": component_eval['coverage'],
                    "generated_at": datetime.now().isoformat()
                }
                results.append(result)
                successful_sets.append(eval_set['set_id'])

            else:
                print(f"\n❌ 生成失败: {response.error}")
                print(f"\n⚠️  需要修复问题后从头重新运行")

                # 保存失败记录
                result = {
                    "set_id": eval_set["set_id"],
                    "topic": eval_set["topic"],
                    "success": False,
                    "error": response.error,
                    "generated_at": datetime.now().isoformat()
                }
                results.append(result)

                # 保存中间结果
                with open("evaluation_results/_latest.json", "w", encoding="utf-8") as f:
                    json.dump({
                        "total": i,
                        "successful": len(successful_sets),
                        "results": results
                    }, f, ensure_ascii=False, indent=2)

                print(f"\n💾 已保存中间结果到: evaluation_results/_latest.json")
                print(f"\n❌ 停止验证流程。请修复错误后重新运行。")
                return

        except Exception as e:
            print(f"\n❌ 异常: {e}")
            import traceback
            traceback.print_exc()

            # 保存失败记录
            result = {
                "set_id": eval_set["set_id"],
                "topic": eval_set["topic"],
                "success": False,
                "error": str(e),
                "generated_at": datetime.now().isoformat()
            }
            results.append(result)

            # 保存中间结果
            with open("evaluation_results/_latest.json", "w", encoding="utf-8") as f:
                json.dump({
                    "total": i,
                    "successful": len(successful_sets),
                    "results": results
                }, f, ensure_ascii=False, indent=2)

            print(f"\n💾 已保存中间结果到: evaluation_results/_latest.json")
            print(f"\n❌ 停止验证流程。请修复错误后重新运行。")
            return

    # 全部完成
    total_time = sum(r.get("generation_time", 0) for r in results if r.get("success", False))

    print("\n" + "="*70)
    print("🎉 所有AI主题生成完成！")
    print("="*70)
    print(f"\n✅ 成功生成: {len(successful_sets)}/10")
    print(f"⏱️  总用时: {total_time/60:.1f}分钟")

    # 统计组件覆盖
    if successful_sets:
        all_coverage = [r.get("component_coverage", 0) for r in results if r.get("success", False)]
        avg_coverage = sum(all_coverage) / len(all_coverage)
        print(f"\n📊 平均组件覆盖率: {avg_coverage*100:.1f}%")

    # 保存最终结果
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    results_file = f"evaluation_results/ai_all_results_{timestamp}.json"

    with open(results_file, "w", encoding="utf-8") as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "total": len(EVALUATION_SETS),
            "successful": len(successful_sets),
            "failed": len(EVALUATION_SETS) - len(successful_sets),
            "total_time_minutes": total_time / 60,
            "results": results
        }, f, ensure_ascii=False, indent=2)

    print(f"\n💾 完整结果已保存到: {results_file}")

    # 显示页面访问信息
    print("\n" + "="*70)
    print("🌐 前端页面访问")
    print("="*70)
    print("\n所有AI主题页面已生成，可以在浏览器中访问：\n")

    for eval_set in EVALUATION_SETS:
        if eval_set['set_id'] in successful_sets:
            print(f"  {eval_set['set_id']:12s} - {eval_set['topic']}")

    print(f"\n访问地址格式: http://localhost:8080/#/page/{{set_id}}")
    print(f"\n示例:")
    print(f"  http://localhost:8080/#/page/ai_001  - {EVALUATION_SETS[0]['topic']}")
    print(f"  http://localhost:8080/#/page/ai_010  - {EVALUATION_SETS[9]['topic']}")


if __name__ == "__main__":
    main()
