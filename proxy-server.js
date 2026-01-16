import http from 'http';
import https from 'https';
import { URL } from 'url';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const PORT = 3000;

// Helper to execute shell commands
const runCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Exec Error: ${error}`);
        reject(stderr || error.message);
        return;
      }
      resolve(stdout);
    });
  });
};

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const server = http.createServer((req, res) => {
  // 1. Handle CORS for API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 2. Route: AI Proxy (/api/generate)
  if (req.method === 'POST' && req.url === '/api/generate') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());

    req.on('end', () => {
      try {
        const { apiKey: bodyApiKey, model: bodyModel, messages } = JSON.parse(body);

        const apiKey = bodyApiKey;
        const model = bodyModel || 'deepseek-chat';

        if (!apiKey) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing API Key' }));
          return;
        }

        const makeRequest = (targetModel) => {
            const apiUrl = 'https://api.deepseek.com/chat/completions';
            const apiUrlObj = new URL(apiUrl);

            const options = {
              hostname: apiUrlObj.hostname,
              path: apiUrlObj.pathname,
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${apiKey}`
              }
            };

            return new Promise((resolve, reject) => {
                const req = https.request(options, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
                });
                req.on('error', reject);
                req.write(JSON.stringify({ 
                    model: targetModel,
                    messages: messages,
                    stream: false 
                }));
                req.end();
            });
        };

        (async () => {
            try {
                let result = await makeRequest(model);
                
                res.writeHead(result.statusCode || 500, result.headers);
                res.end(result.body);
            } catch (e) {
                console.error('DeepSeek Request Error:', e);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Proxy error: Failed to connect to DeepSeek API' }));
            }
        })();

      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON body' }));
      }
    });
    return;
  }

  // 3. Route: Git Deploy (/api/deploy)
  if (req.method === 'POST' && req.url === '/api/deploy') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());

    req.on('end', async () => {
      try {
        const { repoUrl, commitMessage } = JSON.parse(body);
        const msg = commitMessage || "Update from Wealth Solution Dashboard";

        console.log(`[Deploy] Starting deployment to ${repoUrl}...`);

        // Check if git is initialized
        try {
            await runCommand('git status');
        } catch (e) {
            console.log('[Deploy] Git not initialized. Initializing...');
            await runCommand('git init');
            await runCommand('git branch -M main');
        }

        // Configure remote if needed
        if (repoUrl) {
            try {
                // Try to remove origin first to avoid error if exists
                await runCommand('git remote remove origin').catch(() => {}); 
                await runCommand(`git remote add origin ${repoUrl}`);
            } catch (e) {
                console.warn('[Deploy] Remote config warning:', e);
            }
        }

        // Execute Git Workflow
        await runCommand('git add .');
        
        // Commit (ignore error if nothing to commit)
        try {
            await runCommand(`git commit -m "${msg}"`);
        } catch (e) {
            console.log('[Deploy] Nothing to commit or commit failed (clean working tree).');
        }

        // Push (Force)
        console.log('[Deploy] Pushing to remote (FORCE)...');
        await runCommand('git push -u origin main --force');

        console.log('[Deploy] Success!');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Successfully deployed to GitHub!' }));

      } catch (e) {
        console.error('[Deploy] Error:', e);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            success: false, 
            error: e.toString(),
            hint: "Check if you have SSH keys configured or Git credentials stored." 
        }));
      }
    });
    return;
  }

  // 4. Route: Static Files (Frontend)
  // Determine file path
  let filePath = path.join(process.cwd(), 'dist', req.url === '/' ? 'index.html' : req.url);
  
  // Security check: ensure path is inside dist
  if (!filePath.startsWith(path.join(process.cwd(), 'dist'))) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
  }

  // Check if file exists, if not serve index.html (SPA Fallback)
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(process.cwd(), 'dist', 'index.html');
  }

  // Serve file
  fs.readFile(filePath, (err, content) => {
      if (err) {
          res.writeHead(500);
          res.end(`Server Error: ${err.code}`);
      } else {
          const ext = path.extname(filePath);
          const contentType = MIME_TYPES[ext] || 'application/octet-stream';
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
      }
  });
});

server.listen(PORT, () => {
  console.log(`
  🚀 Wealth Solution 本地全能服务已启动!
  ---------------------------------------
  > 访问网址: http://localhost:${PORT}
  ---------------------------------------
  功能:
  1. 网站托管: 访问上述网址即可打开网站
  2. AI 代理: /api/generate (内置 Key)
  3. 一键部署: /api/deploy (Git Push)
  
  ⚠️ 提示: 请确保您已将 'dist' 文件夹和此脚本放在同一目录下。
  `);
});
