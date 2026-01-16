# 跨国家族办公室智能报告系统 - 像素级执行规格书 (SRS V12.0)

**版本**：V12.0 (Pixel-Perfect Execution Guide)
**密级**：核心机密
**适用对象**：前端开发、后端开发、UI设计、测试
**文档说明**：本文档包含系统所有页面的**UI细节**、**文案内容**、**交互逻辑**及**底层算法**。开发人员请严格遵守本文档进行编码。

---

# 🎨 第一部分：全局设计规范 (Design System)

## 1.1 色彩系统 (Color Palette)
所有颜色必须使用 CSS 变量，但在代码中需硬编码以下基准值：
*   **背景色 (Background)**: `#0C2340` (深邃蓝 - 页面底色)
*   **主色 (Primary)**: `#B87845` (古铜金 - 按钮、高亮、图标)
*   **辅色 (Secondary)**: `#FFF2CC` (奶油白 - 卡片背景、文字容器)
*   **文本色 (Text-Main)**: `#FFF2CC` (深底上的文字)
*   **文本色 (Text-Inverse)**: `#0C2340` (浅底上的文字)
*   **功能色**:
    *   🔴 危险/高危: `#EF4444` (Tailwind `red-500`)
    *   🟡 警告/中危: `#F59E0B` (Tailwind `amber-500`)
    *   🟢 安全/通过: `#10B981` (Tailwind `green-500`)

## 1.2 字体排印 (Typography)
*   **标题 (Heading)**: `Cinzel` (Google Font), 字重 700/900.
*   **正文 (Body)**: `Lato` 或 `Noto Sans SC` (Google Font), 字重 400.
*   **数字/代码**: `Montserrat`, 字重 600.

---

# 📱 第二部分：客户前台 (C-End) 页面详解

## 页面 2.1：门厅着陆页 (Landing)
**路由**: `/`

### 2.1.1 界面元素与文案
1.  **顶部跑马灯**:
    *   *背景*: `#FFF2CC` (10% 透明度)
    *   *文案库* (随机循环):
        *   "某上海籍家族刚刚完成美/日风险扫描"
        *   "某北京籍企业家正在进行代持架构体检"
        *   "某深圳籍客户发现离岸信托合规漏洞"
2.  **安全浮窗 (右上角)**:
    *   *图标*: 🛡️ (ShieldCheck)
    *   *文案*: "AES-256 加密 | 匿名访问"
3.  **Hero 区域**:
    *   *Logo*: 显示 `src/assets/logo-one.png`
    *   *主标题*: "预见跨境隐忧，守护家庭长青" (字号 48px, Cinzel)
    *   *副标题*: "基于大数据的智能化家庭财富体检方案" (字号 18px, Lato)
    *   *CTA 按钮*:
        *   *文案*: "立即开启体检"
        *   *样式*: 古铜色填充，圆角矩形，流光动画。
    *   *底部背书*: "3分钟极简匿名体检 · 由 GWRC 智能引擎驱动"

### 2.1.2 交互逻辑
*   **点击 CTA 按钮**: `history.push('/wizard/identity')`
*   **URL 参数解析**:
    *   读取 `?advisor_id=XYZ`。
    *   若有值，存入 `sessionStorage.setItem('gwrc_advisor_id', 'XYZ')`。
    *   页面底部显示顾问名片组件（头像+ID）。

---

## 页面 2.2：身份拓扑录入 (Identity Wizard)
**路由**: `/wizard/identity`

### 2.2.1 界面布局
*   **左侧 (Desktop) / 底部 (Mobile)**: **身份托盘 (Dock)**
    *   包含 4 个圆形可拖拽图标：
        *   `User` (本人)
        *   `Users` (配偶)
        *   `Baby` (子女)
        *   `Tent` (父母)
*   **中心**: **交互地图 (Map)**
    *   背景图: `world-map.jpeg`
    *   8 个热区 (DropZone): `CN`, `US`, `UK`, `CA`, `AU`, `JP`, `HK`, `SG`。

