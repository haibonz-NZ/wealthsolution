import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import CaseDetail from "@/pages/CaseDetail";
import Settings from "@/pages/Settings";
import { AuthService, type User } from "@/services/auth";

type Page = "home" | "login" | "register" | "dashboard" | "case-detail" | "settings";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentCaseId, setCurrentCaseId] = useState<string>("");

  useEffect(() => {
    // 初始化 Mock 服务
    AuthService.init();
    // 检查是否有已登录用户
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  // 监听用户状态变化，处理自动跳转
  useEffect(() => {
    if (currentUser) {
      // 已登录状态下，访问登录/注册/首页自动跳转到 dashboard
      // 但允许显式返回首页(onLogout)
    }
  }, [currentUser]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage("home");
  };

  const renderPage = () => {
    switch (currentPage) {
      case "login":
        return <Login onNavigate={(p) => setCurrentPage(p as Page)} onLoginSuccess={handleLoginSuccess} />;
      case "register":
        return <Register onNavigate={(p) => setCurrentPage(p as Page)} onRegisterSuccess={handleLoginSuccess} />;
      case "dashboard":
        if (!currentUser) {
          setTimeout(() => setCurrentPage("login"), 0);
          return null;
        }
        return <Dashboard 
          user={currentUser} 
          onLogout={handleLogout} 
          onNavigateToCase={(caseId) => {
            setCurrentCaseId(caseId);
            setCurrentPage("case-detail");
          }}
          onNavigateToSettings={() => setCurrentPage("settings")}
        />;
      case "case-detail":
        if (!currentUser) {
          setTimeout(() => setCurrentPage("login"), 0);
          return null;
        }
        return <CaseDetail 
          caseId={currentCaseId} 
          onBack={() => setCurrentPage("dashboard")} 
        />;
      case "settings":
        if (!currentUser) {
          setTimeout(() => setCurrentPage("login"), 0);
          return null;
        }
        return <Settings onBack={() => setCurrentPage("dashboard")} />;
      case "home":
      default:
        // 如果已登录但访问首页，通过 Home 的按钮可以再次进入 Dashboard
        return <Home onNavigate={(p) => {
          if (currentUser && (p === 'login' || p === 'register')) {
            setCurrentPage('dashboard');
          } else {
            setCurrentPage(p as Page);
          }
        }} />;
    }
  };

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          {renderPage()}
        </TooltipProvider>
        <div className="fixed bottom-2 right-2 text-[10px] text-slate-300 font-mono opacity-50 pointer-events-none z-50">
          v6.1 (Advisor Stable)
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
