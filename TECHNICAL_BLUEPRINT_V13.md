# 跨国家族办公室系统 - V13.0 全栈开发蓝图 (The Technical Blueprint)

**版本**：V13.0
**性质**：技术设计文档 (TDD)
**受众**：高级前端工程师、架构师
**目标**：提供“复制粘贴级”的代码逻辑和组件规范，消除所有实现歧义。

---

## 1. 全局数据架构 (Global Data Architecture)

### 1.1 类型定义 (`src/contexts/WizardContext.tsx`)

这是系统的数据脊梁。所有页面必须严格遵循此 Schema。

```typescript
// 8大核心管辖区枚举
export type IdentityRegion = "CN" | "HK" | "US" | "UK" | "CA" | "AU" | "SG" | "JP" | "OTHER";

// 家庭角色枚举
export type RoleType = "self" | "spouse" | "child" | "parent" | "grandchild";

// 身份节点（拖拽生成的对象）
export interface IdentityNode {
  id: string;           // UUID, e.g., "id-17098234"
  role: RoleType;       // 角色
  region: IdentityRegion; // 所在国家
  risks: string[];      // 触发的风险标签, e.g., ["US_TAX_PERSON", "PFIC"]
  meta?: {              // 额外元数据
    daysInCountry?: number; // 居住天数
    citizenship?: boolean;  // 是否公民
  };
}

// 资产结构
export interface AssetProfile {
  domesticLevel: 0 | 1 | 2 | 3; // 0:<1000w, 1:1-5kw, 2:5kw-1e, 3:>1e
  foreignLevel: 0 | 1 | 2 | 3;  // 0:<100w, 1:1-500w, 2:500-2000w, 3:>2000w
  types: Array<"real_estate" | "equity" | "cash" | "insurance" | "trust" | "crypto">;
}

// 全局状态上下文
export interface WizardData {
  advisorId?: string;       // 顾问ID (from URL)
  identities: IdentityNode[]; // 身份拓扑
  assets: AssetProfile;     // 资产概况
  painPoints: string[];     // 痛点 ID 列表
  leadInfo?: {              // 留资信息
    phone: string;
    submittedAt: string;
  };
}
```

### 1.2 持久化存储 (LocalStorage)
*   **Key**: `gwrc_wizard_data`
*   **Strategy**: `useEffect` 监听 `data` 变化自动写入；应用启动时 `useState` 懒加载读取。
*   **防腐层**: 读取时必须校验 `identities` 是否为数组，防止旧版本数据导致白屏（已在 V6.4 实现）。

---

## 2. 核心算法实现 (Core Algorithms)

### 2.1 诊断评分算法 (`src/lib/riskEngine.ts`)

直接使用此代码计算雷达图数据。

```typescript
export const calculateRiskScore = (data: WizardData) => {
  let scores = { 
    tax: 100,        // 税务筹划
    security: 100,   // 资产安全
    succession: 100, // 家族传承
    privacy: 100,    // 隐私保护
    compliance: 100  // 合规性
  };
  
  const risks: string[] = []; // 收集触发的风险标签

  // --- 规则 1: 美国税务渗透 ---
  const usNodes = data.identities.filter(n => n.region === 'US');
  if (usNodes.length > 0) {
    scores.tax -= 30;       // 全球征税严重扣分
    scores.compliance -= 20; // 申报义务重
    scores.privacy -= 10;    // FATCA 透明化
    risks.push("US_TAX_PERSON");
    
    // 子规则: 赠与风险
    if (usNodes.some(n => n.risks.includes('GIFT_REPORTING'))) {
      scores.tax -= 10;
      risks.push("US_GIFT_RISK");
    }
  }

  // --- 规则 2: 加/澳 离境税 ---
  const exitNodes = data.identities.filter(n => ['CA', 'AU'].includes(n.region));
  if (exitNodes.length > 0) {
    // 假设未来可能回流或变动
    scores.tax -= 20;
    scores.security -= 15; // 资产锁定
    risks.push("DEPARTURE_TAX_RISK");
  }

  // --- 规则 3: 日本继承税 ---
  const jpNodes = data.identities.filter(n => n.region === 'JP' && n.risks.includes('JP_UNLIMITED_LIABILITY'));
  if (jpNodes.length > 0) {
    scores.tax -= 40;        // 55% 继承税极高
    scores.succession -= 30; // 传承几乎腰斩
    risks.push("JP_INHERITANCE_TAX");
  }

  // --- 规则 4: 资产结构风险 ---
  if (data.assets.types.includes('trust') && usNodes.length > 0) {
    scores.compliance -= 25; // 3520A 申报极其复杂
    risks.push("US_FOREIGN_TRUST_TRAP");
  }
  
  if (data.assets.types.includes('equity') && data.assets.foreign > 1) {
    scores.privacy -= 20; // CRS 穿透概率大
    risks.push("CRS_EXPOSURE");
  }

  // --- 规则 5: 痛点修正 ---
  if (data.painPoints.includes('heirs')) scores.succession -= 20;
  if (data.painPoints.includes('divorce')) scores.security -= 20;

  // 归一化 (最低 30 分)
  Object.keys(scores).forEach(k => {
    scores[k] = Math.max(30, scores[k]);
  });

  return { scores, risks };
};
```

