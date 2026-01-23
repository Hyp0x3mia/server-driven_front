import React, { useState } from 'react';
import { Sparkles, Monitor, Activity, Box, Edit3, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EditableBlockProps {
  children: React.ReactNode;
  data: any;                // 当前区块的数据对象
  onUpdate: (newData: any) => void; // 更新数据的回调
  onRegenerate?: () => Promise<void>; // AI 重写的回调
  onEdit?: () => void;       // 打开 JSON 编辑器的回调
  onDelete?: () => void;     // 删除的回调
  isEditing: boolean;       // 全局编辑开关
}

export const EditableBlock = ({
  children,
  data,
  onUpdate,
  onRegenerate,
  onEdit,
  onDelete,
  isEditing
}: EditableBlockProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // 如果不在编辑模式，直接渲染子组件，无任何副作用
  if (!isEditing) return <>{children}</>;

  // 切换视觉模式 (针对 Hybrid Visual Strategy)
  const setVisualMode = (mode: 'terminal' | 'schematic' | 'icon') => {
    // 乐观更新
    onUpdate({ ...data, visual_mode: mode });
  };

  return (
    <div
      className={cn(
        "relative group transition-all duration-300 rounded-3xl",
        // 编辑模式下：增加内边距防止布局跳动，增加透明边框占位
        isEditing && "hover:ring-2 hover:ring-indigo-400 hover:ring-offset-4 hover:ring-offset-slate-900 cursor-default p-1 -m-1"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 内容区域：生成时添加模糊效果 */}
      <div className={cn("transition-opacity duration-300", isRegenerating && "opacity-50 grayscale blur-sm")}>
        {children}
      </div>

      {/* 加载中状态 */}
      {isRegenerating && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex items-center space-x-2 bg-slate-900/80 text-white px-4 py-2 rounded-full backdrop-blur">
            <Sparkles className="animate-spin text-indigo-400" size={16} />
            <span className="text-sm font-medium">AI 正在优化...</span>
          </div>
        </div>
      )}

      {/* 悬浮工具栏 (仅 Hover 显示) */}
      {isHovered && !isRegenerating && (
        <div className="absolute -top-10 right-4 flex items-center space-x-1.5 bg-slate-900 border border-slate-700 p-1.5 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">

          {/* A. 视觉模式切换 (仅当组件支持 visual_mode 时显示) */}
          {(data.visual_mode !== undefined || data.type === 'cardgrid' || data.content?.cardgrid?.items) && (
            <div className="flex bg-slate-800 rounded-lg p-0.5 mr-2 border border-slate-700/50">
              <ModeBtn
                active={data.visual_mode === 'terminal'}
                onClick={() => setVisualMode('terminal')}
                icon={<Monitor size={13} />}
                title="终端模式 (代码)"
              />
              <ModeBtn
                active={data.visual_mode === 'schematic'}
                onClick={() => setVisualMode('schematic')}
                icon={<Activity size={13} />}
                title="架构图模式 (原理)"
              />
              <ModeBtn
                active={data.visual_mode === 'icon'}
                onClick={() => setVisualMode('icon')}
                icon={<Box size={13} />}
                title="图标模式 (概念)"
              />
            </div>
          )}

          {/* B. AI 操作区 */}
          {onRegenerate && (
            <button
              onClick={async () => {
                setIsRegenerating(true);
                try {
                  await onRegenerate();
                } finally {
                  setIsRegenerating(false);
                }
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all active:scale-95"
            >
              <Sparkles size={13} />
              <span>AI 重写</span>
            </button>
          )}

          {/* C. 常规操作 */}
          <div className="w-px h-4 bg-slate-700 mx-1" />
          {onEdit && (
            <IconButton
              icon={<Edit3 size={14} />}
              onClick={onEdit}
            />
          )}
          {onDelete && (
            <IconButton
              icon={<Trash2 size={14} />}
              className="text-red-400 hover:bg-red-950"
              onClick={onDelete}
            />
          )}
        </div>
      )}
    </div>
  );
};

// 辅助小组件
const ModeBtn = ({ active, onClick, icon, title }: any) => (
  <button
    onClick={onClick}
    title={title}
    className={cn(
      "p-1.5 rounded-md transition-all",
      active ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-700"
    )}
  >
    {icon}
  </button>
);

const IconButton = ({ icon, className, onClick }: any) => (
  <button
    onClick={onClick}
    className={cn("p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors", className)}
  >
    {icon}
  </button>
);
