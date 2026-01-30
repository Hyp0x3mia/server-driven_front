#!/usr/bin/env python3
"""
评测集 - 10个AI通识内容生成样本

每个样本都围绕人工智能的不同主题，并尽可能使用所有8个组件：
- Hero: 页面介绍
- Markdown: 通用内容
- Flashcard: 单个翻转卡片
- FlashcardGrid: 多个翻转卡片网格
- CardGrid: 卡片网格
- Timeline: 时间线
- Cloze: 填空题
- CodePlayground: 代码游乐场
"""

import json
import os
from typing import List, Dict

# ============ AI通识评测集配置 ============

EVALUATION_SETS = [
    {
        "set_id": "ai_001",
        "domain": "人工智能",
        "topic": "人工智能基础概念",
        "target_audience": "AI初学者",
        "difficulty": "beginner",
        "user_intent": "全面了解AI的基本定义、特征和分类",
        "expected_components": ["Hero", "Flashcard", "CardGrid", "Markdown"],
        "knowledge_points": [
            {
                "knowledge_id": "AI-001",
                "name": "什么是人工智能",
                "description": "人工智能是计算机科学的一个分支，致力于创建能够模拟人类智能的系统",
                "domain": "人工智能",
                "subdomain": "基础概念",
                "difficulty": 1,
                "cognitive_level": "COG_L1",
                "importance": 1.0,
                "abstraction": 2,
                "estimated_time": 20,
                "is_key_point": True,
                "is_difficult": False,
                "prerequisites": [],
                "successors": ["AI-002", "AI-003"],
                "keywords": ["人工智能", "AI", "机器智能", "图灵测试"],
                "application_scenarios": ["智能助手", "自动驾驶"],
                "common_misconceptions": ["AI就是机器人", "AI能完全替代人类"],
                "mastery_criteria": "能够准确定义人工智能，并说出其三大核心要素"
            },
            {
                "knowledge_id": "AI-002",
                "name": "AI的分类层次",
                "description": "根据智能水平，AI可分为弱人工智能、强人工智能和超人工智能",
                "domain": "人工智能",
                "subdomain": "基础概念",
                "difficulty": 1,
                "cognitive_level": "COG_L2",
                "importance": 0.9,
                "abstraction": 3,
                "estimated_time": 15,
                "is_key_point": True,
                "is_difficult": False,
                "prerequisites": ["AI-001"],
                "successors": ["AI-003"],
                "keywords": ["弱AI", "强AI", "超AI", "ANI", "AGI"],
                "application_scenarios": [],
                "common_misconceptions": ["现在的AI已经是强AI了"],
                "mastery_criteria": "能够区分弱AI、强AI和超AI，并举例说明"
            },
            {
                "knowledge_id": "AI-003",
                "name": "AI的主要分支",
                "description": "人工智能包括机器学习、深度学习、自然语言处理等多个分支",
                "domain": "人工智能",
                "subdomain": "基础概念",
                "difficulty": 2,
                "cognitive_level": "COG_L2",
                "importance": 0.9,
                "abstraction": 3,
                "estimated_time": 25,
                "is_key_point": True,
                "is_difficult": False,
                "prerequisites": ["AI-001", "AI-002"],
                "successors": [],
                "keywords": ["机器学习", "深度学习", "NLP", "计算机视觉", "专家系统"],
                "application_scenarios": [],
                "common_misconceptions": ["深度学习就是AI的全部"],
                "mastery_criteria": "能够列举AI的主要分支及其应用领域"
            }
        ]
    },

    {
        "set_id": "ai_002",
        "domain": "人工智能",
        "topic": "AI发展历史",
        "target_audience": "对AI历史感兴趣的读者",
        "difficulty": "beginner",
        "user_intent": "了解AI从诞生到现在的关键发展历程",
        "expected_components": ["Hero", "Timeline", "CardGrid", "Markdown"],
        "knowledge_points": [
            {
                "knowledge_id": "AI-H-001",
                "name": "AI的诞生（1950-1969）",
                "description": "人工智能作为一个学科正式诞生，图灵测试和达特茅斯会议",
                "domain": "人工智能",
                "subdomain": "历史发展",
                "difficulty": 1,
                "cognitive_level": "COG_L1",
                "importance": 0.9,
                "abstraction": 2,
                "estimated_time": 20,
                "is_key_point": True,
                "is_difficult": False,
                "prerequisites": [],
                "successors": ["AI-H-002", "AI-H-003"],
                "keywords": ["图灵测试", "达特茅斯会议", "逻辑理论家", "感知机"],
                "application_scenarios": [],
                "common_misconceptions": ["AI是最近才出现的"],
                "mastery_criteria": "能够说出AI诞生的标志性事件"
            },
            {
                "knowledge_id": "AI-H-002",
                "name": "AI的起伏发展（1970-1999）",
                "description": "AI经历了两次寒冬和复兴期，专家系统和神经网络的发展",
                "domain": "人工智能",
                "subdomain": "历史发展",
                "difficulty": 2,
                "cognitive_level": "COG_L2",
                "importance": 0.8,
                "abstraction": 3,
                "estimated_time": 25,
                "is_key_point": True,
                "is_difficult": False,
                "prerequisites": ["AI-H-001"],
                "successors": ["AI-H-003"],
                "keywords": ["AI寒冬", "专家系统", "反向传播", "深蓝"],
                "application_scenarios": [],
                "common_misconceptions": ["AI发展一直很顺利"],
                "mastery_criteria": "理解AI寒冬的原因和复苏的动力"
            },
            {
                "knowledge_id": "AI-H-003",
                "name": "深度学习时代（2000至今）",
                "description": "大数据和算力推动AI进入新时代，AlphaGo和大语言模型",
                "domain": "人工智能",
                "subdomain": "历史发展",
                "difficulty": 2,
                "cognitive_level": "COG_L2",
                "importance": 1.0,
                "abstraction": 3,
                "estimated_time": 25,
                "is_key_point": True,
                "is_difficult": False,
                "prerequisites": ["AI-H-001", "AI-H-002"],
                "successors": [],
                "keywords": ["深度学习", "AlexNet", "AlphaGo", "Transformer", "GPT"],
                "application_scenarios": [],
                "common_misconceptions": [],
                "mastery_criteria": "能够概述深度学习时代的标志性突破"
            }
        ]
    },

    {
        "set_id": "ai_003",
        "domain": "人工智能",
        "topic": "机器学习基础",
        "target_audience": "技术背景的初学者",
        "difficulty": "intermediate",
        "user_intent": "理解机器学习的核心概念和工作原理",
        "expected_components": ["Hero", "FlashcardGrid", "Cloze", "Markdown"],
        "knowledge_points": [
            {
                "knowledge_id": "ML-001",
                "name": "什么是机器学习",
                "description": "机器学习是让计算机从数据中学习规律的方法",
                "domain": "人工智能",
                "subdomain": "机器学习",
                "difficulty": 2,
                "cognitive_level": "COG_L2",
                "importance": 1.0,
                "abstraction": 3,
                "estimated_time": 25,
                "is_key_point": True,
                "is_difficult": False,
                "prerequisites": [],
                "successors": ["ML-002", "ML-003"],
                "keywords": ["机器学习", "数据驱动", "算法", "模型", "训练"],
                "application_scenarios": ["推荐系统", "垃圾邮件过滤"],
                "common_misconceptions": ["机器学习就是编程", "机器学习能自动学习不需要数据"],
                "mastery_criteria": "理解机器学习的定义和与传统编程的区别"
            },
            {
                "knowledge_id": "ML-002",
                "name": "机器学习的三大范式",
                "description": "监督学习、无监督学习和强化学习",
                "domain": "人工智能",
                "subdomain": "机器学习",
                "difficulty": 2,
                "cognitive_level": "COG_L2",
                "importance": 0.9,
                "abstraction": 3,
                "estimated_time": 30,
                "is_key_point": True,
                "is_difficult": False,
                "prerequisites": ["ML-001"],
                "successors": ["ML-003"],
                "keywords": ["监督学习", "无监督学习", "强化学习", "标注数据", "奖励"],
                "application_scenarios": ["图像分类", "聚类", "游戏AI"],
                "common_misconceptions": ["监督学习比无监督学习更高级"],
                "mastery_criteria": "能够区分三种学习范式并举例"
            },
            {
                "knowledge_id": "ML-003",
                "name": "训练、验证和测试",
                "description": "机器学习模型的开发流程和评估方法",
                "domain": "人工智能",
                "subdomain": "机器学习",
                "difficulty": 3,
                "cognitive_level": "COG_L3",
                "importance": 0.9,
                "abstraction": 4,
                "estimated_time": 30,
                "is_key_point": True,
                "is_difficult": True,
                "prerequisites": ["ML-001", "ML-002"],
                "successors": [],
                "keywords": ["训练集", "验证集", "测试集", "过拟合", "准确率"],
                "application_scenarios": [],
                "common_misconceptions": ["模型在训练集上表现好就是好模型"],
                "mastery_criteria": "理解机器学习的标准开发流程"
            }
        ]
    },

    {
        "set_id": "ai_004",
        "domain": "人工智能",
        "topic": "神经网络与深度学习",
        "target_audience": "AI学习者",
        "difficulty": "intermediate",
        "user_intent": "深入理解神经网络的结构和深度学习原理",
        "expected_components": ["Hero", "CodePlayground", "FlashcardGrid", "Markdown"],
        "knowledge_points": [
            {
                "knowledge_id": "DL-001",
                "name": "神经元模型",
                "description": "人工神经元模拟生物神经元的工作方式",
                "domain": "人工智能",
                "subdomain": "深度学习",
                "difficulty": 2,
                "cognitive_level": "COG_L2",
                "importance": 0.9,
                "abstraction": 3,
                "estimated_time": 25,
                "is_key_point": True,
                "is_difficult": False,
                "prerequisites": [],
                "successors": ["DL-002", "DL-003"],
                "keywords": ["感知机", "激活函数", "权重", "偏置"],
                "application_scenarios": [],
                "common_misconceptions": ["人工神经元和生物神经元完全一样"],
                "mastery_criteria": "理解神经元的工作原理"
            },
            {
                "knowledge_id": "DL-002",
                "name": "前向神经网络",
                "description": "多层神经网络的结构和前向传播过程",
                "domain": "人工智能",
                "subdomain": "深度学习",
                "difficulty": 3,
                "cognitive_level": "COG_L3",
                "importance": 0.9,
                "abstraction": 4,
                "estimated_time": 30,
                "is_key_point": True,
                "is_difficult": True,
                "prerequisites": ["DL-001"],
                "successors": ["DL-003"],
                "keywords": ["输入层", "隐藏层", "输出层", "全连接"],
                "application_scenarios": ["手写数字识别", "分类问题"],
                "common_misconceptions": [],
                "mastery_criteria": "理解神经网络的结构和数据流动"
            },
            {
                "knowledge_id": "DL-003",
                "name": "深度学习的兴起",
                "description": "深度学习在图像、语音等领域的突破性进展",
                "domain": "人工智能",
                "subdomain": "深度学习",
                "difficulty": 3,
                "cognitive_level": "COG_L2",
                "importance": 0.9,
                "abstraction": 4,
                "estimated_time": 25,
                "is_key_point": True,
                "is_difficult": False,
                "prerequisites": ["DL-001", "DL-002"],
                "successors": [],
                "keywords": ["CNN", "RNN", "Attention", "Transformer", "GPT"],
                "application_scenarios": ["计算机视觉", "语音识别", "机器翻译"],
                "common_misconceptions": ["深度学习只是更深的神经网络"],
                "mastery_criteria": "了解深度学习的主要架构和应用"
            }
        ]
    },

    {
        "set_id": "ai_005",
        "domain": "人工智能",
        "topic": "自然语言处理（NLP）",
        "target_audience": "对文本AI感兴趣的读者",
        "difficulty": "intermediate",
        "user_intent": "了解NLP如何让机器理解和生成人类语言",
        "expected_components": ["Hero", "CardGrid", "Timeline", "Markdown"],
        "knowledge_points": [
            {
                "knowledge_id": "NLP-001",
                "name": "NLP的定义和挑战",
                "description": "自然语言处理是AI的重要分支，处理人类语言的复杂性",
                "domain": "人工智能",
                "subdomain": "自然语言处理",
                "difficulty": 2,
                "cognitive_level": "COG_L1",
                "importance": 0.9,
                "abstraction": 3,
                "estimated_time": 20,
                "is_key_point": True,
                "is_difficult": False,
                "prerequisites": [],
                "successors": ["NLP-002", "NLP-003"],
                "keywords": ["NLP", "自然语言理解", "自然语言生成", "歧义性"],
                "application_scenarios": ["机器翻译", "智能客服"],
                "common_misconceptions": ["NLP只是简单的关键词匹配"],
                "mastery_criteria": "理解NLP的基本定义和核心挑战"
            },
            {
                "knowledge_id": "NLP-002",
                "name": "NLP的关键技术",
                "description": "分词、词向量、句法分析等NLP核心技术",
                "domain": "人工智能",
                "subdomain": "自然语言处理",
                "difficulty": 3,
                "cognitive_level": "COG_L2",
                "importance": 0.9,
                "abstraction": 4,
                "estimated_time": 30,
                "is_key_point": True,
                "is_difficult": True,
                "prerequisites": ["NLP-001"],
                "successors": ["NLP-003"],
                "keywords": ["分词", "词嵌入", "Word2Vec", "注意力机制"],
                "application_scenarios": ["文本分类", "情感分析"],
                "common_misconceptions": [],
                "mastery_criteria": "了解NLP的主要技术方法"
            },
            {
                "knowledge_id": "NLP-003",
                "name": "大语言模型时代",
                "description": "GPT、BERT等大语言模型带来的革命",
                "domain": "人工智能",
                "subdomain": "自然语言处理",
                "difficulty": 2,
                "cognitive_level": "COG_L2",
                "importance": 1.0,
                "abstraction": 4,
                "estimated_time": 25,
                "is_key_point": True,
                "is_difficult": False,
                "prerequisites": ["NLP-001", "NLP-002"],
                "successors": [],
                "keywords": ["GPT", "Transformer", "预训练", "微调", "提示工程"],
                "application_scenarios": ["对话系统", "文本生成", "代码生成"],
                "common_misconceptions": ["大模型完全理解语言"],
                "mastery_criteria": "理解大语言模型的基本原理和应用"
            }
        ]
    },

    {
        "set_id": "ai_006",
        "domain": "人工智能",
        "topic": "计算机视觉",
        "target_audience": "对图像AI感兴趣的读者",
        "difficulty": "intermediate",
        "user_intent": "了解AI如何看懂图像和视频",
        "expected_components": ["Hero", "Flashcard", "CardGrid", "CodePlayground"],
        "knowledge_points": [
            {
                "knowledge_id": "CV-001",
                "name": "计算机视觉概述",
                "description": "让计算机理解和分析视觉信息",
                "domain": "人工智能",
                "subdomain": "计算机视觉",
                "difficulty": 2,
                "cognitive_level": "COG_L1",
                "importance": 0.9,
                "abstraction": 3,
                "estimated_time": 20,
                "is_key_point": True,
                "is_difficult": False,
                "prerequisites": [],
                "successors": ["CV-002", "CV-003"],
                "keywords": ["计算机视觉", "图像处理", "模式识别", "像素"],
                "application_scenarios": ["人脸识别", "自动驾驶"],
                "common_misconceptions": ["计算机视觉就是摄像头"],
                "mastery_criteria": "理解计算机视觉的定义和应用范围"
            },
            {
                "knowledge_id": "CV-002",
                "name": "卷积神经网络（CNN）",
                "description": "CNN是处理图像的核心神经网络架构",
                "domain": "人工智能",
                "subdomain": "计算机视觉",
                "difficulty": 3,
                "cognitive_level": "COG_L3",
                "importance": 1.0,
                "abstraction": 5,
                "estimated_time": 30,
                "is_key_point": True,
                "is_difficult": True,
                "prerequisites": ["CV-001"],
                "successors": ["CV-003"],
                "keywords": ["CNN", "卷积层", "池化层", "特征提取"],
                "application_scenarios": ["图像分类", "目标检测"],
                "common_misconceptions": [],
                "mastery_criteria": "理解CNN的工作原理和优势"
            },
            {
                "knowledge_id": "CV-003",
                "name": "视觉任务和应用",
                "description": "分类、检测、分割等各种视觉任务",
                "domain": "人工智能",
                "subdomain": "计算机视觉",
                "difficulty": 3,
                "cognitive_level": "COG_L2",
                "importance": 0.9,
                "abstraction": 4,
                "estimated_time": 25,
                "is_key_point": True,
                "is_difficult": False,
                "prerequisites": ["CV-001", "CV-002"],
                "successors": [],
                "keywords": ["图像分类", "目标检测", "图像分割", "姿态估计"],
                "application_scenarios": ["医疗影像", "安防监控", "自动驾驶"],
                "common_misconceptions": [],
                "mastery_criteria": "了解主要的视觉任务类型"
            }
        ]
    },

    {
        "set_id": "ai_007",
        "domain": "人工智能",
        "topic": "AI伦理与安全",
        "target_audience": "关注AI社会影响的读者",
        "difficulty": "intermediate",
        "user_intent": "深入理解AI带来的伦理挑战和安全问题",
        "expected_components": ["Hero", "FlashcardGrid", "Cloze", "Markdown"],
        "knowledge_points": [
            {
                "knowledge_id": "ETHICS-001",
                "name": "AI伦理的核心问题",
                "description": "偏见、公平性、透明度和可解释性",
                "domain": "人工智能",
                "subdomain": "AI伦理",
                "difficulty": 2,
                "cognitive_level": "COG_L2",
                "importance": 1.0,
                "abstraction": 4,
                "estimated_time": 25,
                "is_key_point": True,
                "is_difficult": False,
                "prerequisites": [],
                "successors": ["ETHICS-002", "ETHICS-003"],
                "keywords": ["算法偏见", "公平性", "透明度", "可解释性"],
                "application_scenarios": ["招聘筛选", "贷款审批"],
                "common_misconceptions": ["AI是完全中立的"],
                "mastery_criteria": "能够识别AI系统中的伦理问题"
            },
            {
                "knowledge_id": "ETHICS-002",
                "name": "隐私与数据安全",
                "description": "AI系统对个人隐私和数据安全的影响",
                "domain": "人工智能",
                "subdomain": "AI伦理",
                "difficulty": 2,
                "cognitive_level": "COG_L2",
                "importance": 0.9,
                "abstraction": 3,
                "estimated_time": 25,
                "is_key_point": True,
                "is_difficult": False,
                "prerequisites": ["ETHICS-001"],
                "successors": ["ETHICS-003"],
                "keywords": ["数据隐私", "GDPR", "数据泄露", "联邦学习"],
                "application_scenarios": ["人脸识别", "推荐系统"],
                "common_misconceptions": [],
                "mastery_criteria": "了解AI相关的隐私问题和保护措施"
            },
            {
                "knowledge_id": "ETHICS-003",
                "name": "AI安全与对抗",
                "description": "对抗样本和AI系统的安全性",
                "domain": "人工智能",
                "subdomain": "AI伦理",
                "difficulty": 3,
                "cognitive_level": "COG_L3",
                "importance": 0.9,
                "abstraction": 4,
                "estimated_time": 30,
                "is_key_point": True,
                "is_difficult": True,
                "prerequisites": ["ETHICS-001", "ETHICS-002"],
                "successors": [],
                "keywords": ["对抗样本", "模型攻击", "鲁棒性", "AI安全"],
                "application_scenarios": ["自动驾驶", "金融风控"],
                "common_misconceptions": [],
                "mastery_criteria": "理解AI面临的安全威胁"
            }
        ]
    },

    {
        "set_id": "ai_008",
        "domain": "人工智能",
        "topic": "AI应用场景",
        "target_audience": "想了解AI实际应用的读者",
        "difficulty": "beginner",
        "user_intent": "全面了解AI在各行业的实际应用",
        "expected_components": ["Hero", "CardGrid", "Timeline", "Flashcard"],
        "knowledge_points": [
            {
                "knowledge_id": "APP-001",
                "name": "日常生活中的AI",
                "description": "手机、智能家居中的AI应用",
                "domain": "人工智能",
                "subdomain": "应用场景",
                "difficulty": 1,
                "cognitive_level": "COG_L1",
                "importance": 0.8,
                "abstraction": 2,
                "estimated_time": 20,
                "is_key_point": True,
                "is_difficult": False,
                "prerequisites": [],
                "successors": ["APP-002", "APP-003"],
                "keywords": ["智能助手", "推荐系统", "人脸解锁", "语音助手"],
                "application_scenarios": [],
                "common_misconceptions": [],
                "mastery_criteria": "能够列举日常生活中的AI应用"
            },
            {
                "knowledge_id": "APP-002",
                "name": "AI在医疗健康领域",
                "description": "医学影像分析、药物研发、健康监测",
                "domain": "人工智能",
                "subdomain": "应用场景",
                "difficulty": 2,
                "cognitive_level": "COG_L2",
                "importance": 0.9,
                "abstraction": 3,
                "estimated_time": 25,
                "is_key_point": True,
                "is_difficult": False,
                "prerequisites": ["APP-001"],
                "successors": ["APP-003"],
                "keywords": ["医学影像", "药物发现", "疾病预测", "个性化医疗"],
                "application_scenarios": [],
                "common_misconceptions": ["AI可以完全替代医生"],
                "mastery_criteria": "了解AI在医疗领域的主要应用"
            },
            {
                "knowledge_id": "APP-003",
                "name": "AI在各行业的应用",
                "description": "金融、教育、制造、交通等行业中的AI",
                "domain": "人工智能",
                "subdomain": "应用场景",
                "difficulty": 2,
                "cognitive_level": "COG_L2",
                "importance": 0.9,
                "abstraction": 3,
                "estimated_time": 30,
                "is_key_point": True,
                "is_difficult": False,
                "prerequisites": ["APP-001", "APP-002"],
                "successors": [],
                "keywords": ["金融科技", "智能教育", "工业4.0", "自动驾驶"],
                "application_scenarios": [],
                "common_misconceptions": [],
                "mastery_criteria": "能够列举AI在多个行业的应用案例"
            }
        ]
    },

    {
        "set_id": "ai_009",
        "domain": "人工智能",
        "topic": "AI工具与实践",
        "target_audience": "想动手实践AI的学习者",
        "difficulty": "intermediate",
        "user_intent": "了解常用的AI开发工具和入门实践",
        "expected_components": ["Hero", "CodePlayground", "FlashcardGrid", "CardGrid"],
        "knowledge_points": [
            {
                "knowledge_id": "TOOLS-001",
                "name": "Python与AI开发生态",
                "description": "Python是AI开发的主流语言及其生态系统",
                "domain": "人工智能",
                "subdomain": "AI工具",
                "difficulty": 2,
                "cognitive_level": "COG_L2",
                "importance": 0.9,
                "abstraction": 3,
                "estimated_time": 25,
                "is_key_point": True,
                "is_difficult": False,
                "prerequisites": [],
                "successors": ["TOOLS-002", "TOOLS-003"],
                "keywords": ["Python", "NumPy", "Pandas", "Scikit-learn"],
                "application_scenarios": [],
                "common_misconceptions": ["必须精通数学才能做AI"],
                "mastery_criteria": "了解AI开发的主要Python库"
            },
            {
                "knowledge_id": "TOOLS-002",
                "name": "深度学习框架",
                "description": "TensorFlow和PyTorch等主流框架",
                "domain": "人工智能",
                "subdomain": "AI工具",
                "difficulty": 3,
                "cognitive_level": "COG_L3",
                "importance": 0.9,
                "abstraction": 4,
                "estimated_time": 30,
                "is_key_point": True,
                "is_difficult": True,
                "prerequisites": ["TOOLS-001"],
                "successors": ["TOOLS-003"],
                "keywords": ["TensorFlow", "PyTorch", "Keras", "JAX"],
                "application_scenarios": [],
                "common_misconceptions": [],
                "mastery_criteria": "了解主流深度学习框架的特点"
            },
            {
                "knowledge_id": "TOOLS-003",
                "name": "AI实践入门",
                "description": "从零开始构建第一个AI模型",
                "domain": "人工智能",
                "subdomain": "AI工具",
                "difficulty": 2,
                "cognitive_level": "COG_L3",
                "importance": 0.8,
                "abstraction": 3,
                "estimated_time": 30,
                "is_key_point": True,
                "is_difficult": False,
                "prerequisites": ["TOOLS-001", "TOOLS-002"],
                "successors": [],
                "keywords": ["数据准备", "模型训练", "模型评估", "部署"],
                "application_scenarios": [],
                "common_misconceptions": [],
                "mastery_criteria": "理解AI项目的完整开发流程"
            }
        ]
    },

    {
        "set_id": "ai_010",
        "domain": "人工智能",
        "topic": "AI的未来发展趋势",
        "target_audience": "关注AI未来的读者",
        "difficulty": "intermediate",
        "user_intent": "探讨AI技术的发展方向和未来挑战",
        "expected_components": ["Hero", "Timeline", "FlashcardGrid", "Markdown"],
        "knowledge_points": [
            {
                "knowledge_id": "FUTURE-001",
                "name": "AGI与超级AI",
                "description": "通用人工智能（AGI）的愿景与挑战",
                "domain": "人工智能",
                "subdomain": "AI未来",
                "difficulty": 3,
                "cognitive_level": "COG_L2",
                "importance": 0.9,
                "abstraction": 5,
                "estimated_time": 25,
                "is_key_point": True,
                "is_difficult": True,
                "prerequisites": [],
                "successors": ["FUTURE-002", "FUTURE-003"],
                "keywords": ["AGI", "通用人工智能", "超级AI", "意识"],
                "application_scenarios": [],
                "common_misconceptions": ["AGI很快就会实现", "AGI会有人类意识"],
                "mastery_criteria": "理解AGI的概念和面临的挑战"
            },
            {
                "knowledge_id": "FUTURE-002",
                "name": "人机协作与AI增强",
                "description": "AI作为工具增强人类能力而非替代",
                "domain": "人工智能",
                "subdomain": "AI未来",
                "difficulty": 2,
                "cognitive_level": "COG_L2",
                "importance": 0.8,
                "abstraction": 4,
                "estimated_time": 25,
                "is_key_point": True,
                "is_difficult": False,
                "prerequisites": ["FUTURE-001"],
                "successors": ["FUTURE-003"],
                "keywords": ["人机协作", "AI增强", "增强智能", "Copilot"],
                "application_scenarios": [],
                "common_misconceptions": ["AI会全面取代人类工作"],
                "mastery_criteria": "理解人机协作的价值和意义"
            },
            {
                "knowledge_id": "FUTURE-003",
                "name": "AI发展趋势与挑战",
                "description": "AI技术的发展方向和需要解决的关键问题",
                "domain": "人工智能",
                "subdomain": "AI未来",
                "difficulty": 2,
                "cognitive_level": "COG_L2",
                "importance": 0.9,
                "abstraction": 4,
                "estimated_time": 30,
                "is_key_point": True,
                "is_difficult": False,
                "prerequisites": ["FUTURE-001", "FUTURE-002"],
                "successors": [],
                "keywords": ["多模态AI", "具身AI", "可解释AI", "绿色AI"],
                "application_scenarios": [],
                "common_misconceptions": [],
                "mastery_criteria": "了解AI的前沿发展方向"
            }
        ]
    }
]


