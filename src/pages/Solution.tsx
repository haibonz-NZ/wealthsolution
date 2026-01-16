import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Unlock, CheckCircle, ArrowRight, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { toast } from "sonner";

export default function Solution() {
  const [, setLocation] = useLocation();
  const [isFixed, setIsFixed] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Data for "Before" (Red) and "After" (Green)
  const dataBefore = [
    { subject: '税务', A: 40, fullMark: 100 },
    { subject: '安全', A: 50, fullMark: 100 },
    { subject: '传承', A: 30, fullMark: 100 },
    { subject: '隐私', A: 40, fullMark: 100 },
    { subject: '合规', A: 60, fullMark: 100 },
  ];

  const dataAfter = [
    { subject: '税务', A: 95, fullMark: 100 },
    { subject: '安全', A: 90, fullMark: 100 },
    { subject: '传承', A: 98, fullMark: 100 },
    { subject: '隐私', A: 95, fullMark: 100 },
    { subject: '合规', A: 100, fullMark: 100 },
  ];

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 11) {
      toast.error("请输入有效的手机号码");
      return;
    }
    // Mock API call
    setTimeout(() => {
      setSubmitted(true);
      toast.success("预约成功！顾问将尽快与您联系。");
      // Could redirect to a success page or reset
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0B1B32] text-white pb-20 relative overflow-hidden">
      {/* Header */}
      <div className="p-6 pt-10 text-center">
        <h1 className="text-2xl font-bold font-heading mb-2">解决方案模拟</h1>
        <p className="text-white/50 text-xs">通过顶层架构设计，您的财富健康度可以...</p>
      </div>

      {/* 1. The Switch (Core Interaction) */}
      <div className="flex justify-center mb-8">
        <div className={`flex items-center gap-4 px-6 py-3 rounded-full border transition-all duration-500 ${isFixed ? 'bg-green-900/30 border-green-500/50' : 'bg-red-900/30 border-red-500/50'}`}>
          <span className={`text-sm font-bold ${isFixed ? 'text-white/50' : 'text-red-400'}`}>当前风险状态</span>
          <Switch 
            checked={isFixed} 
            onCheckedChange={setIsFixed}
            className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
          />
          <span className={`text-sm font-bold ${isFixed ? 'text-green-400' : 'text-white/50'}`}>开启架构隔离</span>
        </div>
      </div>

      {/* 2. Visual Comparison (Radar) */}
      <div className="h-[300px] w-full relative mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={isFixed ? "fixed" : "broken"}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full absolute inset-0"
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={isFixed ? dataAfter : dataBefore}>
                <PolarGrid stroke="#ffffff20" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: isFixed ? '#4ade80' : '#f87171', fontSize: 12 }} />
                <Radar
                  name="Score"
                  dataKey="A"
                  stroke={isFixed ? '#4ade80' : '#f87171'}
                  strokeWidth={3}
                  fill={isFixed ? '#4ade80' : '#f87171'}
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        </AnimatePresence>
        
        {/* Central Status Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          {isFixed ? (
            <div className="text-green-400 font-bold text-xl drop-shadow-md">安全<br/>SECURE</div>
          ) : (
            <div className="text-red-500 font-bold text-xl drop-shadow-md">高危<br/>RISK</div>
          )}
        </div>
      </div>

      {/* 3. Text feedback */}
      <div className="px-6 mb-10 text-center h-16">
        <AnimatePresence mode="wait">
          {isFixed ? (
            <motion.p 
              key="text-fixed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-green-400 font-medium"
            >
              <CheckCircle className="w-4 h-4 inline mr-1" />
              架构修复后，资产安全性提升 95%。<br/>
              <span className="text-xs text-white/50">预计每年节税 $120,000+</span>
            </motion.p>
          ) : (
            <motion.p 
              key="text-broken"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 font-medium"
            >
              <Lock className="w-4 h-4 inline mr-1" />
              当前裸奔状态，建议立即采取措施。<br/>
              <span className="text-xs text-white/50">潜在诉讼风险敞口：100%</span>
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Case Matcher */}
      <div className="px-6 mb-24">
        <div className="text-xs text-primary uppercase tracking-widest mb-3">相似成功案例</div>
        <Card className="bg-white/5 border-white/10 p-4 relative overflow-hidden group cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setShowLeadForm(true)}>
          <div className="absolute top-0 right-0 bg-primary/20 text-primary text-[10px] px-2 py-1 rounded-bl-lg">已验证</div>
          <div className="flex gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs">L</div>
            <div>
              <div className="font-bold text-sm">刘先生 (深圳/温哥华)</div>
              <div className="text-[10px] text-white/50">资产规模：5000万+ | 制造业</div>
            </div>
          </div>
          <p className="text-xs text-white/70 leading-relaxed mb-3">
            曾面临CRS穿透与加拿大离境税双重困境。通过<span className="bg-white/20 px-1 rounded blur-[2px] select-none">家族信托</span>架构重组，成功规避了 <span className="text-primary font-mono">$1,200,000</span> 的一次性税负。
          </p>
          <div className="flex items-center text-primary text-xs font-bold group-hover:underline">
            申请查看完整方案 <ArrowRight className="w-3 h-3 ml-1" />
          </div>
        </Card>
      </div>

      {/* 5. Bottom CTA (Lead Gen) */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#0B1B32] to-transparent z-40">
        <Button 
          size="lg" 
          onClick={() => setShowLeadForm(true)}
          className="w-full h-14 bg-gradient-to-r from-primary to-amber-600 text-background font-bold text-lg shadow-xl shadow-primary/20 animate-pulse"
        >
          {isFixed ? "获取落地执行方案" : "获取完整避险报告"}
        </Button>
      </div>

      {/* Lead Gen Dialog */}
      <Dialog open={showLeadForm} onOpenChange={setShowLeadForm}>
        <DialogContent className="bg-[#0f2540] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading text-primary">
              {submitted ? "预约成功" : "获取完整分析报告"}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              {submitted 
                ? "您的专属顾问将在 24 小时内与您联系，请保持电话畅通。" 
                : "为了保护您的隐私，完整报告将加密发送至您的手机或由顾问一对一解读。"}
            </DialogDescription>
          </DialogHeader>

          {!submitted ? (
            <form onSubmit={handleLeadSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white/80">手机号码 (用于接收验证码)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                  <Input 
                    id="phone"
                    type="tel" 
                    placeholder="138 0000 0000" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-primary"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary text-background font-bold h-12">
                立即获取
              </Button>
              <p className="text-[10px] text-center text-white/30">
                点击提交即代表您同意我们的隐私政策。您的信息仅用于本次服务。
              </p>
            </form>
          ) : (
            <div className="py-8 flex flex-col items-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 text-green-500">
                <CheckCircle className="w-8 h-8" />
              </div>
              <Button variant="outline" onClick={() => setShowLeadForm(false)} className="w-full border-white/10 text-white hover:bg-white/10">
                关闭
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
