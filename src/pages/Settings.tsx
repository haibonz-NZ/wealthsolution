import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Download, Upload, ArrowLeft, Database, AlertCircle, Bot, Key, Save, Network, GitBranch, Terminal } from "lucide-react";
import { DataService } from "@/services/data";
import { toast } from "sonner";
import { useRef } from "react";
import { DeployService } from "@/services/deploy";
import { ReportService } from "@/services/report"; 
import { CheckCircle2, XCircle, Loader2, Eye, EyeOff } from "lucide-react";

interface SettingsProps {
  onBack: () => void;
}

export default function Settings({ onBack }: SettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // AI Settings State
  const [apiKey, setApiKey] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [model, setModel] = useState("deepseek-chat");
  const [customModel, setCustomModel] = useState("");
  
  // Proxy Settings
  const [proxyMode, setProxyMode] = useState<"none" | "local" | "cloud">("cloud");
  const [proxyUrl, setProxyUrl] = useState("http://localhost:3000/api/generate");

  // Deploy Settings
  const [repoUrl, setRepoUrl] = useState("git@github.com:haibonz-NZ/wealthsolution.git");
  const [isDeploying, setIsDeploying] = useState(false);
  
  // Connection Test State
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorLog, setErrorLog] = useState("");
  
  // Visibility State
  const [showApiKey, setShowApiKey] = useState(false);
  const [showAccessCode, setShowAccessCode] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem("wealth_ai_key") || "";
    const savedAccessCode = localStorage.getItem("wealth_access_code") || "";
    const savedModel = localStorage.getItem("wealth_ai_model") || "deepseek-chat";
    // Default to 'none' (Direct) for DeepSeek if not set
    const savedProxyMode = (localStorage.getItem("wealth_proxy_mode") as "none" | "local" | "cloud") || "none";
    const savedProxyUrl = localStorage.getItem("wealth_proxy_url") || "http://localhost:3000/api/generate";
    const savedRepoUrl = localStorage.getItem("wealth_repo_url");

    setApiKey(savedKey);
    setAccessCode(savedAccessCode);
    
    // Validate model
    const validModels = ["deepseek-chat", "deepseek-reasoner"];
    let effectiveModel = savedModel;
    if (!validModels.includes(savedModel) && !savedModel.startsWith("custom:")) {
        effectiveModel = "deepseek-chat";
    }
    
    setModel(effectiveModel.startsWith("custom:") ? "custom" : effectiveModel);
    if (effectiveModel.startsWith("custom:")) {
        setCustomModel(effectiveModel.replace("custom:", ""));
    }
    
    // Only override defaults if localStorage has value
    if (savedProxyMode) setProxyMode(savedProxyMode);
    setProxyUrl(savedProxyUrl);
    if (savedRepoUrl) setRepoUrl(savedRepoUrl);
  }, []);

  const handleSaveAISettings = () => {
    localStorage.setItem("wealth_ai_key", apiKey);
    localStorage.setItem("wealth_access_code", accessCode);
    const finalModel = model === "custom" ? `custom:${customModel}` : model;
    localStorage.setItem("wealth_ai_model", finalModel);
    
    localStorage.setItem("wealth_proxy_mode", proxyMode);
    localStorage.setItem("wealth_proxy_url", proxyUrl);
    localStorage.setItem("wealth_repo_url", repoUrl);

    toast.success("配置已保存");
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setErrorLog("");
    
    // Save first to ensure service uses latest values
    localStorage.setItem("wealth_ai_key", apiKey);
    localStorage.setItem("wealth_access_code", accessCode);
    localStorage.setItem("wealth_proxy_mode", proxyMode);
    localStorage.setItem("wealth_proxy_url", proxyUrl);
    
    const result = await ReportService.testConnection(apiKey, model, accessCode);
    
    if (result.success) {
        setTestStatus('success');
        toast.success("连接测试成功！API Key 有效。");
    } else {
        setTestStatus('error');
        const msg = result.message || "未知错误";
        setErrorLog(msg);
        toast.error(`测试失败: ${msg}`);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      DataService.importData(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
        await DeployService.deploy(repoUrl);
        toast.success("部署指令已发送，请检查本地终端日志确认进度");
    } catch (e: any) {
        toast.error("部署请求失败: " + e.message);
    } finally {
        setIsDeploying(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/10 p-6">
      <header className="flex items-center gap-4 mb-8 max-w-3xl mx-auto">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">系统设置</h1>
          <p className="text-muted-foreground">管理您的数据与偏好</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto space-y-6">
        
        {/* AI Configuration */}
        <Card className="border-primary/20 shadow-md">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Bot className="h-5 w-5" />
              AI 模型配置 (DeepSeek)
            </CardTitle>
            <CardDescription>
              配置 DeepSeek API Key 以启用无障碍的智能分析功能。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            
            {/* Basic API Key */}
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3 text-sm text-blue-800">
                <Key className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p>API Key 仅存储在本地浏览器中。DeepSeek 支持国内直连，无需代理。</p>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="apiKey">DeepSeek API Key</Label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Input 
                          id="apiKey" 
                          type={showApiKey ? "text" : "password"} 
                          placeholder="sk-... (若已配置服务器 Key 可留空)" 
                          value={apiKey}
                          onChange={(e) => {
                              setApiKey(e.target.value);
                              setTestStatus('idle');
                          }}
                          className="pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    <Button 
                        variant={testStatus === 'success' ? "outline" : "secondary"}
                        onClick={handleTestConnection} 
                        disabled={testStatus === 'testing'}
                        className={`w-32 ${testStatus === 'success' ? 'border-green-500 text-green-600 bg-green-50' : testStatus === 'error' ? 'border-red-500 text-red-600 bg-red-50' : ''}`}
                    >
                        {testStatus === 'testing' ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                         testStatus === 'success' ? <><CheckCircle2 className="w-4 h-4 mr-2" /> 成功</> : 
                         testStatus === 'error' ? <><XCircle className="w-4 h-4 mr-2" /> 失败</> : 
                         "测试连接"}
                    </Button>
                </div>
                {errorLog && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded text-xs text-red-600 font-mono break-all animate-in fade-in slide-in-from-top-2">
                        <strong>详细错误信息：</strong><br/>
                        {errorLog}
                        <div className="mt-2 pt-2 border-t border-red-100 text-red-500">
                            提示：如果是 401 Unauthorized，请检查 Key 是否正确。<br/>
                            如果是 Failed to fetch，说明网络不通（本地需开启代理，或部署到 Cloudflare）。
                        </div>
                    </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="accessCode">访问密码 (Access Code)</Label>
                <div className="relative">
                    <Input 
                      id="accessCode" 
                      type={showAccessCode ? "text" : "password"} 
                      placeholder="输入管理员设置的访问密码" 
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      className="pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowAccessCode(!showAccessCode)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {showAccessCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  若服务器开启了访问控制，请输入密码以使用公共 Key。
                </p>
              </div>

              <div className="grid gap-2">
                <Label>选择模型</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deepseek-chat">DeepSeek V3 (Chat)</SelectItem>
                    <SelectItem value="deepseek-reasoner">DeepSeek R1 (Reasoner)</SelectItem>
                    <SelectItem value="custom">自定义模型名称</SelectItem>
                  </SelectContent>
                </Select>
                {model === "custom" && (
                  <Input 
                    placeholder="输入模型名称 (如 gemini-3-pro)" 
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Proxy Mode Selection */}
            <div className="space-y-4">
              <Label className="font-semibold flex items-center gap-2">
                <Network className="h-4 w-4 text-primary" />
                连接模式
              </Label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div 
                  className={`border rounded-lg p-3 cursor-pointer transition-all hover:bg-muted/50 ${proxyMode === 'none' ? 'border-primary bg-primary/5' : ''}`}
                  onClick={() => setProxyMode('none')}
                >
                  <div className="font-medium text-sm mb-1">直连模式 (推荐)</div>
                  <div className="text-xs text-muted-foreground">浏览器直接请求 DeepSeek API。速度最快，无需中转。</div>
                </div>

                <div 
                  className={`border rounded-lg p-3 cursor-pointer transition-all hover:bg-muted/50 ${proxyMode === 'cloud' ? 'border-primary bg-primary/5' : ''}`}
                  onClick={() => setProxyMode('cloud')}
                >
                  <div className="font-medium text-sm mb-1">Cloudflare Pages (备用)</div>
                  <div className="text-xs text-muted-foreground">通过 Cloudflare 转发。可隐藏 Key，但可能稍慢。</div>
                </div>

                <div 
                  className={`border rounded-lg p-3 cursor-pointer transition-all hover:bg-muted/50 ${proxyMode === 'local' ? 'border-primary bg-primary/5' : ''}`}
                  onClick={() => setProxyMode('local')}
                >
                  <div className="font-medium text-sm mb-1">本地代理 (开发)</div>
                  <div className="text-xs text-muted-foreground">使用 proxy-server.js。适合本地调试。</div>
                </div>
              </div>

              {proxyMode === 'local' && (
                <div className="space-y-3 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-800">
                    <p className="font-medium mb-1">本地代理使用说明：</p>
                    <ol className="list-decimal list-inside space-y-1 ml-1 text-xs opacity-90">
                      <li>确保您已下载 <code>proxy-server.js</code> 文件到本地。</li>
                      <li>在终端运行 <code>node proxy-server.js</code> 启动服务。</li>
                    </ol>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="proxyUrl">本地代理地址</Label>
                    <Input 
                      id="proxyUrl" 
                      placeholder="http://localhost:3000/api/generate" 
                      value={proxyUrl}
                      onChange={(e) => setProxyUrl(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveAISettings} className="gap-2">
                <Save className="h-4 w-4" /> 保存所有配置
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Git Deployment */}
        <Card className="border-indigo-100 shadow-md">
          <CardHeader className="bg-indigo-50/50 border-b border-indigo-100">
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              <GitBranch className="h-5 w-5" />
              版本一键部署
            </CardTitle>
            <CardDescription>
              调用本地运行的 proxy-server.js 将当前代码推送到 GitHub 仓库。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
             <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex items-start gap-3 text-sm text-indigo-800">
                <Terminal className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">前提条件：</p>
                  <ul className="list-disc list-inside text-xs opacity-90 mt-1 space-y-1">
                    <li>本地必须正在运行 <code>node proxy-server.js</code></li>
                    <li>本地 Git 必须已配置 SSH Key 或凭证存储 (Credential Helper)</li>
                    <li>确保仓库地址正确且您有写入权限</li>
                  </ul>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="repoUrl">GitHub 仓库地址</Label>
                <Input 
                  id="repoUrl" 
                  placeholder="https://github.com/username/wealthsolution.git" 
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button 
                    onClick={handleDeploy} 
                    disabled={isDeploying}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    {isDeploying ? "正在推送..." : "一键推送到 GitHub"}
                </Button>
              </div>
          </CardContent>
        </Card>

        {/* Data Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-muted-foreground" />
              数据备份与迁移
            </CardTitle>
            <CardDescription>
              管理您的本地数据缓存。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="border rounded-lg p-6 text-center space-y-4 hover:bg-muted/50 transition-colors">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <Download className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">导出备份</h3>
                  <p className="text-xs text-muted-foreground mt-1">下载当前所有数据为 JSON 文件</p>
                </div>
                <Button onClick={DataService.exportAllData} className="w-full">
                  下载备份文件
                </Button>
              </div>

              <div className="border rounded-lg p-6 text-center space-y-4 hover:bg-muted/50 transition-colors">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">导入恢复</h3>
                  <p className="text-xs text-muted-foreground mt-1">上传备份文件以覆盖当前数据</p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept=".json"
                  onChange={handleFileChange}
                />
                <Button variant="outline" onClick={handleImportClick} className="w-full border-dashed">
                  选择备份文件
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
