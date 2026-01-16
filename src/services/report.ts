import { MemberService, type FamilyMember, RELATION_LABELS, GENERATION_LEVEL } from "./member";
import { AssetService, type Asset, ASSET_TYPE_LABELS, HOLDING_TYPE_LABELS } from "./asset";
import { PainPointService, PAIN_POINT_LABELS, type PainPoint } from "./painPoint";
import { toast } from "sonner";

export interface ReportContent {
  summary: string;
  analysis: string;
  conclusion: string;
}

export interface GeneratedReport {
  id: string;
  caseId: string;
  caseStatement: string; // Legacy
  planning: string;      // Legacy
  fullReport: string;    // Legacy
  content?: ReportContent; 
  history?: {
    id: string;
    timestamp: string;
    content: ReportContent;
  }[];
  createdAt: string;
}

const STORAGE_KEY_REPORTS = 'wealth_reports';

// --- Gemini API Helpers ---

const getAIConfig = () => {
  const apiKey = localStorage.getItem("wealth_ai_key");
  const accessCode = localStorage.getItem("wealth_access_code");
  const modelRaw = localStorage.getItem("wealth_ai_model") || "deepseek-chat";
  const model = modelRaw.startsWith("custom:") ? modelRaw.replace("custom:", "") : modelRaw;
  
  const proxyMode = (localStorage.getItem("wealth_proxy_mode") as "none" | "local" | "cloud") || "none";
  const customProxyUrl = localStorage.getItem("wealth_proxy_url") || "http://localhost:3000/api/generate";
  
  let activeProxyUrl = "";
  if (proxyMode === "cloud") {
      activeProxyUrl = "/api/generate"; // Relative path for Vercel
  } else if (proxyMode === "local") {
      activeProxyUrl = customProxyUrl;
  }

  return { apiKey, accessCode, model, proxyMode, activeProxyUrl };
};

