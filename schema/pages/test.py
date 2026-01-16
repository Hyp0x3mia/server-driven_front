from prompts import *

import json
from openai import OpenAI

client = OpenAI(
    api_key="sk-uyicjepfspwxlnkrulijpkqotxrfjgkaupnsfiyrmngojvyf",
    base_url="https://api.siliconflow.cn/v1"
)

# 1. 知识点 JSON
knowledge = """
[
    {
        "knowledge_id": "D02-M01-K008",
        "name": "自然语言处理概述",
        "description": "自然语言处理是人工智能十分重要的研究领域，有漫长的发展历史、丰富的技术内涵和广泛的应用价值。本章对自然语言处理的学习进行基础性的引导，首先讲解作为文本分析基础的文本语义表示和相似性度量，然后介绍自然语言处理的经典任务，包括文本摘要、机器翻译、知识图谱等，以便使读者了解自然语言处理所要解决的主要问题和相应的技术方法。本章以目前自然语言处理领域的热门技术——大语言模型为重点讲解内容，并对国内著名的大语言模型的功能和应用进行介绍。",
        "domain": "自然语言处理",
        "subdomain": "领域概述",
        "difficulty": 1,
        "cognitive_level": "COG_L1",
        "importance": 0.8,
        "abstraction": 4,
        "estimated_time": 15,
        "is_key_point": true,
        "is_difficult": false,
        "prerequisites": [],
        "successors": [],
        "keywords": [
            "自然语言处理",
            "人工智能",
            "大语言模型",
            "经典任务",
            "技术方法"
        ],
        "application_scenarios": [
            "文本分析",
            "信息处理",
            "智能交互"
        ],
        "common_misconceptions": [],
        "mastery_criteria": "能够概述自然语言处理的定义、历史地位及主要技术方向"
    },
    {
        "knowledge_id": "D02-M01-K001",
        "name": "自然语言处理的定义与作用",
        "description": "自然语言处理（NLP）是引导机器模拟和延伸人类语言能力的基础性和关键性研究方向，包括自然语言的机器表示、分析、理解、生成等，其创造的相关技术已广泛应用于各行各业和日常生活。",
        "domain": "自然语言处理",
        "subdomain": "基础概念",
        "difficulty": 1,
        "cognitive_level": "COG_L1",
        "importance": 0.9,
        "abstraction": 3,
        "estimated_time": 15,
        "is_key_point": true,
        "is_difficult": false,
        "prerequisites": [],
        "successors": [],
        "keywords": [
            "自然语言处理",
            "NLP",
            "机器表示",
            "分析",
            "理解",
            "生成"
        ],
        "application_scenarios": [
            "各行各业",
            "日常生活"
        ],
        "common_misconceptions": [],
        "mastery_criteria": "能够解释自然语言处理的定义、作用及其应用领域"
    },
    {
        "knowledge_id": "D02-M01-K002",
        "name": "自然语言处理的4个历史阶段",
        "description": "自然语言处理的发展历程可分为4个阶段：1956年以前的萌芽期，1957-1970年的快速发展期，1971-1990年代初的低谷期和1990年代后期至今的复苏繁荣期。",
        "domain": "自然语言处理",
        "subdomain": "历史发展",
        "difficulty": 2,
        "cognitive_level": "COG_L2",
        "importance": 0.8,
        "abstraction": 4,
        "estimated_time": 20,
        "is_key_point": true,
        "is_difficult": false,
        "prerequisites": [],
        "successors": [],
        "keywords": [
            "历史阶段",
            "萌芽期",
            "快速发展期",
            "低谷期",
            "复苏繁荣期"
        ],
        "application_scenarios": [],
        "common_misconceptions": [],
        "mastery_criteria": "能够列举自然语言处理的4个历史阶段及其时间范围"
    },
    {
        "knowledge_id": "D02-M01-K003",
        "name": "1956年以前的萌芽期关键事件",
        "description": "1956年以前是自然语言处理的萌芽期，关键事件包括：1936年图灵提出图灵机概念、1946年电子计算机诞生、1948年Shannon利用概率方法描述语言、1956年Chomsky提出上下文无关语法，这些工作开辟了基于规则和基于概率两种技术路线。",
        "domain": "自然语言处理",
        "subdomain": "萌芽期",
        "difficulty": 3,
        "cognitive_level": "COG_L3",
        "importance": 0.7,
        "abstraction": 3,
        "estimated_time": 30,
        "is_key_point": true,
        "is_difficult": true,
        "prerequisites": [],
        "successors": [],
        "keywords": [
            "萌芽期",
            "图灵机",
            "Shannon",
            "Chomsky",
            "上下文无关语法",
            "规则方法",
            "概率方法"
        ],
        "application_scenarios": [],
        "common_misconceptions": [],
        "mastery_criteria": "能够描述1956年以前自然语言处理萌芽期的关键事件和所开辟的技术路线"
    },
    {
        "knowledge_id": "D02-M01-K004",
        "name": "1957-1970年快速发展期的两大阵营",
        "description": "1957-1970年自然语言处理进入快速发展期，形成基于规则方法的符号派和基于概率方法的随机派两大阵营：符号派以Chomsky为代表进行形式语言理论、生成句法和形式逻辑研究；随机派采用贝叶斯方法，但因AI领域聚焦推理和逻辑问题，符号派研究势头强于随机派。",
        "domain": "自然语言处理",
        "subdomain": "快速发展期",
        "difficulty": 3,
        "cognitive_level": "COG_L3",
        "importance": 0.7,
        "abstraction": 3,
        "estimated_time": 30,
        "is_key_point": true,
        "is_difficult": true,
        "prerequisites": [],
        "successors": [],
        "keywords": [
            "快速发展期",
            "符号派",
            "随机派",
            "规则方法",
            "概率方法",
            "贝叶斯方法",
            "形式语言理论",
            "生成句法",
            "形式逻辑"
        ],
        "application_scenarios": [],
        "common_misconceptions": [],
        "mastery_criteria": "能够描述1957-1970年自然语言处理快速发展期的两大阵营及其研究活动"
    },
    {
        "knowledge_id": "D02-M02-K002",
        "name": "文本分析",
        "description": "文本分析就是自然语言处理各项任务的基础，最终目标是使计算机理解和生成人类语言。文本分析是指对一个文本文档进行语义理解、分析和计算。文本分析的基本目的是从文档中抽取所需要的信息，形成计算机能够理解和利用的特征，从而支撑多种多样的下游任务。",
        "domain": "自然语言处理",
        "subdomain": "文本分析",
        "difficulty": 3,
        "cognitive_level": "COG_L3",
        "importance": 0.9,
        "abstraction": 4,
        "estimated_time": 45,
        "is_key_point": true,
        "is_difficult": true,
        "prerequisites": [],
        "successors": [],
        "keywords": [
            "文本分析",
            "语义理解",
            "特征提取",
            "下游任务",
            "文本文档"
        ],
        "application_scenarios": [
            "信息抽取",
            "情感分析",
            "文本分类"
        ],
        "common_misconceptions": [],
        "mastery_criteria": "能够解释文本分析的目的、过程及在NLP中的基础作用"
    },
    {
        "knowledge_id": "D02-M02-K003",
        "name": "文本语义表示",
        "description": "本节，我们首先需要解决自然语言处理领域的一个基本问题——什么是语义？进而学习计算机如何理解文本语义并进行计算。",
        "domain": "自然语言处理",
        "subdomain": "语义表示",
        "difficulty": 4,
        "cognitive_level": "COG_L4",
        "importance": 0.9,
        "abstraction": 5,
        "estimated_time": 60,
        "is_key_point": true,
        "is_difficult": true,
        "prerequisites": [],
        "successors": [],
        "keywords": [
            "文本语义",
            "语义表示",
            "语义理解",
            "计算",
            "自然语言处理"
        ],
        "application_scenarios": [
            "语义分析",
            "文本理解",
            "知识表示"
        ],
        "common_misconceptions": [],
        "mastery_criteria": "能够阐述文本语义表示的核心问题及计算机理解语义的基本方法"
    },
    {
        "knowledge_id": "D02-M01-K009",
        "name": "文本向量表示",
        "description": "将长短不一的文本转化为长度一致的向量，以便进行统一处理，是文本分析的基础表示方法。",
        "domain": "自然语言处理",
        "subdomain": "语言建模",
        "difficulty": 2,
        "cognitive_level": "COG_L2",
        "importance": 0.8,
        "abstraction": 2,
        "estimated_time": 30,
        "is_key_point": true,
        "is_difficult": false,
        "prerequisites": [],
        "successors": [],
        "keywords": [
            "文本向量",
            "统一表示",
            "长度一致"
        ],
        "application_scenarios": [
            "文本处理",
            "特征提取"
        ],
        "common_misconceptions": [],
        "mastery_criteria": "能够解释文本向量表示的目的和基本方法"
    },
    {
        "knowledge_id": "D02-M01-K005",
        "name": "文本分类",
        "description": "为给定的文本自动确定其所述的类别标签。文本可以是不同长度的句子、段落、文章，也可以是不同类型的新闻、邮件、评价等。文本分类是最基础的自然语言处理任务之一，具有众多的下游任务。",
        "domain": "自然语言处理",
        "subdomain": "NLP任务",
        "difficulty": 2,
        "cognitive_level": "COG_L2",
        "importance": 0.9,
        "abstraction": 3,
        "estimated_time": 30,
        "is_key_point": true,
        "is_difficult": false,
        "prerequisites": [],
        "successors": [],
        "keywords": [
            "文本分类",
            "类别标签",
            "基础任务"
        ],
        "application_scenarios": [
            "新闻分类",
            "邮件过滤",
            "情感分析"
        ],
        "common_misconceptions": [],
        "mastery_criteria": "能够解释文本分类的定义，并理解它是自然语言处理中最基础的任务之一，且具有众多下游任务"
    },
    {
        "knowledge_id": "D02-M02-K001",
        "name": "情感分析",
        "description": "分析人们在文本中对产品、事件、话题等的意见、情绪或评价。从某种意义上讲，情感分析也是一种广义的文本分类，例如对人们的观点进行积极或消极的分类，对人们关于某产品的喜好程度的分类等。",
        "domain": "自然语言处理",
        "subdomain": "NLP任务",
        "difficulty": 2,
        "cognitive_level": "COG_L2",
        "importance": 0.8,
        "abstraction": 3,
        "estimated_time": 30,
        "is_key_point": true,
        "is_difficult": false,
        "prerequisites": [],
        "successors": [],
        "keywords": [
            "情感分析",
            "观点挖掘",
            "文本分类"
        ],
        "application_scenarios": [
            "产品评价分析",
            "舆情监控"
        ],
        "common_misconceptions": [],
        "mastery_criteria": "能够解释情感分析的定义，并理解它是广义的文本分类的一种"
    },
    {
        "knowledge_id": "D02-M01-K006",
        "name": "文本摘要",
        "description": "将长文本进行压缩、归纳和总结，从而形成概括性短文本。文本摘要既可以单文档进行，也可以多文档进行。从方法上可分为抽取式摘要和生成式摘要。抽取式摘要直接从原文中选择若干重要的句子，对它们进行排序、重组而形成摘要。生成式摘要是指机器对完整原文进行理解后，通过转述的方法生成摘要。",
        "domain": "自然语言处理",
        "subdomain": "文本摘要",
        "difficulty": 2,
        "cognitive_level": "COG_L2",
        "importance": 0.9,
        "abstraction": 3,
        "estimated_time": 30,
        "is_key_point": true,
        "is_difficult": false,
        "prerequisites": [],
        "successors": [],
        "keywords": [
            "文本摘要",
            "抽取式",
            "生成式",
            "压缩",
            "归纳"
        ],
        "application_scenarios": [
            "信息摘要",
            "新闻摘要",
            "文档压缩"
        ],
        "common_misconceptions": [],
        "mastery_criteria": "能够区分抽取式摘要和生成式摘要的原理，并说明其应用场景"
    },
    {
        "knowledge_id": "D02-M03-K001",
        "name": "机器翻译",
        "description": "机器在没有人工干预下完成从一种语言到另一种语言的转换。其技术发展经历了基于规则、基于统计和基于深度神经网络三个阶段。目前已经到达了较高的水平。",
        "domain": "自然语言处理",
        "subdomain": "NLP任务",
        "difficulty": 3,
        "cognitive_level": "COG_L3",
        "importance": 0.9,
        "abstraction": 4,
        "estimated_time": 45,
        "is_key_point": true,
        "is_difficult": true,
        "prerequisites": [],
        "successors": [],
        "keywords": [
            "机器翻译",
            "规则",
            "统计",
            "深度神经网络"
        ],
        "application_scenarios": [
            "跨语言交流",
            "文档翻译"
        ],
        "common_misconceptions": [],
        "mastery_criteria": "能够解释机器翻译的定义，并理解其技术发展经历了三个阶段"
    },
    {
        "knowledge_id": "D02-M04-K001",
        "name": "机器阅读理解",
        "description": "使机器具有从自然语言中理解和抽取关键信息，继而回答问题的能力。这是对人类语言处理能力的一种模仿，具有重要的实用价值。例如可以帮助信息检索更加高效地完成等。",
        "domain": "自然语言处理",
        "subdomain": "NLP任务",
        "difficulty": 3,
        "cognitive_level": "COG_L3",
        "importance": 0.8,
        "abstraction": 4,
        "estimated_time": 45,
        "is_key_point": true,
        "is_difficult": true,
        "prerequisites": [],
        "successors": [],
        "keywords": [
            "机器阅读理解",
            "信息抽取",
            "问题回答"
        ],
        "application_scenarios": [
            "信息检索",
            "智能问答"
        ],
        "common_misconceptions": [],
        "mastery_criteria": "能够解释机器阅读理解的定义，并理解其具有重要的实用价值"
    },
    {
        "knowledge_id": "D02-M01-K007",
        "name": "对话系统",
        "description": "目标是使机器与人类进行流畅的有意义的对话。有任务导向型对话系统和非任务导向型对话系统两类。任务导向对话系统旨在帮助用户完成具体的实际任务，例如帮助用户寻找商品、预订酒店餐厅等。非任务导向对话系统通常不限定领域和具体任务，聊天、娱乐等为主要应用场景。",
        "domain": "自然语言处理",
        "subdomain": "对话系统",
        "difficulty": 2,
        "cognitive_level": "COG_L2",
        "importance": 0.9,
        "abstraction": 3,
        "estimated_time": 30,
        "is_key_point": true,
        "is_difficult": false,
        "prerequisites": [],
        "successors": [],
        "keywords": [
            "对话系统",
            "任务导向",
            "非任务导向",
            "聊天",
            "交互"
        ],
        "application_scenarios": [
            "智能客服",
            "虚拟助手",
            "娱乐聊天"
        ],
        "common_misconceptions": [],
        "mastery_criteria": "能够区分任务导向型和非任务导向型对话系统的应用场景和功能差异"
    }
]
"""

knowlegde_schema = knowlege_to_schema_prompt(knowledge)

response = client.chat.completions.create(
    model="Kwaipilot/KAT-Dev",
    messages=[
        {"role": "system", "content": "You are a strict JSON generator.Return JSON only. No markdown. No code fences."},
        {"role": "user", "content": knowlegde_schema}
    ],
    temperature=0.2,   # 非常重要：一定要低
)

raw_output = response.choices[0].message.content

print(raw_output)