import React, { useState } from 'react';
import { CheckCircle, XCircle, Eye, FileText } from 'lucide-react';
import { SchemaConverter } from '@/lib/schema-converter';
import { EXAMPLE_PAGE } from '@/schemas/simplified';
import { Button } from '@/components/ui/button';

export const SchemaValidator = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [validationResult, setValidationResult] = useState<{
    success: boolean;
    errors?: string[];
    converted?: any;
  } | null>(null);

  const handleValidate = () => {
    try {
      // 1. 解析 JSON
      const parsed = JSON.parse(jsonInput);

      // 2. 转换 Schema
      const converted = SchemaConverter.convertPage(parsed);

      setValidationResult({
        success: true,
        converted
      });
    } catch (error) {
      setValidationResult({
        success: false,
        errors: [error instanceof Error ? error.message : '未知错误']
      });
    }
  };

  const handlePreview = () => {
    if (validationResult?.success && validationResult.converted) {
      // 保存到 LocalStorage 并跳转
      const pageId = `preview-${Date.now()}`;
      localStorage.setItem(`pages/${pageId}.json`, JSON.stringify(validationResult.converted));
      window.location.href = `#/page/${pageId}`;
    }
  };

  const loadExample = () => {
    setJsonInput(JSON.stringify(EXAMPLE_PAGE, null, 2));
  };

  const clearInput = () => {
    setJsonInput('');
    setValidationResult(null);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-300 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-3">
            Schema 验证器
          </h1>
          <p className="text-slate-400">
            验证 Agent 生成的 JSON 并预览页面效果
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Input */}
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex gap-3">
              <Button
                onClick={loadExample}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <FileText className="w-4 h-4 mr-2" />
                加载示例
              </Button>
              <Button
                onClick={clearInput}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                清空
              </Button>
            </div>

            {/* Input Area */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                粘贴 Agent 生成的 JSON
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{"page_id": "...", "title": "...", "blocks": [...]}'
                rows={20}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Validate Button */}
            <Button
              onClick={handleValidate}
              disabled={!jsonInput.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
            >
              验证并转换
            </Button>

            {/* Schema Reference */}
            <div className="mt-6 p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">
                简化 Schema 参考
              </h3>
              <div className="text-xs text-slate-400 font-mono space-y-2">
                <p><span className="text-blue-400">type:</span> 'hero' | 'markdown' | 'flashcard' | 'cardgrid' | 'timeline' | 'cloze'</p>
                <p><span className="text-blue-400">content:</span> string | { hero: {...} | flashcard: {...} | ... }</p>
                <p><span className="text-blue-400">metadata:</span> { agent_type, difficulty, keywords, ... }</p>
              </div>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="space-y-4">
            {/* Validation Result */}
            {validationResult && (
              <div>
                {validationResult.success ? (
                  <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <h3 className="font-semibold text-green-300">验证成功！</h3>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-green-200">
                        ✓ JSON 格式正确
                      </p>
                      <p className="text-sm text-green-200">
                        ✓ Schema 转换成功
                      </p>
                      <p className="text-sm text-green-200">
                        ✓ 可以预览页面
                      </p>
                    </div>

                    <Button
                      onClick={handlePreview}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      预览页面
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle className="w-5 h-5 text-red-400" />
                      <h3 className="font-semibold text-red-300">验证失败</h3>
                    </div>

                    <div className="space-y-1">
                      {validationResult.errors?.map((error, idx) => (
                        <p key={idx} className="text-sm text-red-200">
                          • {error}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!validationResult && (
              <div className="p-8 bg-slate-900/30 border border-slate-800 rounded-lg text-center">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500">
                  在左侧粘贴 JSON 并点击"验证并转换"
                </p>
              </div>
            )}

            {/* Converted Preview (Development) */}
            {validationResult?.success && validationResult.converted && (
              <div className="mt-4 p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">
                  转换后的 Schema
                </h3>
                <pre className="text-xs text-slate-400 overflow-auto max-h-96">
                  {JSON.stringify(validationResult.converted, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
