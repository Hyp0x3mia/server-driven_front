import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { SchemaRenderer } from "../renderer/SchemaRenderer";
import { Navbar } from "../components/layout/Navbar";

export default function SchemaPage() {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);

  if (!id) {
    return (
      <div className="min-h-screen bg-[#0B1120] text-slate-300 font-sans">
        <div className="pt-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <p className="text-red-400">Missing page id</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-300 font-sans">
      {/* Cyberpunk Grid Background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#1e40af44,transparent)]"
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar with edit mode toggle */}
        <Navbar
          title="AI 导论"
          isEditing={isEditing}
          onToggleEdit={() => setIsEditing(!isEditing)}
        />

        {/* Main Content - 不使用 container，让 SchemaRenderer 控制布局 */}
        <main className="w-full px-6 pt-8 pb-24 flex-grow">
          <SchemaRenderer pageId={id} isEditing={isEditing} setIsEditing={setIsEditing} />
        </main>

        {/* Footer */}
        <footer className="bg-slate-900/50 backdrop-blur-sm border-t border-slate-800">
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">
              © 2024 人工智能导论 - 构建系统化的AI认知框架
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