const callDeepSeek = async (prompt: string): Promise<string | null> => {
  const { apiKey, accessCode, model, proxyMode, activeProxyUrl } = getAIConfig();
  
  if (!apiKey && proxyMode === "none") {
    console.warn("No API Key found for direct mode.");
    throw new Error("直连模式下必须配置 API Key");
  }

  try {
    let url = "";
    let headers: Record<string, string> = { 'Content-Type': 'application/json' };
    let body = {};

    const messages = [{ role: "user", content: prompt }];

    if (proxyMode !== "none") {
      // PROXY MODE (Local or Cloud)
      url = activeProxyUrl;
      body = {
        apiKey,
        accessCode,
        model,
        messages
      };
    } else {
      // DIRECT MODE (DeepSeek)
      url = 'https://api.deepseek.com/chat/completions';
      headers['Authorization'] = `Bearer ${apiKey}`;
      body = {
        model,
        messages,
        stream: false
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API Error Body:", errorText);
      
      let errorMsg = `API 请求失败 (${response.status} ${response.statusText})`;
      try {
          const errorJson = JSON.parse(errorText);
          const details = errorJson.error?.message || errorJson.error || errorJson.message;
          if (details) {
              errorMsg += `: ${details}`;
          }
      } catch (e) {
          if (errorText.length < 200) errorMsg += `: ${errorText}`;
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    
    if (!text) {
        throw new Error("AI 返回内容为空");
    }
    
    return text;
  } catch (e: any) {
    console.error("DeepSeek API Error:", e);
    
    const msg = e.message || "";
    
    if (msg.includes("401")) {
        toast.error("鉴权失败 (401)。请检查 API Key 或访问密码。");
    } else if (msg.includes("402")) {
        toast.error("余额不足 (402)。请检查 DeepSeek 账户余额。");
    } else if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        if (proxyMode === "local") {
          toast.error(`本地代理未启动。请运行 'node proxy-server.js'。`);
        } else if (proxyMode === "cloud") {
          toast.error(`云端连接超时。请检查网络或稍后重试。`);
        } else {
          toast.error(`直连 API 失败。建议使用代理模式。`);
        }
    } else {
        toast.error(`生成出错: ${msg}`);
    }
    
    throw e;
  }
};

// --- Prompt Builders ---

const getUSDValue = (amount: number, currency: string) => {
    // Simple mock conversion for prompt context estimation
    if (currency === 'USD') return amount;
    if (currency === 'CNY') return amount / 7.2;
    if (currency === 'HKD') return amount / 7.8;
    if (currency === 'GBP') return amount * 1.25;
    return amount;
};

const buildContextPrompt = (members: FamilyMember[], assets: Asset[], painPoints: PainPoint[]) => {
  const self = members.find(m => m.relation === 'self');
  const assetTotal = assets.reduce((sum, a) => sum + getUSDValue(a.marketValue, a.currency), 0);
  
  return `
你是一位专业的家族财富规划师。请根据以下客户档案信息，完成指定的写作任务。

【客户档案】
1. 核心信息: ${self ? self.name : '客户'}，${self?.age || '未知'}岁。
   - 国籍: ${self?.nationality || '未填'}
   - 税务居民: ${self?.taxResidencies?.join(',') || '未填'}
   - 居住地: ${self?.residence || '未填'}
   - 健康状况: ${self?.healthStatus || '未知'}
   - 婚姻状况: ${self?.maritalStatus || '未知'}

2. 家庭成员 (${members.length}人):
${members.map(m => `- ${m.name} (${RELATION_LABELS[m.relation] || m.relation}): ${m.age}岁, 国籍:${m.nationality}, 税务居民:${m.taxResidencies?.join(',')}, 居住:${m.residence}, 健康:${m.healthStatus}`).join('\n')}

3. 资产状况 (总值约 $${Math.round(assetTotal/10000)}万 USD):
${assets.map(a => `- [${ASSET_TYPE_LABELS[a.type]}] ${a.name} (${a.location}): 市值 ${a.marketValue} ${a.currency}
    持有: ${HOLDING_TYPE_LABELS[a.holdingType]} (${a.ownerId})
    备注: ${a.notes || '无'}
    ${a.costBase ? `成本: ${a.costBase}` : ''}
    ${a.isPassive ? '属性: 被动资产(Passive)' : ''}`).join('\n')}

4. 客户关注痛点:
${painPoints.map(p => `- ${PAIN_POINT_LABELS[p.type]}: ${p.description || ''}`).join('\n')}
`;
};

// --- Service ---

export const ReportService = {
  getReportByCase: (caseId: string): GeneratedReport | null => {
    const str = localStorage.getItem(STORAGE_KEY_REPORTS);
    if (!str) return null;
    const reports: GeneratedReport[] = JSON.parse(str);
    return reports.find(r => r.caseId === caseId) || null;
  },

  saveReport: (report: GeneratedReport) => {
    const str = localStorage.getItem(STORAGE_KEY_REPORTS);
    const reports: GeneratedReport[] = str ? JSON.parse(str) : [];
    const index = reports.findIndex(r => r.caseId === report.caseId);
    if (index >= 0) {
      reports[index] = report;
    } else {
      reports.push(report);
    }
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
  },

  generateAll: async (caseId: string): Promise<GeneratedReport> => {
    // Legacy support wrapper, mostly unused now as SmartReportView calls generateSmartReportContent directly
    const content = await ReportService.generateSmartReportContent(caseId);
    const report: GeneratedReport = {
      id: `rep-${Date.now()}`,
      caseId,
      caseStatement: content.summary,
      planning: content.analysis,
      fullReport: content.conclusion,
      content,
      createdAt: new Date().toISOString()
    };
    ReportService.saveReport(report);
    return report;
  },

  // Test connection to verify API Key
  testConnection: async (apiKey: string, model: string, accessCode: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const prompt = "Hello";
      const { proxyMode, activeProxyUrl } = getAIConfig();
      
      let url = "";
      let headers: Record<string, string> = { 'Content-Type': 'application/json' };
      let body = {};
      const messages = [{ role: "user", content: prompt }];

      if (proxyMode !== "none") {
        url = activeProxyUrl;
        body = { apiKey, accessCode, model, messages };
      } else {
        url = 'https://api.deepseek.com/chat/completions';
        headers['Authorization'] = `Bearer ${apiKey}`;
        body = { model, messages, stream: false };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const text = await response.text();
        let errorDetails = `Status: ${response.status} (${response.statusText})`;
        try {
            const json = JSON.parse(text);
            const errMsg = json.error?.message || json.error || JSON.stringify(json);
            if (errMsg) errorDetails += `\nMessage: ${errMsg}`;
        } catch {
            if (text) errorDetails += `\nRaw: ${text.substring(0, 300)}`;
        }
        return { success: false, message: errorDetails };
      }
      return { success: true };
    } catch (e: any) {
      console.error("Connection Test Failed:", e);
      return { success: false, message: e.message || "Unknown Network Error" };
    }
  },

  // New smart report generation method (returns JSON object)
  generateSmartReportContent: async (caseId: string): Promise<{ summary: string; analysis: string; conclusion: string }> => {
    let members: FamilyMember[] = [];
    let assets: Asset[] = [];
    let painPoints: PainPoint[] = [];

    try {
      members = await MemberService.getMembersByCase(caseId);
      assets = await AssetService.getAssetsByCase(caseId);
      painPoints = await PainPointService.getByCase(caseId);
      
      // 1. Prompt for Summary
      const summaryPrompt = `
      ${buildContextPrompt(members, assets, painPoints)}
      
      【任务】
      请撰写《家族财富管理执行摘要》(Executive Summary)。
      
      【要求】
      1. **篇幅要求**：总字数**不得少于 800 字**，控制在 1000 字以内。
      2. **段落结构**：请分为 2-3 个长段落。
         - 第一段：宏观综述家族的代际结构、国籍分布特点以及全球资产布局（需提及具体资产类别和总估值量级），展现专业洞察。
         - 第二段：深入剖析家族当前面临的战略性挑战（如跨国税务合规、控制权传承、资产隔离等），点出核心矛盾。
      3. **语言风格**：使用顶级家族办公室的专业顾问口吻，客观、冷静、深邃。
      4. **格式限制**：输出纯文本段落，**严禁**使用任何标题、列表或 bullet points，**严禁**使用感叹号 (!)。
      `;

      // 2. Prompt for Deep Analysis
      const analysisPrompt = `
      ${buildContextPrompt(members, assets, painPoints)}
      
      【任务】
      请撰写《痛点与风险深度剖析》章节。
      
      【核心要求】
      1. **前置综述（新增）**：文章开头必须有一段**不少于 500 字**的综述，将客户已提出的所有痛点进行有机串联，形成一个整体的风险图景。
      2. **深度挖掘**：针对每一个具体痛点，进行深度逻辑推导（现状 -> 潜在触发点 -> 法律/经济后果）。
      3. **潜在风险总结（新增）**：在文章最后，**必须增加一个不少于 500 字的独立总结段落**。基于你的专业判断，指出客户**未曾提到**但极有可能存在的隐蔽风险（例如：二代婚变风险、代持协议失效风险、CRS/FATCA 穿透风险等）。
      4. **格式严格限制**：
         - **严禁使用 Markdown 列表** (如 - 或 1.)。
         - **必须使用长段落叙事**。
         - **严禁使用感叹号 (!)**。
         - 关键法律术语、税务概念或严重后果请使用 **加粗** 强调。
      `;

      // 3. Prompt for Conclusion
      const conclusionPrompt = `
      ${buildContextPrompt(members, assets, painPoints)}
      
      【任务】
      请撰写《全篇总结与建议》(Final Conclusion)。
      
      【核心要求】
      1. **篇幅要求**：总字数**必须在 1000 字以上**。
      2. **结构要求**：请写成一篇完整的长文，包含至少 3-4 个段落。
         - 第一段：回顾家族财富现状与核心风险图谱。
         - 第二段：提出短期（1-3年）的战术性整改建议（如架构搭建、税务申报）。
         - 第三段：描绘长期（10年以上）的治理愿景（如家族宪章、精神传承）。
      3. **格式限制**：
         - **严禁**使用列表。
         - **严禁**使用感叹号 (!)。
         - 使用连贯、流畅的段落文字。
         - 语气恳切且专业。
      `;

      // Parallel Execution
      const [summary, analysis, conclusion] = await Promise.all([
        callDeepSeek(summaryPrompt),
        callDeepSeek(analysisPrompt),
        callDeepSeek(conclusionPrompt)
      ]);

      if (summary && analysis && conclusion) {
        return { summary, analysis, conclusion };
      } else {
        throw new Error("AI 生成内容不完整");
      }
    } catch (e: any) {
      console.error("Smart Report Generation Error:", e);
      // Re-throw so UI knows it failed. NO FALLBACK to mock data.
      throw e;
    }
  },

  // Legacy stubs (unused but kept for type safety if called elsewhere)
  generateCaseStatement: async (caseId: string) => "",
  generatePlanning: async (caseId: string) => "",
  generateProfessionalReport: async (caseId: string) => ""
};
