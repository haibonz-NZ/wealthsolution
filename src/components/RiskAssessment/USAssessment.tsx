import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle2, ChevronRight, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface USAssessmentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (risks: string[]) => void;
  roleLabel: string;
}

export function USAssessment({ open, onOpenChange, onComplete, roleLabel }: USAssessmentProps) {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [risks, setRisks] = useState<string[]>([]);

  // Five levels of triggers as per requirement
  const QUESTIONS = [
    {
      id: "level1",
      title: "一级触发：身份性质判定",
      questions: [
        { id: "q1_1", text: "该成员持有美国护照、绿卡，或正在申请绿卡？", risk: "US_TAX_PERSON" },
        { id: "q1_2", text: "该成员本年度是否在美居住超过 31 天，且三年累计满 183 天？", risk: "SUBSTANTIAL_PRESENCE_TEST" },
        { id: "q1_3", text: "该成员是否为美国长期居民，且目前计划放弃身份？", risk: "EXIT_TAX_EXPAT_RISK" }
      ]
    },
    {
      id: "level2",
      title: "二级触发：跨境财富传染",
      questions: [
        { id: "q2_1", text: "是否会接收来自非美人士超过 10 万美元的赠与？", risk: "3520_REPORTING_OBLIGATION" },
        { id: "q2_2", text: "未来是否会继承您名下的非美资产（如香港股权）？", risk: "ESTATE_TAX_CONTAGION" }
      ]
    },
    {
      id: "level3",
      title: "三级触发：被动海外投资与股权",
      questions: [
        { id: "q3_1", text: "是否持有非美国公司超过 10% 的股份或投票权？", risk: "CFC_CONTROLLED_FOREIGN_CORP" },
        { id: "q3_2", text: "是否持有非美国境内的共同基金、理财产品或 ETF？", risk: "PFIC_PASSIVE_FOREIGN_INVEST" }
      ]
    },
    {
      id: "level4",
      title: "四级触发：保险合规性扫描",
      questions: [
        { id: "q4_1", text: "是否持有非美国签发的大额人寿保单？", risk: "FOREIGN_POLICY_HOLDER" },
        { id: "q4_2", text: "保单现金价值是否已经过美国税法 7702 条款测试？", risk: "NON_COMPLIANT_INS_TAX_TRAP", condition: "no" } // trigger if answer is NO/Unknown
      ]
    },
    {
      id: "level5",
      title: "五级触发：海外信托申报",
      questions: [
        { id: "q5_1", text: "是否为任何非美国信托的委托人、受益人或保护人？", risk: "FOREIGN_TRUST_BENEFICIARY" },
        { id: "q5_2", text: "信托是否会向其分配收益，或曾向信托转移资产？", risk: "3520A_FOREIGN_TRUST_COMPLIANCE" }
      ]
    }
  ];

  const handleAnswer = (qId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleNext = () => {
    // Collect risks from current step
    const currentQ = QUESTIONS[step - 1];
    const newRisks = [...risks];
    
    currentQ.questions.forEach(q => {
      const val = answers[q.id];
      // Default trigger is "yes", unless specific condition
      const triggerVal = q.condition || "yes"; 
      if (val === triggerVal) {
        newRisks.push(q.risk);
        // Special case: 7702 test "no" means risk
        if (q.id === "q4_2" && val === "no") newRisks.push("NON_COMPLIANT_INS_TAX_TRAP");
      }
    });
    setRisks(newRisks);

    if (step < QUESTIONS.length) {
      setStep(step + 1);
    } else {
      onComplete(newRisks);
      onOpenChange(false);
    }
  };

  const currentLevel = QUESTIONS[step - 1];
  const progress = (step / QUESTIONS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#FFF2CC] border-[#B87845] text-[#0C2340] max-w-md p-0 overflow-hidden shadow-2xl">
        {/* Header with Progress */}
        <div className="bg-[#0C2340] p-4 text-white relative">
          <div className="flex items-center justify-between mb-2">
            <DialogTitle className="text-sm font-heading tracking-widest text-[#B87845]">
              美国税务深度扫描
            </DialogTitle>
            <span className="text-xs font-mono text-white/50">{step}/{QUESTIONS.length}</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#B87845]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-[#FFF2CC]/80">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            正在分析 {roleLabel} 的 {currentLevel.title.split('：')[1]}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {currentLevel.questions.map((q) => (
                <div key={q.id} className="space-y-3">
                  <Label className="text-sm font-bold text-[#0C2340] leading-relaxed">
                    {q.text}
                  </Label>
                  <RadioGroup 
                    value={answers[q.id]} 
                    onValueChange={(v) => handleAnswer(q.id, v)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id={`${q.id}-yes`} className="border-[#B87845] text-[#B87845]" />
                      <Label htmlFor={`${q.id}-yes`} className="font-normal text-xs cursor-pointer">是</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id={`${q.id}-no`} className="border-[#B87845] text-[#B87845]" />
                      <Label htmlFor={`${q.id}-no`} className="font-normal text-xs cursor-pointer">否</Label>
                    </div>
                  </RadioGroup>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <DialogFooter className="p-4 bg-[#0C2340]/5 border-t border-[#B87845]/10">
          <Button 
            onClick={handleNext} 
            className="w-full bg-[#0C2340] text-[#FFF2CC] hover:bg-[#0C2340]/90"
            disabled={!currentLevel.questions.every(q => answers[q.id])}
          >
            {step === QUESTIONS.length ? "完成扫描" : "下一步"} <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
