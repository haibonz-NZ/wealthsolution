import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Shield, Users, PieChart, FileText, ArrowRight, Activity, Network, Lock, Brain } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import featureBg from "@/assets/wealth-dashboard.jpg";
import logo from "@/assets/logo.png";

interface HomeProps {
  onNavigate?: (page: string) => void;
}

export default function Home({ onNavigate = () => {} }: HomeProps) {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Wealth Solution" className="h-8 w-auto object-contain" />
            <span className="font-semibold text-xl tracking-tight">Wealth Solution</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">核心功能</a>
            <a href="#process" className="hover:text-primary transition-colors">使用流程</a>
            <a href="#pricing" className="hover:text-primary transition-colors">会员权益</a>
            <a href="#security" className="hover:text-primary transition-colors">安全合规</a>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => onNavigate("login")}>登录</Button>
            <Button size="sm" onClick={() => onNavigate("register")}>注册会员</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroBg} alt="Meeting" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="px-4 py-1 text-sm font-medium rounded-full mb-4">
              专为高净值家族打造
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              智能财富规划，<br />
              <span className="text-primary">只需几分钟</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              一站式数字化家办顾问。从家族信息录入、资产全貌梳理到专业报告生成，
              让复杂的财富规划变得简单、高效、可视化。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" className="h-12 px-8 text-lg w-full sm:w-auto" onClick={() => onNavigate("register")}>
                立即开始规划 <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg w-full sm:w-auto">
                查看示例报告
              </Button>
            </div>
            <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-70">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">15min</div>
                <div className="text-sm text-muted-foreground">报告生成时间</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">25+</div>
                <div className="text-sm text-muted-foreground">家族关系类型</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">10+</div>
                <div className="text-sm text-muted-foreground">支持货币换算</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">Bank</div>
                <div className="text-sm text-muted-foreground">银行级安全加密</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">核心功能一览</h2>
            <p className="text-muted-foreground text-lg">
              不仅仅是工具，更是您的私人财富管家。
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-background/50 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>家族信息智能录入</CardTitle>
                <CardDescription>
                  结构化记录家族成员与资产状况
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• 支持25种家族关系类型</p>
                <p>• 10种主流货币自动换算</p>
                <p>• 覆盖税务、传承等多维需求</p>
              </CardContent>
            </Card>
            <Card className="bg-background/50 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center mb-4">
                  <Network className="h-6 w-6 text-amber-600" />
                </div>
                <CardTitle>可视化家族图谱</CardTitle>
                <CardDescription>
                  Family Tree 一图看清家族全貌
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• 自动按辈分层级排列</p>
                <p>• 智能连线（夫妻/父子关系）</p>
                <p>• 支持高清图片导出演示</p>
              </CardContent>
            </Card>
            <Card className="bg-background/50 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>AI 智能报告生成</CardTitle>
                <CardDescription>
                  分钟级生成专业财富规划方案
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• 涵盖税务、法律、传承分析</p>
                <p>• 三种模板（基础/专业/企业）</p>
                <p>• 支持章节编辑与单节重试</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Highlight with Image */}
      <section className="py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative rounded-2xl overflow-hidden shadow-2xl">
              <img src={featureBg} alt="Dashboard" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent"></div>
            </div>
            <div className="order-1 md:order-2 space-y-8">
              <Badge variant="outline" className="text-primary border-primary">可视化呈现</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                数据驱动，<br />
                让财富结构一目了然
              </h2>
              <p className="text-lg text-muted-foreground">
                内置专业架构图编辑器与数据仪表盘，无论是复杂的家族信托结构，
                还是全球资产配置分布，都能通过直观的图表清晰呈现。
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <PieChart className="h-6 w-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold">资产配置分析</h4>
                    <p className="text-sm text-muted-foreground">自动分析资产类型、地域分布与持有结构。</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Activity className="h-6 w-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold">风险评估预警</h4>
                    <p className="text-sm text-muted-foreground">识别税务风险、CRS申报要求与传承漏洞。</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="h-6 w-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold">多格式导出</h4>
                    <p className="text-sm text-muted-foreground">支持 PDF/Word 导出，带封面水印，直接用于汇报。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-20 bg-slate-50 dark:bg-slate-900/50 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">使用流程</h2>
            <p className="text-muted-foreground text-lg">
              简单四步，开启智能规划之旅
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-border z-0"></div>
            {[
              { title: "1. 创建案例", desc: "新建规划项目，填写基本背景", icon: "01" },
              { title: "2. 信息录入", desc: "家族成员 → 资产状况 → 痛点需求", icon: "02" },
              { title: "3. 报告生成", desc: "选择模板，AI一键生成方案", icon: "03" },
              { title: "4. 编辑导出", desc: "在线优化内容，导出分享", icon: "04" },
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-2xl bg-background border-2 border-border group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all flex items-center justify-center text-xl font-bold shadow-sm mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm max-w-[200px]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">会员权益</h2>
            <p className="text-muted-foreground text-lg">
              满足不同规模的专业需求
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">基础会员</CardTitle>
                <CardDescription>适合快速了解与初步尝试</CardDescription>
                <div className="text-3xl font-bold mt-4">入门首选</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 每月 3 份报告</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 基础版模板 (5章节)</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 基础功能权限</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-primary shadow-lg scale-105 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium">
                推荐选择
              </div>
              <CardHeader>
                <CardTitle className="text-xl text-primary">专业会员</CardTitle>
                <CardDescription>适合深度分析与方案设计</CardDescription>
                <div className="text-3xl font-bold mt-4">专业之选</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 每月 10 份报告</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 专业版模板 (10章节)</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 架构图编辑器</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 版本管理功能</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">企业会员</CardTitle>
                <CardDescription>适合复杂家族与全面规划</CardDescription>
                <div className="text-3xl font-bold mt-4">尊享服务</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 无限制报告生成</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 全部模板权限</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 全部高级功能</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 优先技术支持</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 bg-slate-900 text-slate-50 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold">
                数据安全承诺
              </h2>
              <p className="text-lg text-slate-300 leading-relaxed">
                我们深知您的家族信息极其敏感。Wealth Solution 采用银行级加密标准，
                确保您的数据仅为您服务，绝不与第三方共享。
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-green-400" />
                  <div>
                    <div className="font-semibold">传输加密</div>
                    <div className="text-xs text-slate-400">全程 SSL/TLS 加密</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Lock className="h-8 w-8 text-green-400" />
                  <div>
                    <div className="font-semibold">访问控制</div>
                    <div className="text-xs text-slate-400">仅限本人查看与管理</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-8 w-8 text-green-400" />
                  <div>
                    <div className="font-semibold">隐私保护</div>
                    <div className="text-xs text-slate-400">绝不共享给第三方</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-8 w-8 text-green-400" />
                  <div>
                    <div className="font-semibold">数据自主</div>
                    <div className="text-xs text-slate-400">随时可彻底删除数据</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
              <Card className="relative bg-slate-800 border-slate-700 text-slate-100 p-6">
                <div className="flex items-center gap-4 mb-6 border-b border-slate-700 pb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="text-sm text-slate-400 ml-auto">Security Monitor</div>
                </div>
                <div className="space-y-4 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-400">✓ Encryption</span>
                    <span>AES-256</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-400">✓ Database</span>
                    <span>Isolated</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-400">✓ Audit Log</span>
                    <span>Enabled</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-400">✓ Compliance</span>
                    <span>GDPR/CCPA</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 text-center bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            守护家族财富，传承百年基业
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            立即开始使用 Wealth Solution，体验智能化的家族财富规划服务。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-10 text-lg rounded-full" onClick={() => onNavigate("login")}>
              进入会员中心
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-full">
              联系客服团队
            </Button>
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            The One Family Office · 专注为您服务
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-muted/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-6 w-auto opacity-50 grayscale" />
            <span>© 2026 Wealth Solution. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">隐私政策</a>
            <a href="#" className="hover:text-foreground">服务条款</a>
            <a href="#" className="hover:text-foreground">帮助中心</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
