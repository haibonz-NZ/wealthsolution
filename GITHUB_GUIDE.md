# 如何将项目上传到 GitHub

本指南将帮助您将 `wealth-solution-web` 项目代码上传到您的 GitHub 仓库。上传后，您可以连接 Cloudflare Pages 或 Vercel 进行自动部署。

## 第一步：准备工作

1.  **注册/登录 GitHub**：访问 [https://github.com](https://github.com) 并登录您的账号。
2.  **安装 Git**：确保您的电脑上已安装 Git。
    *   **Windows**: 下载并安装 [Git for Windows](https://git-scm.com/download/win)。
    *   **Mac**: 打开终端，输入 `git --version`。如果未安装，系统会提示您安装（通常通过 Xcode Command Line Tools）。

## 第二步：在 GitHub 上创建新仓库

1.  登录 GitHub 后，点击右上角的 **+** 号，选择 **New repository**。
2.  **Repository name**：输入项目名称，例如 `wealth-solution-web`。
3.  **Visibility**：选择 **Public** (公开) 或 **Private** (私有)。建议 Private 以保护隐私，但 Cloudflare/Vercel 均支持私有仓库。
4.  **Initialize this repository with**：不要勾选任何选项（不要勾选 README, .gitignore 等），我们需要一个空仓库。
5.  点击 **Create repository** 按钮。
6.  创建成功后，您会看到一个页面，其中有一行类似这样的地址（记下它，后面要用）：
    *   `https://github.com/您的用户名/wealth-solution-web.git`

## 第三步：在本地上传代码

### 方法 A：使用为了您准备的自动脚本 (推荐)

1.  下载并解压本项目代码。
2.  **Windows 用户**：双击运行项目根目录下的 `init_git.bat`。
3.  **Mac/Linux 用户**：在终端运行 `sh init_git.sh`。
4.  脚本会提示您输入刚才复制的 GitHub 仓库地址。粘贴并回车即可。

### 方法 B：手动命令行操作

如果您更喜欢手动操作，请打开终端（Mac/Linux）或 Git Bash / CMD（Windows），进入解压后的项目文件夹，依次执行以下命令：

```bash
# 1. 初始化 Git 仓库
git init

# 2. 添加所有文件
git add .

# 3. 提交代码
git commit -m "Initial commit"

# 4. 创建 main 分支
git branch -M main

# 5. 关联远程仓库 (请将下面的 URL 替换为您在第二步中获得的真实地址)
git remote add origin https://github.com/您的用户名/wealth-solution-web.git

# 6. 推送到 GitHub
git push -u origin main
```

---

## 常见问题

*   **权限错误**：推送到 GitHub 时，可能需要输入用户名和密码。注意：现在的 GitHub 密码通常是 **Personal Access Token (PAT)**，而不是登录密码。
*   **Git 未安装**：如果运行 `git` 命令提示“不是内部或外部命令”，请先安装 Git。

上传成功后，刷新 GitHub 页面，您应该能看到所有的代码文件。接下来就可以去 Cloudflare Pages 或 Vercel 连接这个仓库进行部署了！