# ============ 组件使用统计 ============

def analyze_component_coverage():
    """分析评测集的组件覆盖情况"""
    component_usage = {
        "Hero": 0,
        "Markdown": 0,
        "Flashcard": 0,
        "FlashcardGrid": 0,
        "CardGrid": 0,
        "Timeline": 0,
        "Cloze": 0,
        "CodePlayground": 0
    }

    subdomain_coverage = set()

    for eval_set in EVALUATION_SETS:
        subdomain_coverage.add(eval_set["subdomain"] if "subdomain" in eval_set else eval_set["topic"])
        for component in eval_set["expected_components"]:
            if component in component_usage:
                component_usage[component] += 1

    print("\n" + "="*70)
    print("AI通识评测集组件覆盖分析")
    print("="*70)
    print(f"\n📊 总样本数: {len(EVALUATION_SETS)}")
    print(f"🤖 所有样本都属于人工智能领域")
    print(f"📚 子主题覆盖: {len(subdomain_coverage)} 个")

    print(f"\n子主题列表:")
    for i, topic in enumerate(sorted(subdomain_coverage), 1):
        print(f"  {i}. {topic}")

    print(f"\n📦 组件使用统计:")
    for component, count in sorted(component_usage.items()):
        coverage = (count / len(EVALUATION_SETS)) * 100
        bar = "█" * int(coverage / 5)
        print(f"  {component:15s}: {count:2d}/10 ({coverage:5.1f}%) {bar}")

    total_possible = len(component_usage) * len(EVALUATION_SETS)
    actual_usage = sum(component_usage.values())
    overall_coverage = (actual_usage / total_possible) * 100
    print(f"\n✅ 组件总体覆盖率: {actual_usage}/{total_possible} ({overall_coverage:.1f}%)")


