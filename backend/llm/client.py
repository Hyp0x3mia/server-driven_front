"""
Unified LLM Client for OpenAI-Compatible APIs

Supports:
- OpenAI
- Azure OpenAI
- SiliconFlow (OpenAI-compatible)
- GLM (智谱)
- Any other OpenAI-compatible API
"""

import os
from typing import Optional, Literal, Dict
from langchain_openai import ChatOpenAI


class LLMConfig:
    """LLM Configuration"""

    # Provider types
    PROVIDER_OPENAI = "openai"
    PROVIDER_AZURE = "azure"
    PROVIDER_SILICONFLOW = "siliconflow"
    PROVIDER_GLM = "glm"  # 智谱 GLM
    PROVIDER_CUSTOM = "custom"

    # Model mappings
    DEFAULT_MODELS: Dict[str, str] = {
        "openai": "gpt-4o",
        "azure": "gpt-4o",
        "siliconflow": "deepseek-ai/DeepSeek-V3",
        "glm": "glm-4-flash",  # GLM 默认模型
        "custom": "gpt-4o"
    }

    # Base URL mappings
    BASE_URLS: Dict[str, str] = {
        "openai": "https://api.openai.com/v1",
        "azure": "",  # Azure uses custom base URLs
        "siliconflow": "https://api.siliconflow.cn/v1",
        "glm": "https://open.bigmodel.cn/api/paas/v4/",  # GLM 官方 API
        "custom": ""
    }

    @classmethod
    def from_env(cls):
        """Load configuration from environment variables"""
        provider = os.getenv("LLM_PROVIDER", "custom")

        # GLM 专用检测
        if provider == "glm" or os.getenv("GLM_API_KEY"):
            return cls(
                provider="glm",
                api_key=os.getenv("GLM_API_KEY", os.getenv("LLM_API_KEY", "")),
                base_url=os.getenv("GLM_BASE_URL", "https://open.bigmodel.cn/api/paas/v4/"),
                model=os.getenv("GLM_MODEL", "glm-4-flash"),
                temperature=float(os.getenv("LLM_TEMPERATURE", "0.3")),
                max_tokens=int(os.getenv("LLM_MAX_TOKENS", "4096"))
            )

        return cls(
            provider=provider,
            api_key=os.getenv("LLM_API_KEY", os.getenv("OPENAI_API_KEY", "")),
            base_url=os.getenv("LLM_BASE_URL", os.getenv("OPENAI_BASE_URL")),
            model=os.getenv("LLM_MODEL"),
            temperature=float(os.getenv("LLM_TEMPERATURE", "0.3")),
            max_tokens=int(os.getenv("LLM_MAX_TOKENS", "4096"))
        )

    def __init__(
        self,
        provider: str = "custom",
        api_key: str = "",
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 4096
    ):
        self.provider = provider
        self.api_key = api_key
        self.base_url = base_url
        self.model = model or self.DEFAULT_MODELS.get(provider, "gpt-4o")
        self.temperature = temperature
        self.max_tokens = max_tokens

    def validate(self):
        """Validate configuration"""
        if not self.api_key:
            raise ValueError(
                "LLM_API_KEY is required. "
                "Set it via:\n"
                "  export LLM_API_KEY='your-api-key'\n"
                "  or\n"
                "  export OPENAI_API_KEY='your-api-key'"
            )


def create_llm(config: Optional[LLMConfig] = None) -> ChatOpenAI:
    """
    Create a ChatOpenAI instance with the given configuration.

    Args:
        config: LLM configuration. If None, loads from environment.

    Returns:
        Configured ChatOpenAI instance
    """
    if config is None:
        config = LLMConfig.from_env()

    config.validate()

    # Create ChatOpenAI instance
    kwargs = {
        "model": config.model,
        "api_key": config.api_key,
        "temperature": config.temperature,
        "max_tokens": config.max_tokens,
    }

    # Add base_url if provided (for custom APIs like SiliconFlow)
    if config.base_url:
        kwargs["base_url"] = config.base_url

    llm = ChatOpenAI(**kwargs)

    return llm


# ============ Convenience Functions ============

def create_llm_from_env() -> ChatOpenAI:
    """
    Create LLM instance from environment variables.

    Environment variables:
        LLM_PROVIDER: Provider type (default: custom)
        LLM_API_KEY: API key (or OPENAI_API_KEY)
        LLM_BASE_URL: Base URL (or OPENAI_BASE_URL)
        LLM_MODEL: Model name
        LLM_TEMPERATURE: Temperature (default: 0.3)
        LLM_MAX_TOKENS: Max tokens (default: 4096)

    Returns:
        Configured ChatOpenAI instance
    """
    return create_llm(LLMConfig.from_env())


# ============ Example Usage ============

if __name__ == "__main__":
    import os

    # Example 1: Use environment variables
    print("Example 1: From environment variables")
    print("Required: LLM_API_KEY or OPENAI_API_KEY")
    print("Optional: LLM_BASE_URL, LLM_MODEL")

    # Example 2: SiliconFlow configuration
    print("\n\nExample 2: SiliconFlow Configuration")
    siliconflow_config = LLMConfig(
        provider="custom",
        api_key="your-siliconflow-key",
        base_url="https://api.siliconflow.cn/v1",
        model="deepseek-ai/DeepSeek-V3",
        temperature=0.3
    )

    print(f"Provider: {siliconflow_config.provider}")
    print(f"Base URL: {siliconflow_config.base_url}")
    print(f"Model: {siliconflow_config.model}")

    # Example 3: OpenAI configuration
    print("\n\nExample 3: OpenAI Configuration")
    openai_config = LLMConfig(
        provider="openai",
        api_key="your-openai-key",
        model="gpt-4o",
        temperature=0.3
    )

    print(f"Provider: {openai_config.provider}")
    print(f"Model: {openai_config.model}")

    # Example 4: GLM configuration
    print("\n\nExample 4: GLM (智谱) Configuration")
    glm_config = LLMConfig(
        provider="glm",
        api_key="your-glm-key",
        base_url="https://open.bigmodel.cn/api/paas/v4/",
        model="glm-4-flash",
        temperature=0.3
    )

    print(f"Provider: {glm_config.provider}")
    print(f"Base URL: {glm_config.base_url}")
    print(f"Model: {glm_config.model}")
