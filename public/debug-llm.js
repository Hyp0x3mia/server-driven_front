/**
 * LLM 响应调试工具
 *
 * 用于诊断 LLM 返回的原始响应，帮助定位 JSON 解析问题
 */

(async function debugLLMResponse() {
  console.log('🔍 LLM 响应调试工具\n');

  // 1. 检查配置
  if (typeof llm === 'undefined' || !llm.config) {
    console.error('❌ llm 对象未找到！请确保在正确的页面运行。');
    return;
  }

  console.log('✅ 配置已加载:');
  console.log('   提供商:', llm.config.provider);
  console.log('   模型:', llm.config.model);
  console.log('   Base URL:', llm.config.baseURL);
  console.log('');

  // 2. 准备一个极简的测试路径（只包含 1 个知识点）
  console.log('📋 准备测试知识路径（1个知识点）...\n');

  const testPath = [
    {
      knowledge_id: "TEST-001",
      name: "React Hooks 简介",
      description: "React Hooks 是 React 16.8 引入的新特性",
      domain: "前端开发",
      subdomain: "React",
      difficulty: 1,
      cognitive_level: "COG_L1",
      importance: 0.9,
      abstraction: 2,
      estimated_time: 5,
      is_key_point: true,
      is_difficult: false,
      prerequisites: [],
      successors: [],
      keywords: ["React", "Hooks"],
      application_scenarios: [],
      common_misconceptions: [],
      mastery_criteria: "理解 Hooks 基本概念"
    }
  ];

  console.log('🎯 开始生成内容（这可能需要 10-30 秒）...\n');
  console.log('⏳ 请稍候...\n');

  const startTime = Date.now();

  try {
    // 直接调用底层的 PathBasedContentGenerator
    const generator = llm.pathGenerator;

    if (!generator) {
      throw new Error('pathGenerator 未找到');
    }

    // 调用 generate 方法（会触发所有日志）
    const result = await generator.generate({
      knowledge_path: testPath,
      style: 'comprehensive'
    });

    const duration = Date.now() - startTime;

    console.log('\n' + '='.repeat(60));
    console.log('✅ 生成成功！');
    console.log('='.repeat(60));
    console.log(`⏱️  耗时: ${duration}ms`);
    console.log(`📄 页面 ID: ${result.page_id}`);
    console.log(`📝 标题: ${result.title}`);
    console.log(`📦 Block 数量: ${result.blocks?.length || 0}`);
    console.log('');

    // 显示每个 block 的信息
    if (result.blocks) {
      console.log('📋 生成的内容块:');
      result.blocks.forEach((block, index) => {
        const hasContent = block.content ? '✅' : '❌';
        console.log(`   ${index + 1}. ${block.type} - ${block.title || '无标题'} ${hasContent}`);
      });
    }

    console.log('');
    console.log('💾 正在下载...');
    llm.download(result.data, `debug-test-${Date.now()}.json`);

    console.log('\n🎉 测试完成！');
    console.log('\n💡 提示:');
    console.log('   - 如果成功，说明系统工作正常');
    console.log('   - 可以尝试增加知识点数量');
    console.log('   - 如果之前失败，可能是 14 个知识点太多了');

  } catch (error) {
    const duration = Date.now() - startTime;

    console.log('\n' + '='.repeat(60));
    console.log('❌ 生成失败！');
    console.log('='.repeat(60));
    console.log(`⏱️  失败前耗时: ${duration}ms\n`);

    console.log('🔍 错误详情:');
    console.error(error);
    console.log('');

    // 分析错误
    const errorMsg = error?.message || String(error);

    if (errorMsg.includes('JSON') || errorMsg.includes('parse')) {
      console.log('📊 JSON 解析错误分析:');
      console.log('   ⚠️  LLM 返回的内容不是有效的 JSON');
      console.log('');
      console.log('   可能的原因:');
      console.log('     1. LLM 在 JSON 中途停止生成（token 限制）');
      console.log('     2. JSON 格式不正确（缺少逗号、括号不匹配等）');
      console.log('     3. 包含了非 JSON 文本（解释性文字）');
      console.log('');
      console.log('   建议的解决方案:');
      console.log('     ✅ 查看上面的 "Response preview" 了解截断位置');
      console.log('     ✅ 尝试使用不同的模型（如 GPT-4）');
      console.log('     ✅ 减少知识点数量（从 1-2 个开始）');
      console.log('     ✅ 使用 style: "concise" 生成更简洁的内容');

    } else if (errorMsg.includes('API') || errorMsg.includes('fetch') || errorMsg.includes('network')) {
      console.log('📊 网络错误分析:');
      console.log('   ⚠️  无法连接到 LLM API');
      console.log('');
      console.log('   可能的原因:');
      console.log('     1. API Key 错误或过期');
      console.log('     2. 网络连接问题');
      console.log('     3. API 服务不可用');
      console.log('     4. Base URL 配置错误');
      console.log('');
      console.log('   建议的解决方案:');
      console.log('     ✅ 检查 .env 文件中的配置');
      console.log('     ✅ 检查网络连接');
      console.log('     ✅ 尝试访问 Base URL 测试连通性');
      console.log(`     ✅ 当前 Base URL: ${llm.config.baseURL}`);

    } else if (errorMsg.includes('timeout')) {
      console.log('📊 超时错误分析:');
      console.log('   ⚠️  请求超时');
      console.log('');
      console.log('   可能的原因:');
      console.log('     1. 网络连接缓慢');
      console.log('     2. LLM 处理时间过长');
      console.log('     3. 知识路径太复杂');
      console.log('');
      console.log('   建议的解决方案:');
      console.log('     ✅ 检查网络连接');
      console.log('     ✅ 减少知识点数量');
      console.log('     ✅ 使用 style: "concise"');

    } else {
      console.log('📊 未知错误:');
      console.log('   ⚠️  无法分类的错误');
      console.log('');
      console.log('   请查看上面的错误详情');
    }

    console.log('\n📚 相关文档:');
    console.log('   - JSON_PARSING_FIX.md');
    console.log('   - TESTING_GUIDE.md');
    console.log('   - PATH_BASED_GENERATION.md');
  }

  console.log('\n' + '='.repeat(60) + '\n');
})();
