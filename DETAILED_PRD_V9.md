# 跨国家族办公室全球资产规划智能报告系统 - 终极深度产品需求文档 (PRD V9.0)

**版本**：V9.0 (Ultimate Detailed Edition)
**密级**：Internal
**核心目标**：将“顾问生产力引擎”的概念转化为像素级、代码级的执行标准。

---

## 1. 系统架构与用户角色 (System Architecture)

### 1.1 用户画像 (Persona)
*   **核心用户 (The Advisor)**：资深家族办公室顾问、私人银行家、保险MDRT。
    *   *特征*：不懂代码，懂基础金融，需要一个“外脑”来辅助面谈和生成专业报告。
    *   *场景*：咖啡厅（iPad演示）、办公室（PC大屏汇报）。
*   **终端受众 (The Client)**：高净值企业家（资产 > 1亿人民币）。
    *   *特征*：极其关注隐私，痛恨填表，对“风险”敏感。

### 1.2 核心流程 (Core Workflow)
1.  **录入 (Input)**：顾问通过“可视化图谱”和“拖拽式地图”完成信息采集。
2.  **诊断 (Diagnose)**：**规则引擎 (Rule Engine)** 实时扫描红绿灯风险。
3.  **计算 (Compute)**：**损益模拟器** 计算离境税/遗产税具体金额。
4.  **生成 (Generate)**：**AI 引擎 (DeepSeek)** 基于规则结果撰写深度分析。
5.  **交付 (Deliver)**：顾问使用 **在线编辑器** 微调内容，导出 PDF。

---

## 2. 功能模块详细规格 (Detailed Specifications)

### 2.1 模块一：身份与资产录入 (Visual Data Entry)

**A. 家族图谱 (Family Tree)**
*   **交互逻辑**：
    *   **节点定义**：本人 (Root)、配偶、子女 (多名)、父母、孙辈。
    *   **连线逻辑**：婚姻线 (Solid/Dashed for Ex-spouse)、血缘线。
    *   **状态标记**：每个节点需标记 `Health` (健康/重疾) 和 `Tax_Residency` (税务居民国)。
*   **字段级校验**：
    *   `Nationality`: 必填，下拉选择 (CN/US/CA/AU/UK/SG/JP/HK)。
    *   `Days_In_Country`: 若选 US/UK，必填“年居住天数” (用于 183 天判定)。

**B. 资产拖拽地图 (Asset Mapping)**
*   **交互逻辑**：
    *   左侧列表：显示已录入的家族成员头像。
    *   右侧地图：8 大司法管辖区热区。
    *   **动作**：拖拽“长子头像”到“美国地图” -> 弹出资产配置弹窗。
*   **资产弹窗字段**：
    *   `Type`: 房产 / 股权 / 现金 / 保单 / 信托。
    *   `Value`: 数值输入 (原币种)，自动换算 USD。
    *   `Holding`: 代持 (Yes/No) / 联名 (Joint) / 公司持有。

---

### 2.2 模块二：战略诊断规则引擎 (Rule Engine Logic) —— **核心算法**

*此模块不依赖 AI，而是硬编码的 `if-else` 逻辑，确保诊断的绝对准确性。*

#### 规则组 A：美国税务陷阱 (US Tax Traps)
*   **R1: 美籍身份判定 (US Person Test)**
    *   `Logic`: IF (Nationality == 'US' OR GreenCard == True OR Days_In_US >= 183)
    *   `Output`: 🔴 **红灯** | 标签: `US_GLOBAL_TAX`
    *   `Message`: "该成员为美国税务居民，全球收入需向 IRS 申报。"
*   **R2: 离岸信托穿透 (3520/3520A)**
    *   `Logic`: IF (R1 == True) AND (Beneficiary_Of_Trust == Non_US_Trust)
    *   `Output`: 🔴 **红灯** | 标签: `US_FOREIGN_TRUST`
    *   `Message`: "美籍受益人接收离岸信托分配，面临 UNI 惩罚性税率及繁琐申报。"
*   **R3: 跨代赠与申报 (Form 3520)**
    *   `Logic`: IF (R1 == True) AND (Gift_From_Non_US > 100,000 USD)
    *   `Output`: 🟡 **黄灯** | 标签: `GIFT_REPORTING`
    *   `Message`: "接收非美人士大额赠与需申报，否则面临 25% 罚款。"

#### 规则组 B：加/澳离境潜规则 (Departure Tax)
*   **R4: 加拿大视同售出 (Deemed Disposition)**
    *   `Logic`: IF (Nationality == 'CA') AND (Status == 'Planning_To_Leave') AND (Global_Assets > 0)
    *   `Output`: 🔴 **红灯** | 标签: `CA_DEPARTURE_TAX`
    *   `Message`: "离开加拿大时，名下全球资产（除特定豁免外）将被视为按市价出售，需立即缴纳资本利得税。"

