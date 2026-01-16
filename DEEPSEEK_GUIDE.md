# DeepSeek 切换指南 (V5.0)

恭喜！您已成功切换至 **DeepSeek (深度求索)** 引擎。这是目前最适合中国网络环境的 AI 解决方案。

---

## 🚀 为什么选择 DeepSeek？

1.  **无需魔法**：国内服务器直连，速度飞快，永不掉线。
2.  **更懂中文**：在处理家族信托、税务合规等中文语境任务时，逻辑更清晰。
3.  **成本极低**：百万 tokens 仅需几元人民币（甚至免费赠送额度）。

---

## 🛠️ 如何获取 API Key？

1.  访问 **[DeepSeek 开放平台](https://platform.deepseek.com/)**。
2.  点击右上角 **“注册/登录”**（支持手机号）。
3.  进入左侧 **“API keys”** 菜单。
4.  点击 **“创建 API Key”**。
5.  复制生成的 `sk-xxxxxxxx` 格式的密钥。

---

## ⚙️ 如何配置系统？

### 方法 A：网页端快速配置 (推荐)
1.  打开您的网站 `http://localhost:3000` 或线上地址。
2.  进入 **“系统设置”**。
3.  在 **“DeepSeek API Key”** 输入框中粘贴您的 Key。
4.  点击 **“测试连接”**，看到绿色成功提示后，点击 **“保存”**。

### 方法 B：Cloudflare 后端配置 (更安全)
如果您希望部署到公网供他人使用，建议配置在服务器端：
1.  登录 Cloudflare Pages 后台。
2.  进入 `Settings` -> `Environment variables`。
3.  添加/修改变量：
    *   **Variable name**: `DEEPSEEK_API_KEY`
    *   **Value**: `您的 sk-xxxx 密钥`
4.  重新部署以生效。

---

## ❓ 常见问题

**Q: 之前的 Google API Key 还需要吗？**
A: 不需要了。为了安全起见，您可以去 Google Cloud 后台删掉它。

**Q: 模型选哪个？**
A: 默认选择 **DeepSeek V3 (Chat)** 即可，它是目前的主力模型，兼顾速度与智能。如果您需要更强的逻辑推理（如复杂税务筹划），可选 **DeepSeek R1 (Reasoner)**。
