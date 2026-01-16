import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthService } from "@/services/auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface RegisterProps {
  onNavigate: (page: string) => void;
  onRegisterSuccess: (user: any) => void;
}

export default function Register({ onNavigate, onRegisterSuccess }: RegisterProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast.error("两次输入的密码不一致");
      setLoading(false);
      return;
    }

    try {
      const user = await AuthService.register(email, password, inviteCode, name);
      toast.success("注册成功");
      onRegisterSuccess(user);
    } catch (error: any) {
      toast.error(error.message || "注册失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">激活会员账号</CardTitle>
          <CardDescription>请输入您的邀请码以完成注册</CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">邀请码 <span className="text-red-500">*</span></Label>
              <Input 
                id="inviteCode" 
                placeholder="请输入邀请码" 
                required 
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <Input 
                id="name" 
                placeholder="您的真实姓名" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
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
              <Label htmlFor="password">设置密码</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              立即注册
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              已有账号?{" "}
              <Button variant="link" className="p-0 h-auto font-normal" type="button" onClick={() => onNavigate("login")}>
                直接登录
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
