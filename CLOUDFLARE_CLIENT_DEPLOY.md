# 全球财富风险自查系统 (GWRC) 部署指南

本指南将帮助您将客户前台系统 (Client-Facing App) 部署到 Cloudflare Pages，并绑定您的子域名。

## 1. 项目概览
此项目是一个独立的单页应用 (SPA)，完全基于前端运行，不依赖后端数据库（数据仅在用户浏览器暂存），直到用户提交手机号（此处为模拟接口）。

*   **技术栈**: React + Vite + Tailwind CSS
*   **构建输出目录**: `dist`

## 2. 部署到 Cloudflare Pages

1.  **登录 Cloudflare Dashboard**。
2.  进入 **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**。
3.  选择您包含本项目代码的 GitHub 仓库 (`wealthsolution` 仓库，或者新仓库)。
    *   *注意：如果您将此代码放在现有仓库的子目录中（例如 `wealth-solution-client`），需要在 Build settings 中配置 Root directory。*
    *   **Root directory (根目录)**: `wealth-solution-client` (如果代码在子目录下)
    *   **Build command**: `npm run build`
    *   **Build output directory**: `dist`
4.  点击 **Save and Deploy**。

## 3. 绑定自定义域名

部署成功后，绑定您指定的子域名：

1.  进入该 Pages 项目的 **Custom domains** 选项卡。
2.  点击 **Set up a custom domain**。
3.  输入: `client_wealthsolution.theonefo.com` (请确保 `theonefo.com` 的 DNS 托管在 Cloudflare，或者您有权限修改 DNS)。
4.  Cloudflare 会自动为您添加 CNAME 记录。
5.  等待 DNS 生效（通常几分钟）。

## 4. 常见问题

*   **页面 404 / 白屏**: 请检查 `vite.config.ts` 中的 `base` 路径配置。目前默认为 `./` (相对路径)，适合大多数情况。如果部署在子路径下，需改为 `/subpath/`。
*   **样式丢失**: 确保构建命令正确安装了依赖 (`npm install`)。

---
**交付清单**:
- 源代码: `wealth-solution-client/`
- 构建产物: `dist/` (内含 `index.html`, `assets/`)