def export_evaluation_sets():
    """导出评测集为JSON文件"""
    os.makedirs("evaluation_sets", exist_ok=True)

    for eval_set in EVALUATION_SETS:
        filename = f"evaluation_sets/{eval_set['set_id']}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(eval_set, f, ensure_ascii=False, indent=2)
        print(f"✅ 导出: {filename}")

    # 导出完整列表
    with open("evaluation_sets/INDEX.json", 'w', encoding='utf-8') as f:
        json.dump({
            "total": len(EVALUATION_SETS),
            "domain": "人工智能",
            "description": "AI通识内容评测集",
            "sets": [{"id": s["set_id"], "topic": s["topic"], "difficulty": s["difficulty"]} for s in EVALUATION_SETS]
        }, f, ensure_ascii=False, indent=2)
    print(f"✅ 导出: evaluation_sets/INDEX.json")


def generate_prompt_for_set(set_id: str) -> str:
    """为评测集生成生成提示"""
    for eval_set in EVALUATION_SETS:
        if eval_set["set_id"] == set_id:
            prompt = f"""
# {eval_set['topic']}

## 基本信息
- 领域: {eval_set['domain']}
- 目标受众: {eval_set['target_audience']}
- 难度: {eval_set['difficulty']}
- 学习目标: {eval_set['user_intent']}

## 预期组件
{', '.join(eval_set['expected_components'])}

## 知识点数量
{len(eval_set['knowledge_points'])}

## 知识点概览
"""
            for kp in eval_set['knowledge_points']:
                prompt += f"""
### {kp['name']}
- 描述: {kp['description']}
- 难度: {kp['difficulty']}
- 关键词: {', '.join(kp['keywords'])}
"""
            return prompt
    return None


if __name__ == "__main__":
    print("\n" + "="*70)
    print("🤖 AI通识内容评测集")
    print("="*70)

    # 分析组件覆盖
    analyze_component_coverage()

    # 导出评测集
    print("\n" + "="*70)
    print("导出评测集文件")
    print("="*70)
    export_evaluation_sets()

    print("\n" + "="*70)
    print("💡 使用说明")
    print("="*70)
    print("""
1. 查看评测集概览:
   cat evaluation_sets/INDEX.json

2. 为特定评测集生成内容:
   from evaluation_set import generate_prompt_for_set
   prompt = generate_prompt_for_set("ai_001")

3. 批量生成评测:
   遍历 EVALUATION_SETS 列表，对每个样本调用 pipeline

4. 评测维度:
   - 组件多样性: 是否使用了预期的组件
   - 内容质量: 教育性、准确性、可读性
   - 组件适配度: 组件类型是否适合内容
   - AI主题覆盖: 不同AI子领域的覆盖情况
""")
