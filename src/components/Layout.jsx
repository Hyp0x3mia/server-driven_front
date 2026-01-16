import React from 'react';

const Layout = ({ children }) => {
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
        {/* Main Content Body */}
        <main className="container mx-auto px-6 py-24 flex-grow">
          {children}
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
};

export default Layout;
