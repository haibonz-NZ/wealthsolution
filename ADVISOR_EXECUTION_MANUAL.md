# 顾问端系统 - 深度开发执行手册 (Advisor Execution Manual V1.0)

**版本**：V1.0
**核心目标**：打造顾问的**“数字化作业平台”**，聚焦于数据的**深度录入、精准诊断**和**完美报告交付**。放弃所有“花哨”的演示功能，一切为了**专业度**服务。

---

## 1. 系统架构概览 (System Architecture)

### 1.1 业务流程 (Workflow)
1.  **建档 (Onboarding)**：顾问创建案例，录入极度详细的家族与资产数据。
2.  **诊断 (Diagnosis)**：后台**规则引擎**静默运行，识别 8 国税务合规漏洞。
3.  **生成 (Generation)**：调用 DeepSeek，基于规则结果生成结构化草稿。
4.  **精修 (Refinement)**：顾问使用**富文本编辑器**对报告进行增删改查。
5.  **交付 (Delivery)**：生成精美 PDF，作为正式咨询方案。

---

## 2. 模块一：深度数据录入 (Deep Data Entry)

*目标：全面收集“能影响税务判断”的所有字段，这是生成精准报告的基石。*

### 2.1 家族图谱 (Family Tree Canvas)
*   **交互**：保留现有的 Canvas 绘图模式，但增加**属性侧边栏**。
*   **节点必填字段** (点击节点侧边栏弹出)：
    *   `Tax Residency` (税务居民国): 多选 (CN/US/CA/AU/UK/SG/JP/HK)。
    *   `Domicile` (居籍 - 针对 UK): Yes/No。
    *   `Days Stay` (居住天数): 针对 US/JP/UK，用于判断实质居住。
    *   `Health` (健康): 正常/重疾 (影响保险规划)。
    *   `Marital` (婚姻): 已婚/未婚/离异 (影响资产隔离)。

### 2.2 资产台账 (Asset Ledger)
*   **交互**：Excel 风格的编辑表格 (Data Grid)。
*   **核心字段**：
    *   `Asset Class`: 房产/股权/保单/信托/现金。
    *   `Jurisdiction` (所在地): 8 国列表。
    *   `Owner` (持有人): 下拉选择家族成员 / 公司 / 信托。
    *   **`Holding Structure` (持有架构 - 关键)**:
        *   个人直持 (Individual)
        *   代持 (Nominee) —— 🔴 **直接触发风险**
        *   公司持有 (Corporate) -> 需填公司注册地 (BVI/HK/US)
        *   信托持有 (Trust) -> 需填信托设立地
    *   `Cost Base` (成本价): 用于计算离境税/资本利得税。
    *   `Market Value` (市价): 用于计算遗产税。

### 2.3 信息缺口扫描 (Gap Analysis)
*   **逻辑**：表单保存时触发自检。
*   **规则**：
    *   IF (Nationality == 'US') AND (Asset == 'Non-US Fund') -> 提示：“需确认 PFIC 状态”。
    *   IF (Asset == 'Trust') -> 提示：“需确认信托是否为 Grantor Trust”。
*   **UI**：在页面顶部显示“待确认信息清单”，引导顾问补全。

---

## 3. 模块二：全球税务规则引擎 (The Rule Brain)

*这是系统的核心大脑，负责把“数据”翻译成“风险标签”。*

### 3.1 规则逻辑库 (硬编码逻辑)

#### **G1: 美国 (The US Trap)**
*   **R_US_GLOBAL**: `US_Person` = TRUE -> **全球征税风险**。
*   **R_US_ESTATE**: `Non_US_Person` 持有 `US_Situs_Asset` (房产/美股) -> **40% 遗产税** (免税额仅 $60k)。
*   **R_US_TRUST**: `US_Person` 是离岸信托受益人 -> **UNI 惩罚性税率** + **3520 申报**。
*   **R_US_INSURANCE**: `US_Person` 持有非美保单 -> **IRC 7702 合规风险** (可能丧失免税地位)。

