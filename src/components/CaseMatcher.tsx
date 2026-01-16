import { useWizard } from "@/contexts/WizardContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Trophy, Users } from "lucide-react";
import { motion } from "framer-motion";

interface SuccessCase {
  id: string;
  title: string;
  tags: string[];
  painPoint: string;
  solution: string;
  saving: string;
  matchScore: number; // calculated dynamically
}

const CASE_LIBRARY: Omit<SuccessCase, 'matchScore'>[] = [
  {
    id: "case-1",
    title: "刘先生 (深圳/温哥华)",
    tags: ["CN", "CA", "real_estate"],
    painPoint: "面临加拿大高额离境税与CRS穿透风险",
    solution: "搭建加勒比离岸信托 + 加拿大非税务居民申报",
    saving: "$1,200,000 税负减免"
  },
  {
    id: "case-2",
    title: "张女士 (北京/旧金山)",
    tags: ["CN", "US", "insurance"],
    painPoint: "美籍子女继承国内资产面临40%遗产税",
    solution: "设立不可撤销人寿保险信托 (ILIT) + 赠与架构",
    saving: "$3,500,000 遗产税豁免"
  },
  {
    id: "case-3",
    title: "陈总 (上海/新加坡)",
    tags: ["CN", "SG", "equity"],
    painPoint: "企业上市前夕，担心家企资产混同风险",
    solution: "新加坡家族办公室 (13O) + 顶层控股重组",
    saving: "资产隔离 + 永续传承"
  },
  {
    id: "case-4",
    title: "王氏家族 (杭州/伦敦)",
    tags: ["CN", "UK", "cash"],
    painPoint: "英国汇款制税务居民 (RND) 身份规划",
    solution: "设立泽西岛信托 + 账户分层管理",
    saving: "£850,000 年度个税优化"
  },
  {
    id: "case-5",
    title: "李先生 (广州/澳洲)",
    tags: ["CN", "AU", "real_estate"],
    painPoint: "澳洲房产增值税与跨境继承法律冲突",
    solution: "澳洲全权信托 (Discretionary Trust) 置入房产",
    saving: "规避繁琐遗嘱认证 + 税务递延"
  }
];

export function CaseMatcher({ onSelect }: { onSelect?: () => void }) {
  const { data } = useWizard();

  // Calculate match score
  const matchedCases = CASE_LIBRARY.map(c => {
    let score = 0;
    // Match Identity (data.identities is now IdentityNode[])
    if (data.identities.some(i => c.tags.includes(i.region))) score += 30;
    // Match Assets
    if (data.assets.types.some(t => c.tags.includes(t))) score += 20;
    // Random jitter for demo variety
    score += Math.random() * 10;
    
    return { ...c, matchScore: score };
  }).sort((a, b) => b.matchScore - a.matchScore);

  const bestCase = matchedCases[0];

  if (!bestCase) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="relative group"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-amber-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
      <Card className="relative bg-[#0F213A] border-primary/20 overflow-hidden cursor-pointer hover:border-primary/50 transition-colors" onClick={onSelect}>
        <div className="absolute top-0 right-0 bg-primary text-[#0B1B32] text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
          <Star className="w-3 h-3 fill-current" />
          匹配度 {Math.min(99, Math.round(50 + bestCase.matchScore))}%
        </div>
        
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-white font-bold text-base">{bestCase.title}</div>
              <div className="flex gap-2 mt-1">
                {bestCase.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-[10px] h-4 px-1 bg-white/10 text-white/70 hover:bg-white/20 border-none">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3">
              <div className="text-red-400 text-xs font-bold mb-1 flex items-center gap-1">
                <Users className="w-3 h-3" /> 面临困境
              </div>
              <p className="text-white/80 text-xs leading-relaxed">{bestCase.painPoint}</p>
            </div>
            <div className="bg-green-950/30 border border-green-900/50 rounded-lg p-3">
              <div className="text-green-400 text-xs font-bold mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> 解决方案
              </div>
              <p className="text-white/80 text-xs leading-relaxed">{bestCase.solution}</p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/5 pt-3">
            <div className="text-xs text-white/50">
              核心成效：<span className="text-primary font-bold">{bestCase.saving}</span>
            </div>
            <Button size="sm" variant="ghost" className="h-6 text-xs text-primary hover:text-primary hover:bg-primary/10 p-0">
              查看详情 <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Helper icons
import { ShieldCheck } from "lucide-react";