### 2.2 损益模拟算法 (`src/lib/lossSimulator.ts`)

```typescript
export const calculateLoss = (data: WizardData) => {
  // 1. 估算总资产 (基于滑块区间取中值)
  const domesticMap = [5000000, 30000000, 75000000, 200000000]; // RMB
  const foreignMap = [500000, 3000000, 12500000, 50000000];     // USD
  
  const totalUSD = (domesticMap[data.assets.domestic] / 7.2) + foreignMap[data.assets.foreign];
  
  let lossAmount = 0;
  let breakdown = [];

  // --- 场景 A: 遗产税 (Estate Tax) ---
  // 假设 40% 资产暴露在美国/英国/日本管辖下
  const hasHighTaxRes = data.identities.some(n => ['US', 'UK', 'JP'].includes(n.region));
  if (hasHighTaxRes) {
    const exposedAssets = totalUSD * 0.4; 
    const taxRate = 0.40; // 平均 40%
    const taxLoss = exposedAssets * taxRate;
    lossAmount += taxLoss;
    breakdown.push({ label: "跨境遗产税", amount: taxLoss, color: "bg-red-500" });
  }

  // --- 场景 B: 离境税 (Exit Tax) ---
  const hasExitRisk = data.identities.some(n => ['CA', 'AU'].includes(n.region));
  if (hasExitRisk) {
    // 假设 50% 资产为增值部分，税率 25%
    const exitLoss = totalUSD * 0.5 * 0.25;
    lossAmount += exitLoss;
    breakdown.push({ label: "离境/视同售出税", amount: exitLoss, color: "bg-orange-500" });
  }

  // --- 场景 C: 行政/法律摩擦 ---
  const legalLoss = totalUSD * 0.05; // 固定 5%
  lossAmount += legalLoss;
  breakdown.push({ label: "跨国法律/行政成本", amount: legalLoss, color: "bg-yellow-500" });

  const remainingRatio = Math.max(0.3, (totalUSD - lossAmount) / totalUSD);
  
  return {
    totalUSD,
    lossAmount,
    remainingRatio,
    breakdown
  };
};
```

---

## 3. 页面详细实现指南 (Page Specs)

### 3.1 身份录入页 (`IdentityStep.tsx`)
**交互难点**：`dnd-kit` 与 模态框 的配合。

*   **状态机 (State Machine)**:
    *   `IDLE`: 等待拖拽。
    *   `DRAGGING`: 托盘图标半透明，地图热区高亮。
    *   `DROPPED`: 触发 `handleDragEnd`。
        *   `IF target == 'US'`: 进入 `MODAL_US` 状态。
        *   `IF target == 'JP'`: 进入 `MODAL_JP` 状态。
        *   `ELSE`: 直接添加节点，回 `IDLE`。
    *   `MODAL_XX`: 显示问卷。
        *   `ON_CONFIRM`: 将问卷结果 (Risks) 写入节点，添加节点，回 `IDLE`。
        *   `ON_CANCEL`: 撤销拖拽，回 `IDLE`。

*   **UI 细节**:
    *   **身份锚点 (Avatar)**: `w-12 h-12 rounded-full border-2 border-primary bg-secondary`.
    *   **国旗图标**: 使用 `flag-icons` 或 SVG，当节点落位时显示在头像右下角 `absolute bottom-0 right-0`.

### 3.2 诊断页 (`Diagnosis.tsx`)
**交互难点**：动画时序 (Sequence)。

*   **动画序列**:
    1.  `T=0s`: 页面加载，显示 "AI 正在分析..." Loading 遮罩。
    2.  `T=1.5s`: 遮罩淡出，**五维雷达图** 从中心弹开 (Scale 0->1)。
    3.  `T=2.0s`: **风险红绿灯** 卡片依次滑入 (Staggered Fade In)。
    4.  `T=3.0s`: **损益进度条** 开始滚动缩减 (Width 100% -> 40%)。

---

## 4. 样式规范 (Tailwind Design Tokens)

请在 `tailwind.config.js` 或 `index.css` 中严格定义：

```css
@theme inline {
  /* 品牌色 */
  --color-primary: #B87845;    /* 古铜金 */
  --color-background: #0C2340; /* 深邃蓝 */
  --color-surface: #FFF2CC;    /* 奶油白 */
  
  /* 字体 */
  --font-heading: 'Cinzel', serif;
  --font-body: 'Lato', sans-serif;
  
  /* 动画曲线 */
  --ease-luxury: cubic-bezier(0.22, 1, 0.36, 1);
}
```

---

**文档说明**：
本蓝图 (Blueprint) 是 V12 规格书的代码级实现版本。
请开发团队直接复制第 2 节的算法代码，并参照第 3 节的状态机逻辑编写组件。
这是一份**“照做即可”**的执行文档。
