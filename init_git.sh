#!/bin/bash
echo "=== 自动 Git 初始化工具 (Mac/Linux) ==="
echo "正在初始化本地仓库..."

# Initialize
git init
if [ $? -ne 0 ]; then
    echo "错误: git 命令未找到。请先安装 Git。"
    exit 1
fi

# Add and commit
git add .
git commit -m "Initial commit by Wealth Solution Generator"
git branch -M main

echo ""
echo "-------------------------------------------------------"
echo "请前往 GitHub 创建一个新的空仓库 (New Repository)。"
echo "然后复制仓库的 HTTPS 地址 (例如 https://github.com/username/repo.git)"
echo "-------------------------------------------------------"
echo ""
echo "请输入您的 GitHub 仓库地址:"
read remote_url

if [ -z "$remote_url" ]; then
  echo "错误: 未输入仓库地址。"
  exit 1
fi

# Add remote
git remote add origin "$remote_url"

echo ""
echo "正在推送到 GitHub (可能需要您输入 GitHub 账号密码或 Token)..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 上传成功！请刷新 GitHub 页面查看代码。"
else
    echo ""
    echo "❌ 上传失败。请检查网络或权限设置。"
fi