### 2.2.2 交互与弹窗逻辑 (The Logic Core)
*当图标被 Drop 到特定区域时，触发以下模态框 (Modal)*：

#### **场景 A: 拖入 [美国 US]**
*   **弹窗标题**: "美国税务深度扫描"
*   **问题 1**: "该成员持有美国护照、绿卡，或正在申请绿卡？"
    *   *选项*: [是] / [否]
    *   *逻辑*: 选 [是] -> Tag: `US_IDENTITY`
*   **问题 2**: "该成员本年度是否在美居住超过 31 天，且三年累计满 183 天？"
    *   *选项*: [是] / [否]
    *   *逻辑*: 选 [是] -> Tag: `US_SUBSTANTIAL_PRESENCE`
*   **问题 3 (仅当 Q1或Q2 为是)**: "是否持有非美籍亲属赠与的资产 (>10万美元)？"
    *   *选项*: [是] / [否]
    *   *逻辑*: 选 [是] -> Tag: `US_GIFT_REPORTING`

#### **场景 B: 拖入 [加拿大 CA] 或 [澳大利亚 AU]**
*   **弹窗标题**: "离境/税务居民判定"
*   **问题 1**: "是否为该国税务居民？"
    *   *选项*: [是] / [否]
    *   *逻辑*: 选 [是] -> Tag: `CA_RESIDENT` / `AU_RESIDENT`
*   **问题 2**: "未来是否有长期离开该国（回流中国）的计划？"
    *   *选项*: [是] / [否]
    *   *逻辑*: 选 [是] -> Tag: `DEPARTURE_TAX_RISK` (离境税风险)

#### **场景 C: 拖入 [日本 JP]**
*   **弹窗标题**: "继承税判定"
*   **问题 1**: "在日本居住是否超过 10 年？"
    *   *选项*: [是] / [否]
    *   *逻辑*: 选 [是] -> Tag: `JP_UNLIMITED_LIABILITY` (无限制纳税义务)

---

## 页面 2.3：资产录入 (Assets Wizard)
**路由**: `/wizard/assets`

### 2.3.1 界面元素
*   **境内资产滑块**:
    *   *Label*: "境内资产预估 (RMB)"
    *   *Steps*: 0 (<1000万), 1 (1000-5000万), 2 (5000万-1亿), 3 (>1亿)
*   **境外资产滑块**:
    *   *Label*: "境外资产预估 (USD)"
    *   *Steps*: 0 (<100万), 1 (100-500万), 2 (500-2000万), 3 (>2000万)
*   **资产类型多选 (Grid)**:
    *   `RealEstate` (房产) -> 关联风险: 流动性、遗产税
    *   `Equity` (股权) -> 关联风险: CFC 穿透
    *   `Trust` (信托) -> 关联风险: 3520A 申报
    *   `Insurance` (保单) -> 关联风险: 7702 合规性

---

## 页面 2.4：诊断报告页 (Diagnosis)
**路由**: `/diagnosis`

### 2.4.1 五维雷达图算法
*   **维度**: 税务(Tax), 安全(Security), 传承(Succession), 隐私(Privacy), 合规(Compliance).
*   **初始分**: 100 分。
*   **扣分矩阵**:
    *   `US_IDENTITY` -> Tax -30, Compliance -20
    *   `DEPARTURE_TAX_RISK` -> Tax -20, Security -10
    *   `JP_UNLIMITED_LIABILITY` -> Tax -40
    *   `Trust` (无规划) -> Compliance -10 (假设未申报)
    *   `Equity` + `US_IDENTITY` -> Tax -20 (CFC风险)

### 2.4.2 风险红绿灯文案库 (Risk Copywriting)
*前端根据 Tags 显示对应的卡片*：

