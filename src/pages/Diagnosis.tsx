import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useWizard } from "@/contexts/WizardContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip } from "recharts";
import { AlertTriangle, ShieldAlert, Lock, ChevronRight, XCircle, CheckCircle2, Plane, Lightbulb } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CaseMatcher } from "@/components/CaseMatcher";
import { motion } from "framer-motion";

// Mock Logic to generate score based on inputs
const RISK_EXPLANATIONS: Record<string, string> = {
  us_tax: "美国实行全球征税，绿卡持有者需向 IRS 申报全球收入。非美籍人士在美国境内的资产（如房产、股票）面临最高 40% 的遗产税，且免税额仅 $60,000。",
  crs: "中国已与 100+ 国家/地区进行 CRS 信息自动交换。您在海外的金融账户信息（余额、收益）将被穿透并反馈给中国税务机关，导致税务裸奔风险。",
  departure_tax: "加拿大/澳洲在税务居民离境（成为非税务居民）时，视为将所有资产按市价出售（Deemed Disposition），需立即缴纳高额资本利得税。",
  heirs: "法定继承可能导致股权分散。若子女婚变，在无婚前协议的情况下，家族资产可能被视为夫妻共同财产进行分割，导致控制权旁落。",
  frozen: "在地缘政治紧张局势下，特定国家可能对外国人的资产进行冻结或限制汇出。单一身份持有的海外资产缺乏法律隔离保护。"
};

const calculateScores = (data: any) => {
  let scores = { tax: 80, security: 85, succession: 90, privacy: 70, compliance: 85 };
  const risks: { id: string; text: string }[] = [];

  // Logic 1: US/UK Identity -> Tax Risk
  if (data.identities.includes('US') || data.identities.includes('UK')) {
    scores.tax -= 40;
    scores.compliance -= 20;
    risks.push({ id: 'us_tax', text: "美/英全球征税风险 (最高40%遗产税)" });
  }

  // Logic 2: High Assets -> Security Risk
  if (data.assets.foreign > 1) { // >5000w
    scores.security -= 30;
    scores.privacy -= 20;
    risks.push({ id: 'crs', text: "海外资产透明化 (CRS/FATCA穿透)" });
  }

  // Logic 2.5: Departure Tax (CA/AU)
  const departureTax = data.identities.includes('CA') || data.identities.includes('AU') || data.residence.includes('CA') || data.residence.includes('AU');
  if (departureTax) {
    scores.tax -= 30;
    scores.security -= 20;
    risks.push({ id: 'departure', text: "离境/弃籍清算税 (Deemed Disposition)" });
  }

  // Logic 3: Pain Points
  if (data.painPoints.includes('heirs')) {
    scores.succession -= 50;
    risks.push({ id: 'heirs', text: "二代婚变/挥霍导致的财富稀释" });
  }
  if (data.painPoints.includes('frozen')) {
    scores.security -= 40;
    risks.push({ id: 'frozen', text: "地缘政治导致的资产冻结/罚没" });
  }

  // Cap scores
  Object.keys(scores).forEach(k => {
    // @ts-ignore
    scores[k] = Math.max(20, Math.min(100, scores[k]));
  });

  return { scores, risks, departureTax };
};

