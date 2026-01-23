/**
 * 快速测试脚本 - 在浏览器控制台直接运行
 *
 * 使用方法：
 * 1. 复制整个脚本到浏览器控制台
 * 2. 脚本会自动测试生成功能
 * 3. 结果会显示在控制台并自动下载
 */

(async function testPathBasedGeneration() {
  console.log('🧪 开始测试路径生成功能...\n');

  // 1. 检查配置
  console.log('📋 步骤 1: 检查配置');
  if (typeof llm === 'undefined') {
    console.error('❌ llm 对象未找到！请确保在正确的页面运行此脚本。');
    return;
  }

  console.log('✅ llm 对象已加载');
  console.log('   配置信息:', {
    provider: llm.config?.provider,
    baseURL: llm.config?.baseURL,
    model: llm.config?.model
  });

  if (!llm.config?.apiKey || llm.config.apiKey.includes('your-')) {
    console.warn('⚠️  API Key 似乎未配置，请检查 .env 文件');
  }

  console.log('');

  // 2. 准备测试用的知识路径（3 个简化知识点）
  console.log('📋 步骤 2: 准备测试知识路径');

  const testPath = [
    {
      knowledge_id: "TEST-001",
      name: "React Hooks 简介",
      description: "React Hooks 是 React 16.8 引入的新特性，让你在不编写 class 的情况下使用 state 和其他 React 特性。",
      domain: "前端开发",
      subdomain: "React",
      difficulty: 2,
      cognitive_level: "COG_L2",
      importance: 0.9,
      abstraction: 3,
      estimated_time: 10,
      is_key_point: true,
      is_difficult: false,
      prerequisites: [],
      successors: ["TEST-002"],
      keywords: ["React", "Hooks", "状态管理"],
      application_scenarios: ["函数组件开发", "状态管理"],
      common_misconceptions: ["Hooks 只能在函数组件中使用", "Hooks 不能在循环条件中调用"],
      mastery_criteria: "能够理解 Hooks 的作用和基本使用规则"
    },
    {
      knowledge_id: "TEST-002",
      name: "useState Hook",
      description: "useState 是 React 提供的最基础的 Hook，用于在函数组件中添加状态管理功能。",
      domain: "前端开发",
      subdomain: "React",
      difficulty: 1,
      cognitive_level: "COG_L3",
      importance: 0.95,
      abstraction: 2,
      estimated_time: 15,
      is_key_point: true,
      is_difficult: false,
      prerequisites: ["TEST-001"],
      successors: ["TEST-003"],
      keywords: ["useState", "状态", "函数组件"],
      application_scenarios: ["表单输入", "计数器", "数据展示"],
      common_misconceptions: ["直接修改 state 不会触发重新渲染", "state 更新是异步的"],
      mastery_criteria: "能够使用 useState 管理简单的组件状态"
    },
    {
      knowledge_id: "TEST-003",
      name: "useEffect Hook",
      description: "useEffect 用于处理副作用操作，如数据获取、订阅、手动修改 DOM 等。",
      domain: "前端开发",
      subdomain: "React",
      difficulty: 3,
      cognitive_level: "COG_L3",
      importance: 0.9,
      abstraction: 3,
      estimated_time: 20,
      is_key_point: true,
      is_difficult: true,
      prerequisites: ["TEST-001"],
      successors: [],
      keywords: ["useEffect", "副作用", "生命周期"],
      application_scenarios: ["API 调用", "事件监听", "定时器"],
      common_misconceptions: ["useEffect 不能缺少依赖数组", "每次渲染都会执行 effect"],
      mastery_criteria: "能够使用 useEffect 处理组件的副作用操作"
    }
  ];

  console.log(`✅ 准备了 ${testPath.length} 个测试知识点`);
  console.log('   知识点列表:', testPath.map(kp => kp.name));
  console.log('');

  // 3. 测试生成功能
  console.log('📋 步骤 3: 测试内容生成');
  console.log('   正在调用 LLM 生成内容...');
  console.log('   ⏳ 请稍候（可能需要 10-30 秒）...\n');

  const startTime = Date.now();

  try {
    const data = await llm.generateFromPath({
      knowledge_path: testPath,
      style: 'comprehensive'
    });

    const duration = Date.now() - startTime;

    console.log('\n✅ 生成成功！');
    console.log(`   ⏱️  耗时: ${duration}ms`);
    console.log(`   📄 页面 ID: ${data.page_id}`);
    console.log(`   📝 标题: ${data.title}`);
    console.log(`   📦 Block 数量: ${data.blocks?.length || 0}`);
    console.log('');

    // 4. 显示生成的 blocks
    console.log('📋 生成的内容块:');
    data.blocks?.forEach((block, index) => {
      console.log(`   ${index + 1}. ${block.type} - ${block.title || '无标题'}`);
    });
    console.log('');

    // 5. 自动下载
    const filename = `test-react-hooks-${Date.now()}.json`;
    console.log(`📥 自动下载结果: ${filename}`);
    llm.download(data, filename);

    console.log('\n🎉 测试完成！文件已下载。');
    console.log('\n💡 提示:');
    console.log('   - 你可以使用以下命令查看完整数据:');
    console.log('     console.log(data)');
    console.log('   - 或者使用以下命令重新下载:');
    console.log(`     llm.download(data, 'custom-name.json')`);

  } catch (error) {
    const duration = Date.now() - startTime;

    console.log('\n❌ 生成失败！');
    console.log(`   ⏱️  失败前耗时: ${duration}ms`);
    console.log('\n错误信息:');
    console.error(error);

    console.log('\n🔍 诊断建议:');

    // 分析错误类型
    const errorMsg = error?.message || String(error);

    if (errorMsg.includes('JSON')) {
      console.log('   ⚠️  JSON 解析错误');
      console.log('   可能原因:');
      console.log('     1. LLM 返回的 JSON 格式不正确');
      console.log('     2. 响应被截断（token 限制）');
      console.log('   解决方案:');
      console.log('     - 查看错误信息中的 "Response preview"');
      console.log('     - 尝试使用 style: "concise" 减少内容');
      console.log('     - 减少知识点数量');
    } else if (errorMsg.includes('API') || errorMsg.includes('fetch')) {
      console.log('   ⚠️  API 调用错误');
      console.log('   可能原因:');
      console.log('     1. API Key 错误或过期');
      console.log('     2. 网络连接问题');
      console.log('     3. API 服务不可用');
      console.log('   解决方案:');
      console.log('     - 检查 .env 文件中的 API 配置');
      console.log('     - 检查网络连接');
      console.log('     - 尝试访问 API baseURL 测试连通性');
    } else if (errorMsg.includes('timeout')) {
      console.log('   ⚠️  请求超时');
      console.log('   解决方案:');
      console.log('     - 检查网络连接');
      console.log('     - 减少知识点数量以缩短处理时间');
      console.log('     - 检查 API 服务状态');
    } else {
      console.log('   ⚠️  未知错误');
      console.log('   请查看上面的错误详情');
    }

    console.log('\n📚 相关文档:');
    console.log('   - JSON_PARSING_FIX.md: JSON 解析问题排查');
    console.log('   - PATH_BASED_GENERATION.md: 使用指南');
  }

  console.log('\n' + '='.repeat(60));
})();
