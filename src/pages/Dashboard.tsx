import { useState, useEffect } from "react";
import { AuthService, type User } from "@/services/auth";
import { CaseService, type WealthCase } from "@/services/case";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Crown, User as UserIcon, FileText, Settings, Shield, Plus, Loader2, Zap } from "lucide-react";
import { DataService } from "@/services/data";
import { CreateCaseDialog } from "@/components/CreateCaseDialog";
import { CaseCard } from "@/components/CaseCard";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onNavigateToCase: (caseId: string) => void;
  onNavigateToSettings: () => void;
}

export default function Dashboard({ user, onLogout, onNavigateToCase, onNavigateToSettings }: DashboardProps) {
  const [cases, setCases] = useState<WealthCase[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch cases on mount
  useEffect(() => {
    loadCases();
  }, [user.id]);

  const loadCases = async () => {
    setLoading(true);
    try {
      const data = await CaseService.getUserCases(user.id);
      setCases(data);
    } catch (error) {
      toast.error("加载案例失败");
    } finally {
      setLoading(false);
    }
  };

  const handleCaseCreated = (newCase: WealthCase) => {
    setCases([newCase, ...cases]);
  };

  const handleCaseDelete = async (caseId: string) => {
    if (!confirm("确定要删除这个案例吗？此操作无法撤销。")) return;
    try {
      await CaseService.deleteCase(caseId);
      setCases(cases.filter(c => c.id !== caseId));
      toast.success("案例已删除");
    } catch (error) {
      toast.error("删除失败");
    }
  };

  const handleCaseClick = (caseId: string) => {
    console.log("Dashboard: Case clicked", caseId);
    toast.loading("正在进入案例详情...");
    // Add a small delay to ensure toast is seen if navigation is instant
    setTimeout(() => {
        onNavigateToCase(caseId);
        toast.dismiss();
    }, 100);
  };

  const getLevelBadge = (level: string) => {
    switch(level) {
      case 'enterprise': return <Badge className="bg-purple-600">企业会员</Badge>;
      case 'professional': return <Badge className="bg-blue-600">专业会员</Badge>;
      default: return <Badge variant="secondary">基础会员</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-muted/10 p-6">
      <header className="flex items-center justify-between mb-8 max-w-6xl mx-auto bg-background/60 backdrop-blur-md p-4 rounded-2xl border shadow-sm sticky top-4 z-50">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Wealth Solution" className="h-10 w-auto object-contain" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">Wealth Solution</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="font-medium text-foreground/80">会员中心</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              欢迎回来，{user.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="font-medium">{user.email}</div>
            <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
          </div>
          <Button variant="outline" size="icon" onClick={() => { AuthService.logout(); onLogout(); }}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid md:grid-cols-12 gap-6">
        {/* Left Sidebar: User Info (3 cols) */}
        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                账户信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center p-4 bg-muted/20 rounded-lg mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3 text-2xl font-bold text-primary">
                  {user.name[0]}
                </div>
                <div className="font-semibold text-lg">{user.name}</div>
                <div className="mt-2">{getLevelBadge(user.memberLevel)}</div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">用户ID</span>
                  <span className="font-mono text-xs">{user.id.split('-')[1] || '---'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">注册邮箱</span>
                  <span className="truncate max-w-[120px]">{user.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">账户状态</span>
                  <span className="text-green-600 font-medium">正常</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>使用统计</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">我的案例</span>
                <span className="font-bold text-lg">{cases.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">已生成报告</span>
                <span className="font-bold text-lg">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">剩余配额</span>
                <span className="font-bold text-lg text-primary">10</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Main Content: Cases (9 cols) */}
        <div className="md:col-span-9 space-y-6">
          {/* Quick Actions Bar */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">我的规划案例</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={DataService.loadDemoData} className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                <Zap className="mr-2 h-4 w-4" /> 导入演示案例
              </Button>
              <CreateCaseDialog 
                userId={user.id} 
                onCaseCreated={handleCaseCreated}
                trigger={
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> 新建案例
                  </Button>
                }
              />
            </div>
          </div>

          {/* Cases Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : cases.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cases.map((c) => (
                <CaseCard 
                  key={c.id} 
                  data={c} 
                  onClick={handleCaseClick} 
                  onDelete={handleCaseDelete} 
                />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">暂无规划案例</h3>
                <p className="text-sm text-muted-foreground max-w-xs mb-6">
                  您还没有创建任何财富规划案例。点击上方按钮开始您的第一个规划。
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={DataService.loadDemoData} className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                    <Zap className="mr-2 h-4 w-4" /> 导入演示案例
                  </Button>
                  <CreateCaseDialog userId={user.id} onCaseCreated={handleCaseCreated} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Other Tools Section */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">更多工具</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="hover:bg-muted/50 cursor-pointer transition-colors group">
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Crown className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <div className="font-medium">升级权益</div>
                    <div className="text-xs text-muted-foreground mt-1">获取更多报告配额</div>
                  </div>
                </CardContent>
              </Card>
              <Card 
                className="hover:bg-muted/50 cursor-pointer transition-colors group"
                onClick={onNavigateToSettings}
              >
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Settings className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <div className="font-medium">系统设置</div>
                    <div className="text-xs text-muted-foreground mt-1">数据备份与恢复</div>
                  </div>
                </CardContent>
              </Card>
              {user.role === 'admin' && (
                <Card className="hover:bg-muted/50 cursor-pointer transition-colors group border-dashed border-red-200">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Shield className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium text-red-600">管理员后台</div>
                      <div className="text-xs text-muted-foreground mt-1">系统全局配置</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