#### **G2: 加拿大/澳大利亚 (The Exit Trap)**
*   **R_CA_DEPARTURE**: `CA_Resident` 计划 `Leave` -> **视同售出 (Deemed Disposition)**，按市价征收增值税。
*   **R_AU_99B**: `AU_Resident` 接收离岸信托分配 -> **Section 99B** (历史收益按 47% 征税)。

#### **G3: 日本 (The Inheritance Trap)**
*   **R_JP_10Y**: 居住超过 10 年 -> **全球资产继承税** (无论继承人/被继承人在哪)。

### 3.2 诊断输出 (Output)
引擎运行后，生成 `DiagnosisReport` 对象：
```json
{
  "risk_tags": ["US_ESTATE", "AU_99B"],
  "risk_details": [
    { "id": "US_ESTATE", "severity": "HIGH", "context": "父亲(非美)持有曼哈顿房产" }
  ]
}
```

---

## 4. 模块三：完美报告生成系统 (The Perfect Report)

*这是顾问最关心的“交付物”。*

### 4.1 结构化 Prompt (Backend)
不让 AI 写作文，让 AI 填空。
*   **Prompt**:
    > "请基于以下风险标签 `[US_ESTATE, AU_99B]`，生成一份 JSON 报告。
    > 必须包含：
    > 1. `summary`: 800字，专业语气，概括家族核心矛盾。
    > 2. `analysis`: 针对每个风险标签，写一段 300 字的深度法理分析（引用 IRC/ATO 条款）。
    > 3. `solutions`: 针对每个风险，给出架构建议（如：设立 ILIT 信托）。"

### 4.2 交互式编辑器 (Interactive Editor)
*   **技术栈**: **TipTap** (React)
*   **功能规范**：
    1.  **Block-Based Editing**：文本是一块一块的，可以拖拽顺序。
    2.  **组件嵌入 (Magic Blocks)**：
        *   在编辑器里输入 `/tree` -> 插入当前的 `FamilyTree` 组件（矢量图，不失真）。
        *   输入 `/chart` -> 插入 `AssetPieChart`。
        *   输入 `/risk` -> 插入红绿灯风险卡片。
    3.  **AI 润色**：选中一段话 -> 悬浮菜单 [更专业] / [更委婉] / [扩写]。

### 4.3 PDF 导出引擎
*   **渲染**：使用 CSS Paged Media (`@page`) 控制分页。
*   **水印**：自动添加顾问所在的机构 Logo 水印。
*   **封面**：生成一张带有“The One Wealth Solutions”烫金效果的封面页。

---

## 📅 5. 开发执行路线图 (Execution Plan)

### **Step 1: 深度录入 (Data Foundation)**
*   **任务**：升级 `FamilyTree` 和 `AssetList`，增加上述所有税务/架构字段。
*   **产出**：一个能录入“代持”、“税务居民”等专业信息的后台。

### **Step 2: 规则引擎 (The Brain)**
*   **任务**：编写 TypeScript 函数，实现 8 国税务逻辑判断。
*   **产出**：录入数据后，后台能自动计算出 Risk Tags。

### **Step 3: 报告编辑器 (The Face)**
*   **任务**：集成 TipTap，实现 JSON 到文档的渲染，以及组件嵌入功能。
*   **产出**：一个能改字、能插图、能导出的报告编辑页面。

---

**专家建议**：
既然您希望“先开发顾问用的内容”，且要求“报告显示完善”，那么 **Step 3 (报告编辑器)** 是最终的呈现形式，但 **Step 1 (数据)** 和 **Step 2 (逻辑)** 是前提。没有准确的数据和逻辑，报告就是空的。

**我建议按顺序从 Step 1 开始，先把数据录入做扎实。您同意吗？**
