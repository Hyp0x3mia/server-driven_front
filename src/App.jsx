import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import SchemaPage from "./pages/SchemaPage";
import StreamingSchemaPage from "./pages/StreamingSchemaPage"; // 使用新的 SchemaPage（带 Navbar）
import { ComparisonPage } from "./renderer/JsonRenderPOC/comparison-working"; // json-render POC comparison page (工作版)
import TestJsonRenderPage from "./pages/TestJsonRenderPage"; // 简单测试页面

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <HashRouter>
        <Routes>
          {/* 测试页面 - 用来确认基本功能 */}
          <Route path="/test-json" element={<TestJsonRenderPage />} />

          {/* json-render POC comparison page */}
          <Route path="/comparison" element={<ComparisonPage />} />

          {/* Streaming generation page */}
          <Route path="/streaming/:topic" element={<StreamingSchemaPage />} />

          {/* 1) 使用新的 SchemaPage（带 Navbar 集成） */}
          <Route path="/page/:id" element={<SchemaPage />} />

          {/* 2) 你原有的静态页面路由保持不变 */}
          {navItems.map(({ to, page }) => (
            <Route key={to} path={to} element={page} />
          ))}
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