export default function Diagnosis() {
  const [, setLocation] = useLocation();
  const { data } = useWizard();
  const [analysis, setAnalysis] = useState<any>(null);
  const [showLoss, setShowLoss] = useState(false);

  useEffect(() => {
    // Simulate calculation delay
    setTimeout(() => {
      setAnalysis(calculateScores(data));
    }, 1000);
  }, [data]);

  useEffect(() => {
    if (analysis) {
        setTimeout(() => setShowLoss(true), 1500); // Show loss simulator after radar
    }
  }, [analysis]);

  if (!analysis) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-white text-center">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-heading animate-pulse">正在扫描全球8大司法管辖区法律库...</h2>
        <p className="text-white/50 text-xs mt-2">Connecting to Global Legal Database...</p>
      </div>
    );
  }

  const radarData = [
    { subject: '税务筹划', A: analysis.scores.tax, fullMark: 100 },
    { subject: '资产安全', A: analysis.scores.security, fullMark: 100 },
    { subject: '家族传承', A: analysis.scores.succession, fullMark: 100 },
    { subject: '隐私保护', A: analysis.scores.privacy, fullMark: 100 },
    { subject: '合规性', A: analysis.scores.compliance, fullMark: 100 },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 overflow-x-hidden">
      {/* Header */}
      <div className="p-6 pt-10">
        <h1 className="text-2xl font-bold text-white mb-1 font-heading">财富健康诊断报告</h1>
        <p className="text-white/50 text-xs">生成时间: {new Date().toLocaleDateString()}</p>
      </div>

      {/* 1. Radar Chart */}
      <div className="h-[300px] w-full relative mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke="#ffffff20" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#D4AF37', fontSize: 12 }} />
            <Radar
              name="My Score"
              dataKey="A"
              stroke="#D4AF37"
              strokeWidth={2}
              fill="#D4AF37"
              fillOpacity={0.3}
            />
            <Tooltip 
                contentStyle={{ backgroundColor: '#0B1B32', border: '1px solid #ffffff20', color: '#fff' }}
                itemStyle={{ color: '#D4AF37' }}
            />
          </RadarChart>
        </ResponsiveContainer>
        <div className="absolute bottom-0 w-full text-center text-white/40 text-[10px]">
          您的综合健康分：<span className="text-4xl font-bold text-primary">{Math.round(Object.values(analysis.scores).reduce((a:any,b:any)=>a+b,0) as number / 5)}</span>
        </div>
      </div>

      {/* 2. Risk Traffic Lights */}
      <div className="px-6 space-y-4 mb-10">
        <h2 className="text-sm font-bold text-white/80 uppercase tracking-widest mb-4">关键风险警示</h2>
        {analysis.risks.map((risk: { id: string; text: string }, i: number) => (
          <motion.div 
            key={i}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.2 }}
            className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl flex items-start gap-3 relative group"
          >
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-red-400 font-bold text-sm flex items-center gap-2">
                高危警报
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/10 hover:bg-primary/20 transition-colors">
                      <Lightbulb className="w-3 h-3 text-primary animate-pulse" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="bg-[#0F213A] border-primary/20 text-white w-64 text-xs leading-relaxed p-4 shadow-xl">
                    <div className="font-bold text-primary mb-2 flex items-center gap-2">
                        <Lightbulb className="w-3 h-3" /> 专家解读
                    </div>
                    {RISK_EXPLANATIONS[risk.id] || "该风险涉及复杂的跨国法律适用冲突，建议咨询专家。"}
                  </PopoverContent>
                </Popover>
              </h3>
              <p className="text-white/80 text-sm mt-1 leading-relaxed">{risk.text}</p>
            </div>
          </motion.div>
        ))}
        {analysis.risks.length === 0 && (
            <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                    <h3 className="text-green-400 font-bold text-sm">状态良好</h3>
                    <p className="text-white/80 text-sm mt-1">初步扫描未发现重大硬伤。</p>
                </div>
            </div>
        )}
      </div>

      {/* 3. Loss Simulator */}
      {showLoss && (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-6 bg-white/5 border border-white/10 rounded-xl p-6 mb-10"
        >
            <div className="flex items-center gap-2 mb-6">
                <ShieldAlert className="w-5 h-5 text-orange-500" />
                <h2 className="font-bold text-white">代际传承损益模拟</h2>
            </div>
            
            <div className="space-y-6">
                {/* G1 */}
                <div className="relative pt-6">
                    <div className="flex justify-between text-xs text-white/60 mb-1">
                        <span>G1 (您)</span>
                        <span>100%</span>
                    </div>
                    <div className="h-3 bg-green-500/50 rounded-full w-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-green-500 w-full" />
                    </div>
                </div>

                {/* G2 */}
                <div className="relative">
                    <div className="absolute -left-3 top-0 h-full border-l-2 border-dashed border-white/10" />
                    <div className="flex justify-between text-xs text-white/60 mb-1">
                        <span>G2 (子女)</span>
                        <span className="text-orange-400">预计剩余 60%</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full w-full flex overflow-hidden">
                        <motion.div 
                            initial={{ width: "100%" }}
                            animate={{ width: "60%" }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className="bg-orange-500 h-full"
                        />
                        <div className="flex-1 bg-red-900/50 h-full relative">
                            <div className="absolute inset-0 flex items-center justify-center text-[8px] text-red-300 font-mono">
                                遗产税/律师费耗损
                            </div>
                        </div>
                    </div>
                </div>

                {/* G3 */}
                <div className="relative">
                    <div className="flex justify-between text-xs text-white/60 mb-1">
                        <span>G3 (孙辈)</span>
                        <span className="text-red-500">预计剩余 {analysis.departureTax ? '25%' : '35%'}</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full w-full flex overflow-hidden">
                        <motion.div 
                            initial={{ width: "100%" }}
                            animate={{ width: analysis.departureTax ? "25%" : "35%" }}
                            transition={{ duration: 2.5, ease: "easeOut", delay: 0.5 }}
                            className="bg-red-600 h-full"
                        />
                        <div className="flex-1 bg-red-900/50 h-full" />
                    </div>
                </div>

                {/* Departure Tax Warning */}
                {analysis.departureTax && (
                    <div className="relative pt-4 mt-2">
                        <div className="absolute -left-3 top-0 h-full border-l-2 border-dashed border-orange-500/30" />
                        <div className="flex justify-between text-xs text-white/60 mb-1">
                            <span className="flex items-center gap-1 text-orange-400"><Plane className="w-3 h-3" /> 离境清算税 (Deemed Disposition)</span>
                            <span className="text-orange-400">-$2,500,000</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full w-full overflow-hidden">
                            <motion.div 
                                initial={{ width: "0%" }}
                                animate={{ width: "25%" }}
                                transition={{ duration: 1, delay: 1 }}
                                className="bg-orange-500 h-full"
                            />
                        </div>
                    </div>
                )}
            </div>

            <p className="mt-6 text-xs text-white/40 text-center leading-relaxed">
                *基于当前架构推演。{analysis.departureTax ? '由于触发离境税机制，资产减损将加速发生。' : '若不进行隔离规划，三代之后财富可能缩水至 1/3。'}
            </p>
        </motion.div>
      )}

      {/* 4. Case Matcher */}
      <div className="px-6 mb-24">
        <h2 className="text-sm font-bold text-white/80 uppercase tracking-widest mb-4">相似案例参考</h2>
        <CaseMatcher />
      </div>

      {/* Next Button */}
      <div className="fixed bottom-6 left-6 right-6 z-50">
        <Button 
            size="lg" 
            onClick={() => setLocation("/solution")}
            className="w-full h-14 bg-primary text-background font-bold text-lg shadow-xl shadow-primary/20 animate-bounce-subtle"
        >
            查看解决方案 <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
