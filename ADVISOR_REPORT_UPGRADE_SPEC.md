# 顾问端智能报告系统升级 - 详细开发需求文档 (Advisor Report Upgrade Spec V1.0)

**日期**：2026-01-13
**目标**：将“基础文本报告”升级为“交付级专业方案书”。
**核心理念**：报告不应只是一次性生成的文字，而应是一个**可编辑、可组装、图文并茂的活文档 (Live Document)**。

---

## 1. 核心体验升级：从 Markdown 到“智能编辑器”

我们不再把报告看作简单的字符串，而是将其视为一个**结构化的文档对象模型 (Document Object Model)**。
顾问可以在网页上像操作 Notion 或 Word 一样对报告进行深度加工。

### 1.1 界面布局 (The Workspace)
*   **左侧：大纲导航 (Outline)**
    *   显示报告的目录结构（如：1. 执行摘要, 2. 家族图谱, 3. 资产分析...）。
    *   点击可快速跳转到对应章节。
    *   支持拖拽调整章节顺序。
*   **中间：所见即所得画布 (The Canvas)**
    *   基于 **TipTap** 编辑器构建。
    *   支持富文本（加粗、标题、列表）。
    *   **支持 React 组件嵌入**（这是关键）：家族图谱、资产饼图直接渲染在文档流中，而不是作为图片。
*   **右侧：AI 助理 (Co-pilot)**
    *   **局部润色**：选中一段文字，点击“更专业一点”或“更委婉一点”。
    *   **法条库引用**：提供 RAG 检索入口，顾问可搜索“美国遗产税”，一键插入相关法条到报告中。

---

## 2. 报告内容结构标准 (Content Schema)

报告将由以下 5 个标准板块组成。后端 DeepSeek 必须返回严格的 JSON 结构以填充这些板块。

### 2.1 第一章：执行摘要 (Executive Summary)
*   **内容**：高度浓缩的家族现状与核心风险综述。
*   **数据源**：`WizardData` 全局汇总。
*   **展示形式**：
    *   顶部：生成的 800 字摘要文本（可编辑）。
    *   底部：**关键标签云 (Tag Cloud)**，展示 `US_TAX`, `HIGH_NET_WORTH` 等标签。

### 2.2 第二章：家族全景 (Family Overview)
*   **内容**：家族成员结构与身份分布。
*   **核心组件**：
    *   **动态家族图谱 (FamilyTree Component)**：直接嵌入 `FamilyTree` 组件。支持在报告中缩放、查看详情。
    *   **身份分布地图**：嵌入 C 端同款的世界地图，高亮显示家族足迹。

### 2.3 第三章：资产透视 (Financial Analysis)
*   **内容**：资产分布、流动性分析、法律权属分析。
*   **核心组件**：
    *   **资产分布饼图 (Pie Chart)**：境内 vs 境外，房产 vs 金融。
    *   **资产明细表 (Data Table)**：列出所有已录入资产，并标记“代持”、“联名”等高危属性。

### 2.4 第四章：风险深度剖析 (Risk Assessment) —— **重中之重**
*   **内容**：针对识别出的风险点进行深度法理分析。
*   **展示形式**：**红绿灯卡片流 (Traffic Light Cards)**。
    *   每个风险点显示为一个独立的卡片。
    *   **左侧**：风险等级 (🔴/🟡) + 标题。
    *   **中间**：AI 生成的深度分析文本（现状 -> 后果）。
    *   **右侧**：法理依据（引用具体法条，如 IRC 7701）。
*   **交互**：顾问可以点击卡片右上角的“重写”，让 AI 换一种说法。

### 2.5 第五章：战略建议与路线图 (Strategic Roadmap)
*   **内容**：分阶段的落地建议。
*   **展示形式**：**时间轴 (Timeline)**。
    *   `短期 (1-3月)`: 紧急止损（如：补申报表格）。
    *   `中期 (1-3年)`: 架构搭建（如：设立信托）。
    *   `长期 (10年+)`: 家族治理（如：宪章）。

---

## 3. 技术实现细节 (Technical Implementation)

### 3.1 引入 TipTap 编辑器
*   安装 `@tiptap/react` 及相关插件。
*   **自定义节点 (Custom Nodes)**：
    *   开发 `FamilyTreeExtension`：允许在编辑器中插入 `<FamilyTree />`。
    *   开发 `ChartExtension`：允许插入 Recharts 图表。
    *   开发 `RiskCardExtension`：允许插入风险分析卡片。

### 3.2 后端 JSON 协议升级
修改 `generate.js`，要求 DeepSeek 返回如下结构：

```json
{
  "executive_summary": "...",
  "risk_deep_dive": [
    {
      "risk_id": "US_TAX_PERSON",
      "analysis": "...",
      "legal_basis": "IRC Section 7701(b)"
    }
  ],
  "recommendations": {
    "short_term": ["..."],
    "mid_term": ["..."],
    "long_term": ["..."]
  }
}
```

### 3.3 交互逻辑
1.  **生成**：点击“生成报告” -> 调用 DeepSeek -> 获取 JSON。
2.  **渲染**：
    *   将 JSON.summary 填入 Editor 的第一部分。
    *   自动在第二部分插入 `FamilyTreeNode`。
    *   自动在第三部分插入 `ChartNode`。
    *   将 JSON.risk_deep_dive 渲染为多个 `RiskCardNode` 插入第四部分。
3.  **编辑**：顾问对生成的文本进行修改。
4.  **导出**：调用 `window.print()` 或 `html2pdf`，配合打印专用 CSS，生成完美 PDF。

---

## 4. 开发任务清单 (Work Breakdown)

### Phase 2.1: 编辑器集成 (2 Days)
*   [ ] 安装 TipTap 并配置基础样式 (Tailwind Typography)。
*   [ ] 实现自定义组件节点 (Node Views) 的渲染逻辑。

### Phase 2.2: 结构化生成对接 (2 Days)
*   [ ] 升级后端 Prompt，强制输出 JSON。
*   [ ] 前端编写解析器，将 JSON 数据转换为 TipTap 的文档内容 (Content Object)。

### Phase 2.3: 视觉组件嵌入 (2 Days)
*   [ ] 将 `FamilyTree` 适配为 TipTap 插件。
*   [ ] 将 `AssetCharts` 适配为 TipTap 插件。
*   [ ] 优化打印样式，确保图表和文字在 PDF 中不分页错乱。

---

**总结**：
这套方案将把您的系统从“问答机器人”升级为“专业的家族办公室工作台”。顾问不仅能看到 AI 的智慧，还能看到可视化的数据，并且拥有最终的修改权。
