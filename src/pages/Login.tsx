import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthService } from "@/services/auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface LoginProps {
  onNavigate: (page: string) => void;
  onLoginSuccess: (user: any) => void;
}

export default function Login({ onNavigate, onLoginSuccess }: LoginProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await AuthService.login(email, password);
      toast.success("登录成功");
      onLoginSuccess(user);
    } catch (error: any) {
      toast.error(error.message || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">登录会员中心</CardTitle>
          <CardDescription>请输入您的账号密码以继续</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱地址</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">密码</Label>
                <Button variant="link" className="p-0 h-auto text-xs" type="button" onClick={() => toast.info("请联系管理员重置")}>忘记密码?</Button>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              登录
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              还没有账号?{" "}
              <Button variant="link" className="p-0 h-auto font-normal" type="button" onClick={() => onNavigate("register")}>
                使用邀请码注册
              </Button>
            </div>
            <Button variant="ghost" className="w-full" type="button" onClick={() => onNavigate("home")}>
              返回首页
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
