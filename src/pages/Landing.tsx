import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { ShieldCheck, User, ChevronRight, Activity, Globe, Radar, Lock, TrendingDown, Eye, FileText, ChevronDown, Shield } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import landingBg from "@/assets/landing-bg.jpeg";
import logoOne from "@/assets/logo-one.png";

export default function Landing() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const advisorId = params.get("advisor_id");

  const [clientCount, setClientCount] = useState(1284);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroY = useTransform(scrollY, [0, 300], [0, 100]);

  // Simulate live counter increment
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setClientCount((prev) => prev + 1);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    setLocation("/wizard/identity");
  };

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  const trustMessages = [
    "某上海籍家族刚刚完成美/日风险扫描",
    "某北京籍企业家正在进行代持架构体检",
    "某深圳籍客户发现离岸信托合规漏洞",
    "某杭州籍家族完成二代婚前财产隔离规划"
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#0C2340] text-[#FFF2CC] overflow-x-hidden font-sans">
      {/* 1. Background System: Deep Blue + Copper Lines */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[#0C2340]" />
        {/* Copper Grid Lines (5-10% opacity) */}
        <div 
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#B87845 1px, transparent 1px), linear-gradient(90deg, #B87845 1px, transparent 1px)`,
            backgroundSize: '100px 100px'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0C2340]/50 via-transparent to-[#0C2340] pointer-events-none" />
      </div>

      {/* 2. Top Status Scroller (Cream Transparent Band) */}
      <div className="fixed top-0 left-0 w-full z-50 h-8 bg-[#FFF2CC]/10 backdrop-blur-sm border-b border-[#FFF2CC]/20 flex items-center overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap text-[10px] text-[#FFF2CC] font-medium tracking-wide">
          {trustMessages.map((msg, i) => (
            <span key={i} className="mx-8 flex items-center gap-2">
              <Activity className="w-3 h-3 text-[#B87845]" /> {msg}
            </span>
          ))}
          {/* Duplicate for seamless loop */}
          {trustMessages.map((msg, i) => (
            <span key={`dup-${i}`} className="mx-8 flex items-center gap-2">
              <Activity className="w-3 h-3 text-[#B87845]" /> {msg}
            </span>
          ))}
        </div>
      </div>

      {/* 3. Safety Badge (Copper Shield) */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-12 right-6 z-50 cursor-pointer group"
      >
        <div className="flex items-center gap-2 bg-[#FFF2CC] border-2 border-[#B87845] rounded-full px-4 py-1.5 text-xs text-[#0C2340] shadow-lg hover:shadow-[#B87845]/30 transition-shadow">
          <Shield className="w-3.5 h-3.5 text-[#B87845] fill-current" />
          <span className="font-bold">AES-256 安全承诺</span>
        </div>
      </motion.div>

      {/* --- SECTION 1: HERO (Full Screen) --- */}
      <motion.div 
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center max-w-lg mx-auto w-full pt-20"
      >
        {/* Logo / Brand */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-10 mt-auto"
        >
          <div className="w-32 h-32 mx-auto mb-6 flex items-center justify-center relative">
            <img src={logoOne} alt="The One Wealth Solutions" className="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(184,120,69,0.3)]" />
          </div>
          <h2 className="text-xs uppercase tracking-[0.4em] text-[#B87845] mb-4 font-bold">The One Wealth Solutions</h2>
          <h1 className="text-4xl md:text-5xl font-bold text-[#FFF2CC] font-heading leading-tight drop-shadow-md">
            预见风险，守护传承<br/>
            <span className="text-3xl md:text-4xl opacity-90 mt-2 block font-normal">全球财富合规扫描</span>
          </h1>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full mb-auto"
        >
          <Button 
            size="lg" 
            onClick={handleStart}
            className="w-full h-16 text-lg bg-[#B87845] hover:bg-[#A66A3C] text-white font-bold tracking-widest shadow-[0_0_20px_rgba(184,120,69,0.4)] transition-all duration-500 rounded-none border border-[#FFF2CC]/20 relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              立即开启体检 <ChevronRight className="w-5 h-5" />
            </span>
            {/* Shimmer Effect: Copper to Gold */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-[#FFD700]/30 to-transparent transition-transform duration-1000 ease-in-out" />
          </Button>
          
          <p className="mt-4 text-xs text-[#FFF2CC]/60 tracking-wider">
            3分钟极简匿名体检 · 由 GWRC 智能引擎驱动
          </p>
        </motion.div>

        {/* Advisor Card (Frosted Cream) */}
        {advisorId ? (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ delay: 1, type: "spring" }}
            className="w-full bg-[#FFF2CC]/95 backdrop-blur-md border border-[#B87845]/20 p-4 rounded-t-xl shadow-2xl relative bottom-0"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-2 border-[#B87845] p-0.5">
                  <div className="w-full h-full rounded-full bg-[#0C2340] flex items-center justify-center overflow-hidden text-[#FFF2CC]">
                    <User className="w-8 h-8 opacity-80" />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#B87845] border-2 border-[#FFF2CC] rounded-full flex items-center justify-center">
                  <StarIcon className="w-3 h-3 text-white fill-current" />
                </div>
              </div>
              <div className="flex-1 text-left">
                <div className="text-[10px] text-[#B87845] uppercase tracking-wider font-bold mb-0.5">专属财富顾问</div>
                <div className="text-base font-bold text-[#0C2340]">Senior Advisor (ID: {advisorId})</div>
                <div className="text-xs text-[#0C2340]/60">The One Wealth Solutions 认证专家</div>
              </div>
              <Button variant="outline" size="sm" className="text-xs border-[#0C2340]/20 text-[#0C2340] hover:bg-[#0C2340] hover:text-[#FFF2CC] h-9 px-4">
                联系
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="w-full pb-8 text-center"
          >
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF2CC]/5 border border-[#FFF2CC]/10 text-xs text-[#FFF2CC]/60">
                <Globe className="w-3 h-3" /> 全球合规专家委员会支持
             </div>
          </motion.div>
        )}
      </motion.div>

      {/* --- SECTION 2: FEATURES --- */}
      <div className="relative z-10 py-24 px-6 bg-[#0C2340]">
        <div className="max-w-md mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl font-heading font-bold text-[#FFF2CC] mb-4">这不仅仅是一份报告<br/>这是您的<span className="text-[#B87845]">财富导航仪</span></h2>
            <div className="w-16 h-1 bg-[#B87845] mx-auto mb-6" />
            <p className="text-[#FFF2CC]/70 text-sm leading-relaxed">
              传统的财富管理依赖人工经验，而 GWRC 系统基于全球 8 国法律税务数据库，为您提供可视化的风险透视。
            </p>
          </motion.div>

          <div className="space-y-6">
            <FeatureCard 
              icon={Radar}
              title="五维健康雷达"
              desc="从税务、安全、传承、隐私、合规五个维度，全方位扫描您的资产结构健康度。"
              delay={0.1}
            />
            <FeatureCard 
              icon={AlertTriangle}
              title="风险红绿灯"
              desc="自动识别美籍身份、代持协议、家企混同等高危风险点，给出红/黄/绿灯直观预警。"
              delay={0.2}
            />
            <FeatureCard 
              icon={TrendingDown}
              title="财富损益模拟"
              desc="量化计算如果不做规划，三代传承后的财富缩水比例，让隐完成本显性化。"
              delay={0.3}
            />
          </div>
        </div>
      </div>

      {/* --- SECTION 3: PRIVACY --- */}
      <div className="relative z-10 py-24 px-6 bg-[#0F294A] border-t border-[#FFF2CC]/5">
        <div className="max-w-md mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-8 inline-block p-4 rounded-full bg-[#B87845]/10 border border-[#B87845]/30"
          >
            <Lock className="w-8 h-8 text-[#B87845]" />
          </motion.div>
          <h2 className="text-2xl font-heading font-bold text-[#FFF2CC] mb-4">隐私至上原则</h2>
          <p className="text-[#FFF2CC]/60 text-sm leading-relaxed mb-10">
            我们深知家族信息的敏感性。本系统采用<b>“零留痕”</b>设计：
          </p>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="bg-[#0C2340] p-5 rounded-xl border border-[#FFF2CC]/10 shadow-lg">
              <Eye className="w-5 h-5 text-[#B87845] mb-3" />
              <h3 className="font-bold text-[#FFF2CC] text-sm mb-1">匿名访问</h3>
              <p className="text-[10px] text-[#FFF2CC]/50 leading-relaxed">无需输入真实姓名或身份证号即可完成完整体检。</p>
            </div>
            <div className="bg-[#0C2340] p-5 rounded-xl border border-[#FFF2CC]/10 shadow-lg">
              <FileText className="w-5 h-5 text-[#B87845] mb-3" />
              <h3 className="font-bold text-[#FFF2CC] text-sm mb-1">本地计算</h3>
              <p className="text-[10px] text-[#FFF2CC]/50 leading-relaxed">基础数据仅在浏览器暂存，不上传云端数据库。</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION 4: CTA --- */}
      <div className="relative z-10 py-20 px-6 bg-[#0C2340]">
        <div className="max-w-md mx-auto text-center">
          <h3 className="text-xl font-bold text-[#FFF2CC] mb-8 font-heading">准备好审视您的财富架构了吗？</h3>
          <Button 
            size="lg" 
            onClick={handleStart}
            className="w-full h-14 text-lg bg-[#B87845] text-white font-bold rounded-none hover:bg-[#A66A3C] transition-all border border-[#FFF2CC]/20"
          >
            立即开启体检
          </Button>
          <p className="mt-8 text-[10px] text-[#FFF2CC]/30 leading-relaxed">
            © {new Date().getFullYear()} The One Wealth Solutions. All rights reserved.<br/>
            本系统仅提供风险提示，不构成法律意见。
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, delay }: { icon: any, title: string, desc: string, delay: number }) {
  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="flex gap-5 p-5 rounded-xl bg-[#FFF2CC]/5 border border-[#FFF2CC]/5 hover:bg-[#FFF2CC]/10 transition-colors group"
    >
      <div className="w-12 h-12 rounded-lg bg-[#B87845]/10 flex items-center justify-center shrink-0 border border-[#B87845]/20 group-hover:border-[#B87845]/50 transition-colors">
        <Icon className="w-6 h-6 text-[#B87845]" />
      </div>
      <div>
        <h3 className="font-bold text-[#FFF2CC] text-lg mb-2">{title}</h3>
        <p className="text-[#FFF2CC]/60 text-xs leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

function StarIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
        </svg>
    )
}

import { AlertTriangle } from "lucide-react";
