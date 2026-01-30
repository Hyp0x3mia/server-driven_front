#!/usr/bin/env python3
"""
OpenAI 兼容 API 配置助手

帮助你快速配置和使用 OpenAI 兼容的 API
"""

import os
import sys


def show_glm_config():
    """显示 GLM 配置"""
    print("\n" + "="*70)
    print("GLM (智谱) 配置指南")
    print("="*70)

    print("\n1️⃣  注册账号")
    print("   访问: https://open.bigmodel.cn/")
    print("   注册并获取 API Key")

    print("\n2️⃣  配置环境变量")
    print("   ```bash")
    print("   export GLM_API_KEY='your-glm-api-key'")
    print("   # 或使用通用变量")
    print("   export LLM_API_KEY='your-glm-api-key'")
    print("   export LLM_BASE_URL='https://open.bigmodel.cn/api/paas/v4/'")
    print("   export LLM_MODEL='glm-4-flash'")
    print("   ```")

    print("\n3️⃣  或创建 .env 文件")
    print("   ```bash")
    print("   cat > .env << 'EOF'")
    print("   GLM_API_KEY=your-glm-api-key")
    print("   GLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4/")
    print("   GLM_MODEL=glm-4-flash")
    print("   EOF")
    print("   ```")

    print("\n4️⃣  可用模型")
    print("   - glm-4-flash (推荐) - 快速经济")
    print("   - glm-4-plus - 更高质量")
    print("   - glm-4 - 最新模型")

    print("\n5️⃣  验证配置")
    print("   ```bash")
    print("   python test_imports.py")
    print("   ```")


def show_siliconflow_config():
    """显示 SiliconFlow 配置"""
    print("\n" + "="*70)
    print("SiliconFlow 配置指南")
    print("="*70)

    print("\n1️⃣  注册账号")
    print("   访问: https://cloud.siliconflow.cn/")
    print("   注册并获取 API Key")

    print("\n2️⃣  配置环境变量")
    print("   ```bash")
    print("   export LLM_API_KEY='sk-xxxxxxxxxxxxx'")
    print("   export LLM_BASE_URL='https://api.siliconflow.cn/v1'")
    print("   export LLM_MODEL='deepseek-ai/DeepSeek-V3'")
    print("   ```")

    print("\n3️⃣  或创建 .env 文件")
    print("   ```bash")
    print("   cat > .env << 'EOF'")
    print("   LLM_API_KEY=your-api-key")
    print("   LLM_BASE_URL=https://api.siliconflow.cn/v1")
    print("   LLM_MODEL=deepseek-ai/DeepSeek-V3")
    print("   EOF")
    print("   ```")

    print("\n4️⃣  验证配置")
    print("   ```bash")
    print("   python test_imports.py")
    print("   ```")


def show_openai_config():
    """显示 OpenAI 配置"""
    print("\n" + "="*70)
    print("OpenAI 配置指南")
    print("="*70)

    print("\n1️⃣  获取 API Key")
    print("   访问: https://platform.openai.com/api-keys")
    print("   创建新的 API Key")

    print("\n2️⃣  配置环境变量")
    print("   ```bash")
    print("   export OPENAI_API_KEY='sk-proj-xxxxxxxxxxxxx'")
    print("   export OPENAI_BASE_URL='https://api.openai.com/v1'")
    print("   ```")

    print("\n3️⃣  可用模型")
    print("   - gpt-4o (推荐)")
    print("   - gpt-4-turbo")
    print("   - gpt-3.5-turbo (最经济)")

    print("\n4️⃣  验证配置")
    print("   ```bash")
    print("   python test_imports.py")
    print("   ```")


