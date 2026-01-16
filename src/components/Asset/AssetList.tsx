import { useState, useEffect } from "react";
import { AssetService, type Asset, ASSET_TYPE_LABELS, CURRENCY_LABELS, HOLDING_TYPE_LABELS } from "@/services/asset";
import { MemberService } from "@/services/member";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Edit, Plus, PieChart as PieIcon, DollarSign, Wallet, Building2, Globe, Loader2, TrendingUp, Users, AlertTriangle } from "lucide-react";
import { AssetForm } from "./AssetForm";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface AssetListProps {
  caseId: string;
}

export function AssetList({ caseId }: AssetListProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<Asset | undefined>(undefined);
  const [totalUSD, setTotalUSD] = useState(0);
  const [domesticTotalUSD, setDomesticTotalUSD] = useState(0);
  const [foreignTotalUSD, setForeignTotalUSD] = useState(0);
  const [memberMap, setMemberMap] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [caseId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [assetData, memberData] = await Promise.all([
        AssetService.getAssetsByCase(caseId),
        MemberService.getMembersByCase(caseId)
      ]);
      setAssets(assetData);
      
      const mHeader: Record<string, string> = {};
      memberData.forEach(m => mHeader[m.id] = m.name);
      setMemberMap(mHeader);

      calculateTotals(assetData);
    } catch (e) {
      toast.error("加载数据失败");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = (data: Asset[]) => {
    // Note: In real app, we should use valueInUSD which should be calculated during save or on the fly
    // For now we assume marketValue is roughly USD equivalent or we need a helper.
    // The previous implementation used valueInUSD but it wasn't in the interface explicitly in the old file, 
    // but the service was adding it. The new service adds it.
    // Let's assume asset.marketValue is the main value now.
    // Ideally we should convert currencies. For simplicity in UI, let's just sum marketValue 
    // (assuming mixed currencies might be wrong but acceptable for prototype or if user inputs USD).
    // Better: use a mock conversion if currency is not USD.
    
    const getUSDValue = (a: Asset) => {
        // Simple mock conversion
        if (a.currency === 'USD') return a.marketValue;
        if (a.currency === 'CNY') return a.marketValue / 7.2;
        if (a.currency === 'HKD') return a.marketValue / 7.8;
        return a.marketValue; // Fallback
    };

    const total = data.reduce((sum, a) => sum + getUSDValue(a), 0);
    const domestic = data.filter(a => a.location === 'CN' || a.location === 'HK')
                         .reduce((sum, a) => sum + getUSDValue(a), 0);
    const foreign = data.filter(a => a.location !== 'CN' && a.location !== 'HK')
                        .reduce((sum, a) => sum + getUSDValue(a), 0);
    
    setTotalUSD(total);
    setDomesticTotalUSD(domestic);
    setForeignTotalUSD(foreign);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除该资产吗？")) return;
    try {
      await AssetService.deleteAsset(id);
      const newAssets = assets.filter(a => a.id !== id);
      setAssets(newAssets);
      calculateTotals(newAssets);
      toast.success("已删除");
    } catch (e) {
      toast.error("删除失败");
    }
  };

  const handleFormSuccess = (asset: Asset) => {
    let newAssets: Asset[] = [];
    if (assetToEdit) {
      newAssets = assets.map(a => a.id === asset.id ? asset : a);
    } else {
      newAssets = [asset, ...assets];
    }
    setAssets(newAssets);
    calculateTotals(newAssets);
    setShowForm(false);
    setAssetToEdit(undefined);
  };

  const domesticAssets = assets.filter(a => a.location === 'CN' || a.location === 'HK');
  const foreignAssets = assets.filter(a => a.location !== 'CN' && a.location !== 'HK');

  // Chart Data: Type Distribution
  const typeChartData = Object.entries(ASSET_TYPE_LABELS).map(([type, label]) => {
    const value = assets.filter(a => a.type === type).reduce((sum, a) => sum + a.marketValue, 0); // Use marketValue
    return { name: label, value };
  }).filter(d => d.value > 0);

  // Chart Data: Holder Distribution
  const holderChartData = assets.reduce((acc, asset) => {
    const holderName = memberMap[asset.ownerId] || "未知";
    const existing = acc.find(d => d.name === holderName);
    if (existing) {
      existing.value += asset.marketValue;
    } else {
      acc.push({ name: holderName, value: asset.marketValue });
    }
    return acc;
  }, [] as { name: string; value: number }[]).sort((a, b) => b.value - a.value);

  // Chart Data: Growth (Original vs Current)
  const totalOriginalUSD = assets.reduce((sum, a) => {
    // Mock conversion for cost base
    if (a.currency === 'USD') return sum + (a.costBase || 0);
    if (a.currency === 'CNY') return sum + ((a.costBase || 0) / 7.2);
    return sum + (a.costBase || 0);
  }, 0);
  
  const growthChartData = [
    { name: '总投入', value: totalOriginalUSD },
    { name: '总现值', value: totalUSD },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff6b6b', '#6b6bff'];

  const formatCurrency = (val: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(val);
  };

  const renderAssetTable = (assetList: Asset[]) => (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">资产信息</TableHead>
            <TableHead>所在地</TableHead>
            <TableHead>持有人</TableHead>
            <TableHead>持有方式</TableHead>
            <TableHead className="text-right">成本 (Cost)</TableHead>
            <TableHead className="text-right">现值 (Market)</TableHead>
            <TableHead className="text-right w-[100px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assetList.map((asset) => (
            <TableRow key={asset.id}>
              <TableCell>
                <div className="font-medium">
                  {asset.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {asset.type === 'other' ? asset.customType : ASSET_TYPE_LABELS[asset.type]}
                </div>
                {asset.notes && (
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-1" title={asset.notes}>
                    注: {asset.notes}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{asset.location}</Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {memberMap[asset.ownerId] || "未知"}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                    <Badge variant={asset.holdingType === 'nominee' ? 'destructive' : 'secondary'} className="font-normal">
                        {HOLDING_TYPE_LABELS[asset.holdingType]}
                    </Badge>
                    {asset.isPassive && (
                        <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">Passive</Badge>
                    )}
                </div>
              </TableCell>
              <TableCell className="text-right text-muted-foreground text-xs">
                {asset.costBase && asset.costBase > 0 
                  ? new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 0 }).format(asset.costBase) 
                  : '-'}
              </TableCell>
              <TableCell className="text-right font-bold text-sm">
                {new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 0 }).format(asset.marketValue)}
                <span className="text-[10px] text-muted-foreground ml-1">{asset.currency}</span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => { setAssetToEdit(asset); setShowForm(true); }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(asset.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  if (loading) return <div className="text-center p-8"><Loader2 className="animate-spin mx-auto mb-2" /> 加载中...</div>;

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Asset Lists (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Domestic Assets */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2 bg-muted/20 p-2 rounded">
              <Building2 className="h-4 w-4" /> 国内资产 (CN/HK)
              <Badge variant="secondary" className="text-xs ml-auto">{domesticAssets.length} 项</Badge>
            </h4>
            {domesticAssets.length > 0 ? renderAssetTable(domesticAssets) : (
              <div className="text-sm text-muted-foreground italic pl-6 py-2 border rounded-md p-4 bg-muted/10 text-center">暂无国内资产</div>
            )}
          </div>

          {/* Foreign Assets */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2 bg-muted/20 p-2 rounded">
              <Globe className="h-4 w-4" /> 国外资产 (Global)
              <Badge variant="secondary" className="text-xs ml-auto">{foreignAssets.length} 项</Badge>
            </h4>
            {foreignAssets.length > 0 ? renderAssetTable(foreignAssets) : (
              <div className="text-sm text-muted-foreground italic pl-6 py-2 border rounded-md p-4 bg-muted/10 text-center">暂无国外资产</div>
            )}
          </div>

          {/* Add Asset Button & Form */}
          <div className="mt-8 pt-4 border-t">
            {!showForm ? (
              <Button 
                onClick={() => { setAssetToEdit(undefined); setShowForm(true); }} 
                className="w-full h-12 bg-[#d4af37] hover:bg-[#b5902c] text-white font-medium shadow-sm border-none" 
              >
                <Plus className="mr-2 h-5 w-5" /> 添加新资产
              </Button>
            ) : (
              <div className="bg-slate-50 p-4 rounded-lg border">
                <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Plus className="h-4 w-4" /> {assetToEdit ? "编辑资产" : "添加新资产"}
                </h4>
                <AssetForm 
                  caseId={caseId} 
                  assetToEdit={assetToEdit}
                  onSuccess={handleFormSuccess} 
                  onCancel={() => { setShowForm(false); setAssetToEdit(undefined); }} 
                />
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Stats (4 cols) */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
          
          {/* Domestic Assets Summary */}
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">国内资产 (USD Est.)</div>
              <div className="text-2xl font-bold">{formatCurrency(domesticTotalUSD)}</div>
            </CardContent>
          </Card>

          {/* Foreign Assets Summary */}
          <Card className="border-l-4 border-l-green-500 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">国外资产 (USD Est.)</div>
              <div className="text-2xl font-bold">{formatCurrency(foreignTotalUSD)}</div>
            </CardContent>
          </Card>

          {/* Total Assets Card */}
          <Card className="bg-primary text-primary-foreground border-none shadow-lg mt-4">
            <CardContent className="pt-6">
              <div className="text-sm opacity-80 mb-1">总资产估值</div>
              <div className="text-3xl font-bold tracking-tight">{formatCurrency(totalUSD)}</div>
              <div className="mt-4 pt-4 border-t border-primary-foreground/20 flex justify-between items-center text-xs opacity-90">
                <span>人民币参考值</span>
                <span className="font-mono text-base font-semibold">{formatCurrency(totalUSD * 7.2, 'CNY')}</span>
              </div>
            </CardContent>
          </Card>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">资产数量</div>
                <div className="text-2xl font-bold flex items-center justify-center gap-1">
                  <Wallet className="h-4 w-4 text-primary" /> {assets.length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">资产类别</div>
                <div className="text-2xl font-bold flex items-center justify-center gap-1">
                  <PieIcon className="h-4 w-4 text-primary" /> {typeChartData.length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Type Distribution Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <PieIcon className="h-4 w-4" /> 类别分布
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full">
                {typeChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={typeChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {typeChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend iconSize={8} layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-xs">暂无数据</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Holder Distribution Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" /> 持有人分布
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full">
                {holderChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={holderChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {holderChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend iconSize={8} layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-xs">暂无数据</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Growth Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> 资产增值分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full">
                {assets.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={growthChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis hide />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} cursor={{ fill: 'transparent' }} />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40}>
                        {growthChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#94a3b8' : '#22c55e'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-xs">暂无数据</div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