#### 规则组 C：架构风险 (Structural Risk)
*   **R5: 代持风险 (Nominee Risk)**
    *   `Logic`: IF (Asset_Note contains '代持')
    *   `Output`: 🔴 **红灯** | 标签: `LEGAL_TITLE_RISK`
    *   `Message`: "代持协议在法律上极其脆弱，面临代持人债务牵连、意外死亡、道德背叛三重风险。"

---

### 2.3 模块三：损益模拟器 (Loss Simulator) —— **算法定义**

*前端需实现以下具体的计算公式，用于绘制“资产缩水进度条”。*

**场景 1：美籍子女继承中国房产**
*   **输入**：`Estate_Value` (遗产总值)
*   **公式**：
    *   免税额 `Exemption` = $60,000 (非美籍赠与人)
    *   应税额 `Taxable` = max(0, Estate_Value - Exemption)
    *   **税负 `Tax_Loss` = Taxable * 40% (联邦遗产税率)**
*   **输出**：红色扣减条，显示 "预计税务损耗: $X,XXX,XXX"

**场景 2：无规划的法定继承 (Intestacy)**
*   **输入**：`Total_Assets`
*   **公式**：
    *   律师/公证费 `Legal_Cost` = Total_Assets * 3%
    *   资产冻结期损耗 `Liquidity_Loss` = Total_Assets * 5% (因无法交易导致的市场波动/折价)
    *   **总损耗 = 8%**
*   **输出**：黄色扣减条，显示 "行政摩擦成本"。

---

### 2.4 模块四：报告生成与编辑器 (Report Generation)

#### A. JSON 结构化协议 (Backend -> AI)
后端向 DeepSeek 发送请求时，必须要求返回如下严格 JSON：

```json
{
  "executive_summary": {
    "content": "这里写800字的摘要...",
    "key_tags": ["跨境风险", "代际传承"]
  },
  "risk_analysis": [
    {
      "rule_id": "US_GLOBAL_TAX",
      "title": "美国全球征税风险",
      "deep_dive": "详细分析...",
      "severity": "high"
    }
  ],
  "strategic_plan": {
    "short_term": ["完成资产盘点", "补申报3520表"],
    "long_term": ["设立南达科他州信托", "购买PPLI"]
  }
}
```

#### B. 报告编辑器 (Frontend Editor)
*   **组件选型**：`Tiptap` (React Headless Editor)。
*   **功能要求**：
    *   **只读/编辑模式切换**：默认只读，点击“编辑”按钮进入修订模式。
    *   **块操作**：支持对 Summary、Risk、Plan 三大块进行独立的重写。
    *   **样式保留**：确保 AI 生成的 Markdown 格式（加粗、列表）在编辑器中正确渲染。

---

## 3. 开发任务分解表 (Development Tasks)

### **Phase 1: 核心诊断与可视化 (预计 3-4 天)**
1.  **[前端] 规则引擎服务** (`RuleEngine.ts`)：实现上述 R1-R5 的判断逻辑，输入 WizardData，输出 RiskList。
2.  **[前端] 损益计算器** (`LossCalculator.ts`)：实现遗产税、离境税计算公式。
3.  **[UI] 风险红绿灯组件** (`RiskCard.tsx`)：根据 RiskList 渲染红色/黄色警示卡片。
4.  **[UI] 损益模拟器组件** (`LossSimulator.tsx`)：使用 CSS 动画展示 100% -> 60% 的缩水过程。

### **Phase 2: 报告生成升级 (预计 3 天)**
1.  **[后端] Prompt 优化** (`report.ts`)：重写 Prompt，强制要求 JSON 格式输出，并注入规则引擎计算出的 `RiskList` 给 AI 做参考。
2.  **[前端] 报告渲染器重构** (`SmartReportView.tsx`)：不再渲染 Markdown 字符串，而是解析 JSON，分块渲染。
3.  **[前端] 集成 TipTap 编辑器**：替换现有的 `SimpleMarkdown`，实现文本的可编辑性。

### **Phase 3: 知识库与细节 (预计 2 天)**
1.  **[数据] 法律知识库** (`LegalDB.json`)：录入 8 国基础税率表。
2.  **[UI] 小灯泡交互**：在红绿灯卡片旁增加 Popover，显示法律依据。

---

**执行指令：**
这是一份能够直接指导开发的 PRD。
**建议立即从 Phase 1 开始**，先在前端实现不依赖 AI 的“硬逻辑诊断”，确保演示时 100% 有结果、有震慑力。