def test_current_config():
    """测试当前配置"""
    print("\n" + "="*70)
    print("测试当前配置")
    print("="*70)

    try:
        from llm.client import create_llm_from_env

        llm = create_llm_from_env()

        print(f"\n✅ 配置成功！")
        print(f"   Base URL: {llm.base_url if hasattr(llm, 'base_url') else 'Default (OpenAI)'}")
        print(f"   Model: {llm.model_name}")
        print(f"   Temperature: {llm.temperature}")
        print(f"   Max Tokens: {llm.max_tokens}")

        print(f"\n📝 测试 LLM 连接...")
        test_response = llm.invoke("Hello!")
        print(f"   ✅ LLM 响应: {test_response.content[:50]}...")

        return True

    except Exception as e:
        print(f"\n❌ 配置失败: {e}")
        print(f"\n💡 请检查:")
        print(f"   1. 是否设置了 LLM_API_KEY 或 OPENAI_API_KEY")
        print(f"   2. API Key 是否正确")
        print(f"   3. Base URL 是否正确")
        print(f"   4. 是否安装了依赖: pip install -r requirements.txt")
        return False


def create_env_file():
    """创建 .env 文件"""
    print("\n" + "="*70)
    print("创建 .env 文件")
    print("="*70)

    print("\n选择你的 API 提供商:")
    print("  1. GLM (智谱) - 推荐用于中文")
    print("  2. SiliconFlow")
    print("  3. OpenAI")
    print("  4. 自定义")

    choice = input("\n请选择 (1/2/3/4): ").strip()

    if choice == "1":
        env_content = """# GLM (智谱) 配置
GLM_API_KEY=your-glm-api-key
GLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4/
GLM_MODEL=glm-4-flash
LLM_TEMPERATURE=0.3
"""
    elif choice == "2":
        env_content = """# SiliconFlow 配置
LLM_API_KEY=your-siliconflow-api-key
LLM_BASE_URL=https://api.siliconflow.cn/v1
LLM_MODEL=deepseek-ai/DeepSeek-V3
LLM_TEMPERATURE=0.3
"""
    elif choice == "3":
        env_content = """# OpenAI 配置
OPENAI_API_KEY=your-openai-api-key
OPENAI_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o
LLM_TEMPERATURE=0.3
"""
    else:
        api_key = input("请输入你的 API Base URL: ").strip()
        model = input("请输入模型名称: ").strip()
        env_content = f"""# 自定义 OpenAI 兼容 API
LLM_API_KEY=your-api-key
LLM_BASE_URL={api_key}
LLM_MODEL={model}
LLM_TEMPERATURE=0.3
"""

    with open(".env", "w") as f:
        f.write(env_content)

    print(f"\n✅ .env 文件已创建")
    print(f"   ⚠️  请编辑 .env 文件，填入你的 API Key")
    print(f"   然后运行: source .env")


def main():
    print("\n" + "="*70)
    print("🚀 OpenAI 兼容 API 配置助手")
    print("="*70)

    print("\n当前项目支持任何 OpenAI 兼容的 API：")
    print("  ✅ GLM (智谱) - 推荐用于中文内容")
    print("  ✅ SiliconFlow - 中文优化")
    print("  ✅ OpenAI - 官方 API")
    print("  ✅ Azure OpenAI")
    print("  ✅ 其他兼容服务")

    print("\n可用操作:")
    print("  1. 查看 GLM (智谱) 配置指南")
    print("  2. 查看 SiliconFlow 配置指南")
    print("  3. 查看 OpenAI 配置指南")
    print("  4. 测试当前配置")
    print("  5. 创建 .env 文件")
    print("  6. 退出")

    while True:
        choice = input("\n请选择操作 (1-6): ").strip()

        if choice == "1":
            show_glm_config()
        elif choice == "2":
            show_siliconflow_config()
        elif choice == "3":
            show_openai_config()
        elif choice == "4":
            test_current_config()
        elif choice == "5":
            create_env_file()
        elif choice == "6":
            print("\n👋 再见！")
            print("💡 提示: 配置完成后，运行 'python test_imports.py' 验证")
            break
        else:
            print("\n❌ 无效选择，请输入 1-6")


if __name__ == "__main__":
    main()
