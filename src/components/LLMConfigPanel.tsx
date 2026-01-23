/**
 * LLM Configuration and Generation Panel
 *
 * 允许用户配置 LLM API 并生成内容
 */

import { useState } from 'react';
import { Settings, Send, Download, RefreshCw } from 'lucide-react';
import { createAgentGenerator, GenerationOptions, AgentType } from '../lib/agent-generator';
import { SchemaConverter } from '../lib/schema-converter';

interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'ollama' | 'azure-openai';
  apiKey: string;
  model?: string;
  baseURL?: string;
}

export const LLMConfigPanel = () => {
  const [config, setConfig] = useState<LLMConfig>({
    provider: 'openai',
    apiKey: '',
    model: 'gpt-3.5-turbo',
    baseURL: ''
  });

  const [topic, setTopic] = useState('');
  const [agentType, setAgentType] = useState<AgentType>('knowledge');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [convertedResult, setConvertedResult] = useState<any>(null);

  // 更新配置
  const updateConfig = (field: keyof LLMConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  // 生成内容
  const handleGenerate = async () => {
    if (!config.apiKey && config.provider !== 'ollama') {
      setError('请输入 API Key');
      return;
    }

    if (!topic.trim()) {
      setError('请输入生成主题');
      return;
    }

    setIsGenerating(true);
    setError('');
    setResult(null);
    setConvertedResult(null);

    try {
      // 创建 generator
      const generator = createAgentGenerator(config);

      // 配置生成选项
      const options: GenerationOptions = {
        topic: topic.trim(),
        agentType,
        difficulty: 'intermediate'
      };

      // 生成
      const generationResult = await generator.generate(options);

      if (!generationResult.success) {
        throw new Error(generationResult.error || '生成失败');
      }

      setResult(generationResult.data);

      // 转换 Schema
      const converted = SchemaConverter.convertPage(generationResult.data);
      setConvertedResult(converted);

    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // 下载 JSON
  const handleDownload = () => {
    if (!result) return;

    const dataStr = JSON.stringify(result, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.page_id || 'generated'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 下载转换后的 Schema
  const handleDownloadConverted = () => {
    if (!convertedResult) return;

    const dataStr = JSON.stringify(convertedResult, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result?.page_id || 'generated'}-converted.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">LLM 内容生成器</h1>
          <p className="text-muted-foreground">
            配置 LLM API 并自动生成教育内容
          </p>
        </div>
      </div>

      {/* Configuration */}
      <div className="border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">API 配置</h2>

        <div className="grid grid-cols-2 gap-4">
          {/* Provider */}
          <div>
            <label className="block text-sm font-medium mb-2">
              提供商
            </label>
            <select
              value={config.provider}
              onChange={(e) => updateConfig('provider', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="openai">OpenAI (GPT-3.5/4)</option>
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="ollama">Ollama (本地)</option>
              <option value="azure-openai">Azure OpenAI</option>
            </select>
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-medium mb-2">
              模型
            </label>
            <input
              type="text"
              value={config.model}
              onChange={(e) => updateConfig('model', e.target.value)}
              placeholder={config.provider === 'openai' ? 'gpt-3.5-turbo' :
                         config.provider === 'anthropic' ? 'claude-3-sonnet-20240229' :
                         config.provider === 'ollama' ? 'llama3' : ''}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          {/* API Key */}
          {config.provider !== 'ollama' && (
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">
                API Key
              </label>
              <input
                type="password"
                value={config.apiKey}
                onChange={(e) => updateConfig('apiKey', e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          )}

          {/* Base URL (optional) */}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-2">
              Base URL (可选)
            </label>
            <input
              type="text"
              value={config.baseURL}
              onChange={(e) => updateConfig('baseURL', e.target.value)}
              placeholder={config.provider === 'ollama' ? 'http://localhost:11434' : ''}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Generation */}
      <div className="border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">内容生成</h2>

        <div className="grid grid-cols-2 gap-4">
          {/* Agent Type */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Agent 类型
            </label>
            <select
              value={agentType}
              onChange={(e) => setAgentType(e.target.value as AgentType)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="knowledge">知识讲解 Agent</option>
              <option value="code">代码练习 Agent</option>
              <option value="quiz">测验生成 Agent</option>
            </select>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-medium mb-2">
              主题
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="例如：自然语言处理基础"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              生成内容
            </>
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">生成结果</h2>
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-accent"
              >
                <Download className="h-4 w-4" />
                简化格式
              </button>
              <button
                onClick={handleDownloadConverted}
                className="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-accent"
              >
                <Download className="h-4 w-4" />
                系统格式
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">标题：</span>
              {result.title}
            </div>
            <div>
              <span className="font-medium">Blocks：</span>
              {result.blocks?.length || 0}
            </div>
            <div>
              <span className="font-medium">类型：</span>
              {result.blocks?.map((b: any) => b.type).join(', ') || 'N/A'}
            </div>
          </div>

          {/* JSON Preview */}
          <div className="bg-muted p-4 rounded-md max-h-96 overflow-auto">
            <pre className="text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
