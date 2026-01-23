import React from 'react';
import { BookOpen, Github, Eye, Edit3 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavbarProps {
  title?: string;           // 网站/课程标题
  isEditing: boolean;       // 当前是否处于编辑模式
  onToggleEdit: () => void; // 切换编辑模式的回调
}

export const Navbar = ({ title = "AI 导论", isEditing, onToggleEdit }: NavbarProps) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-slate-950/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 transition-all">

      {/* 1. Logo 区 */}
      <div className="flex items-center space-x-2">
        <div className="bg-indigo-600/20 p-1.5 rounded-lg">
          <BookOpen className="text-indigo-400" size={20} />
        </div>
        <span className="font-bold text-lg tracking-tight text-slate-100">{title}</span>
      </div>

      {/* 2. 导航链接 (桌面端) */}
      <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-400">
        <a href="#" className="hover:text-white transition-colors">课程首页</a>
        <a href="#" className="hover:text-white transition-colors">知识图谱</a>
        <a href="#" className="text-indigo-400 cursor-default">生成的内容</a>
      </div>

      {/* 3. 功能区 (编辑开关) */}
      <div className="flex items-center space-x-4">
        {/* 编辑开关 Toggle */}
        <button
          onClick={onToggleEdit}
          className={cn(
            "flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border",
            isEditing
              ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]"
              : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
          )}
        >
          {isEditing ? <Edit3 size={12} /> : <Eye size={12} />}
          <span>{isEditing ? '编辑模式' : '预览模式'}</span>
        </button>

        <div className="w-px h-4 bg-slate-800 mx-2" />
        <Github size={20} className="text-slate-500 hover:text-white cursor-pointer" />
      </div>
    </nav>
  );
};
