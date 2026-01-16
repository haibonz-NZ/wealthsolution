import { type Asset, ASSET_TYPE_LABELS, CURRENCY_LABELS } from "@/services/asset";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AssetAnalysisProps {
  assets: Asset[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff6b6b', '#6b6bff'];

export function AssetAnalysis({ assets }: AssetAnalysisProps) {
  
  // Helper to get USD value (Mock conversion)
  const getUSDValue = (a: Asset) => {
    if (a.currency === 'USD') return a.marketValue;
    if (a.currency === 'CNY') return a.marketValue / 7.2;
    if (a.currency === 'HKD') return a.marketValue / 7.8;
    return a.marketValue; 
  };

  const totalUSD = assets.reduce((sum, a) => sum + getUSDValue(a), 0);
  
  // Location Distribution
  const locationData = [
    { name: '中国/香港', value: assets.filter(a => a.location === 'CN' || a.location === 'HK').reduce((sum, a) => sum + getUSDValue(a), 0) },
    { name: '境外资产', value: assets.filter(a => a.location !== 'CN' && a.location !== 'HK').reduce((sum, a) => sum + getUSDValue(a), 0) }
  ].filter(d => d.value > 0);

  // Type Distribution
  const typeData = Object.entries(ASSET_TYPE_LABELS).map(([type, label]) => {
    const value = assets.filter(a => a.type === type).reduce((sum, a) => sum + getUSDValue(a), 0);
    return { name: label, value };
  }).filter(d => d.value > 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 1. Asset Distribution Charts */}
      <div className="space-y-6">
        <Card className="border-none shadow-none bg-transparent">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-sm font-medium">资产地域分布</CardTitle>
          </CardHeader>
          <CardContent className="px-0 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={locationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {locationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#22c55e'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend iconSize={8} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-none bg-transparent">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-sm font-medium">资产类别分布</CardTitle>
          </CardHeader>
          <CardContent className="px-0 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend iconSize={8} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 2. Key Asset Table */}
      <div className="md:border-l pl-0 md:pl-6">
        <h3 className="text-sm font-bold mb-4">核心资产清单 (Top 10)</h3>
        <div className="rounded-md border text-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>资产名称</TableHead>
                <TableHead>地</TableHead>
                <TableHead className="text-right">现值</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets
                .sort((a, b) => getUSDValue(b) - getUSDValue(a))
                .slice(0, 10)
                .map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">
                    {asset.name}
                    <div className="text-[10px] text-muted-foreground">{ASSET_TYPE_LABELS[asset.type]}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] px-1 py-0">{asset.location}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(getUSDValue(asset))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