| Tag | 标题 (Title) | 描述文案 (Description) | 专家解释 (Popover) |
| :--- | :--- | :--- | :--- |
| `US_IDENTITY` | **美籍身份税务合规** | 您的家庭成员涉及美国税务居民身份，面临全球征税义务。 | 美国实行全球征税（Citizenship-based Taxation）。绿卡/公民需申报全球收入，且受控外国公司(CFC)及被动投资(PFIC)面临惩罚性税率。 |
| `DEPARTURE_TAX_RISK` | **离境清算税风险** | 离开加/澳时，名下资产可能被视为“按市价出售”并征税。 | 加拿大/澳洲税法规定，税务居民切断税务联系时，需对名下全球资产（特定豁免除外）计算资本利得税（Deemed Disposition）。 |
| `JP_UNLIMITED_LIABILITY` | **日本高额继承税** | 居住超10年触发“无限制纳税义务”，全球资产继承税最高55%。 | 日本继承税法规定，长期居民（10年中住满X年）需就全球资产缴纳继承税，无论资产位于何处，税率累进最高达55%。 |
| `US_GIFT_REPORTING` | **跨境赠与申报** | 接收非美人士大额赠与（>$10W）需提交3520表。 | 若未及时申报 3520 表，美国国税局可处以赠与金额 5% 至 25% 的罚款。 |

### 2.4.3 损益模拟器算法
*   **场景**: "代际传承损益预演"
*   **公式**:
    ```javascript
    let lossRate = 0;
    if (tags.includes('US_IDENTITY')) lossRate += 0.40; // 40% 遗产税
    if (tags.includes('JP_UNLIMITED_LIABILITY')) lossRate = Math.max(lossRate, 0.55); // 55% 覆盖
    if (tags.includes('DEPARTURE_TAX_RISK')) lossRate += 0.25; // 估算25%离境税
    
    // 基础损耗 (律师费/通胀/冻结)
    lossRate += 0.05; 
    
    const remaining = 1.0 - Math.min(lossRate, 0.80); // 最多剩 20%
    ```
*   **展示**: 进度条从 100% 缩减到 `remaining * 100`%。

---

# 🖥️ 第三部分：顾问后台 (B-End) 页面详解

## 页面 3.1：线索管理 (Lead Dashboard)
**路由**: `/dashboard`
*   **列表字段**: 
    *   `提交时间`
    *   `客户手机号` (脱敏: 138****1234)
    *   `风险等级` (高/中/低 - 由前台算法透传)
    *   `资产规模` (高净值/超高净值)
    *   `操作`: [查看详情] [转为案例]

## 页面 3.2：报告编辑器 (Report Editor)
**路由**: `/cases/:id/report`
*   **组件**: `TipTap` (Rich Text Editor)
*   **预设模版**: 
    *   系统根据 C 端传来的 Tags，自动组合 JSON：
    ```json
    {
      "summary": "基于您 [US_IDENTITY] 及 [Trust] 的情况，我们建议...",
      "risks": [ ...对应文案... ],
      "solutions": [ ...对应文案... ]
    }
    ```
*   **功能**: 顾问可在网页上直接修改上述自动生成的文字，点击保存后生成 PDF。

---

# 🔌 第四部分：数据接口规范 (API Docs)

## 4.1 提交线索 (Submit Lead)
*   **Endpoint**: `POST /api/leads`
*   **Request Body**:
    ```json
    {
      "advisor_id": "12345",
      "phone": "13800138000",
      "data": {
        "identities": [ ... ],
        "assets": { ... },
        "risks": ["US_IDENTITY", "DEPARTURE_TAX_RISK"] // 前端计算好的 Tag
      }
    }
    ```

---

**附录：开发优先级 (Sprint Planning)**
1.  **Sprint 1**: 完成 C 端所有页面 UI 及 “美国/加澳” 的弹窗逻辑 (已部分完成)。
2.  **Sprint 2**: 完成 “五维雷达图” 和 “损益模拟器” 的真实算法对接 (Diagnosis 页)。
3.  **Sprint 3**: 开发 B 端 “线索接收” 和 “报告编辑器” (Report 页)。
