import React, { useEffect, useState, useRef } from 'react';
import { BookOpen, Hash, Cpu, History, Code, Lightbulb, FileText, Layers, Gamepad2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItem {
  id: string;
  title: string;
  type: string;
  icon?: React.ReactNode;
}

interface SidebarNavProps {
  items: NavItem[];
}

/**
 * 根据标题或类型匹配图标
 */
function getIconForItem(item: NavItem): React.ReactNode {
  const title = item.title?.toLowerCase() || '';
  const type = item.type?.toLowerCase() || '';

  // 根据标题关键词匹配
  if (title.includes('历史') || title.includes('发展') || title.includes('演进')) {
    return <History size={16} />;
  }
  if (title.includes('概念') || title.includes('基础') || title.includes('介绍')) {
    return <BookOpen size={16} />;
  }
  if (title.includes('技术') || title.includes('实现') || title.includes('代码')) {
    return <Code size={16} />;
  }
  if (title.includes('原理') || title.includes('架构') || title.includes('系统')) {
    return <Cpu size={16} />;
  }
  if (title.includes('应用') || title.includes('实践') || title.includes('案例')) {
    return <Lightbulb size={16} />;
  }

  // 根据 type 匹配
  switch (type) {
    case 'hero':
      return <Layers size={16} />;
    case 'markdown':
      return <FileText size={16} />;
    case 'code':
      return <Code size={16} />;
    case 'codeplayground':
      return <Gamepad2 size={16} />;
    default:
      return <Hash size={16} />;
  }
}

export const SidebarNav = ({ items }: SidebarNavProps) => {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // 为每个 item 添加图标
    const itemsWithIcons = items.map(item => ({
      ...item,
      icon: item.icon || getIconForItem(item)
    }));

    // 使用 IntersectionObserver 实现滚动监听
    const observerOptions = {
      rootMargin: '-20% 0px -70% 0px', // 视口中间区域触发
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    }, observerOptions);

    // 观察所有章节
    items.forEach(item => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [items]);

  // 平滑滚动到指定位置
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <nav className="w-64 p-4 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
      {/* 标题 */}
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 pl-2">
        目录导航
      </div>

      {/* 导航列表 */}
      <ul className="space-y-1">
        {items.map((item) => {
          const IconComponent = item.icon || getIconForItem(item);
          const isActive = activeId === item.id;

          return (
            <li key={item.id}>
              <button
                onClick={() => scrollToSection(item.id)}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer text-sm",
                  isActive
                    ? "bg-indigo-500/10 text-indigo-400 font-medium shadow-[inset_2px_0_0_0_#6366f1]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                )}
              >
                <span className={cn("flex-shrink-0", isActive && "text-indigo-400")}>
                  {IconComponent}
                </span>
                <span className="truncate">{item.title}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
