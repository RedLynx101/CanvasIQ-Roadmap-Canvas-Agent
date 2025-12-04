'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCanvasStore } from '@/store/canvas-store';
import { 
  calculateROI, 
  calculatePortfolioMetrics, 
  formatCurrency, 
  formatPercent,
  rankUseCases
} from '@/lib/calculations';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Plus,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return (
      <main className="min-h-screen">
        <Navigation />
        <div className="pt-24 px-4 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }
  
  return <DashboardContent />;
}

function DashboardContent() {
  const { useCases, toggleUseCaseSelection, setUseCases, resetStore } = useCanvasStore();
  const metrics = calculatePortfolioMetrics(useCases);
  const rankedUseCases = rankUseCases(useCases);

  // Prepare chart data
  const roiChartData = useCases.map(uc => ({
    name: uc.name.substring(0, 15) + (uc.name.length > 15 ? '...' : ''),
    roi: calculateROI(uc).basicROI,
    selected: uc.selected,
  }));

  const timeframeData = [
    { name: 'Q1', value: useCases.filter(uc => uc.timeframe === 'Q1').length, color: '#60a5fa' },
    { name: '1-Year', value: useCases.filter(uc => uc.timeframe === '1-Year').length, color: '#34d399' },
    { name: '3-Year', value: useCases.filter(uc => uc.timeframe === '3-Year').length, color: '#a78bfa' },
  ];

  const handleSelectAll = () => {
    setUseCases(useCases.map(uc => ({ ...uc, selected: true })));
  };

  const handleDeselectAll = () => {
    setUseCases(useCases.map(uc => ({ ...uc, selected: false })));
  };

  // Demo data for empty state
  const addDemoData = () => {
    const demoUseCases = [
      {
        id: '1',
        name: 'Customer Service Chatbot',
        problemStatement: 'High volume of repetitive customer inquiries',
        kpis: ['Response time', 'Customer satisfaction', 'Ticket volume'],
        hardBenefits: 500000,
        softBenefits: ['Improved customer experience', '24/7 availability'],
        implementationCost: 150000,
        annualCost: 50000,
        effortScore: 2 as const,
        impactScore: 4 as const,
        riskLevel: 'Low' as const,
        dependencies: [],
        timeframe: 'Q1' as const,
        selected: true,
      },
      {
        id: '2',
        name: 'Predictive Maintenance',
        problemStatement: 'Unplanned equipment downtime causing losses',
        kpis: ['Downtime hours', 'Maintenance costs', 'Equipment lifespan'],
        hardBenefits: 800000,
        softBenefits: ['Safety improvements', 'Better planning'],
        implementationCost: 300000,
        annualCost: 80000,
        effortScore: 4 as const,
        impactScore: 5 as const,
        riskLevel: 'Medium' as const,
        dependencies: ['IoT sensors installation'],
        timeframe: '1-Year' as const,
        selected: true,
      },
      {
        id: '3',
        name: 'Demand Forecasting',
        problemStatement: 'Inventory imbalances and stockouts',
        kpis: ['Forecast accuracy', 'Inventory turnover', 'Stockout rate'],
        hardBenefits: 600000,
        softBenefits: ['Better supplier relationships'],
        implementationCost: 200000,
        annualCost: 60000,
        effortScore: 3 as const,
        impactScore: 4 as const,
        riskLevel: 'Low' as const,
        dependencies: ['Data warehouse'],
        timeframe: '1-Year' as const,
        selected: true,
      },
      {
        id: '4',
        name: 'Document Processing AI',
        problemStatement: 'Manual document handling slowing operations',
        kpis: ['Processing time', 'Error rate', 'FTE savings'],
        hardBenefits: 350000,
        softBenefits: ['Employee satisfaction', 'Compliance improvement'],
        implementationCost: 100000,
        annualCost: 30000,
        effortScore: 2 as const,
        impactScore: 3 as const,
        riskLevel: 'Low' as const,
        dependencies: [],
        timeframe: 'Q1' as const,
        selected: true,
      },
      {
        id: '5',
        name: 'AI-Powered Recommendations',
        problemStatement: 'Low cross-sell and upsell rates',
        kpis: ['Revenue per customer', 'Conversion rate', 'Average order value'],
        hardBenefits: 1200000,
        softBenefits: ['Personalized experience', 'Customer loyalty'],
        implementationCost: 400000,
        annualCost: 100000,
        effortScore: 4 as const,
        impactScore: 5 as const,
        riskLevel: 'Medium' as const,
        dependencies: ['Customer data platform'],
        timeframe: '3-Year' as const,
        selected: false,
      },
    ];
    setUseCases(demoUseCases);
  };

  if (useCases.length === 0) {
    return (
      <main className="min-h-screen">
        <Navigation />
        <div className="pt-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            <p className="text-muted-foreground mb-8">
              No use cases captured yet. Start the interview or add demo data to explore the dashboard.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/interview">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Start Interview
                </Button>
              </Link>
              <Button variant="outline" onClick={addDemoData} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Load Demo Data
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Navigation />
      
      <div className="pt-24 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">ROI Dashboard</h1>
              <p className="text-muted-foreground">
                Portfolio analysis and use case metrics
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                Deselect All
              </Button>
              <Button variant="ghost" size="sm" onClick={resetStore} className="text-destructive">
                Reset
              </Button>
            </div>
          </div>

          {/* Portfolio Metrics Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Portfolio ROI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold gradient-text">
                  {formatPercent(metrics.portfolioROI)}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  {metrics.portfolioROI >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span>vs. baseline</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Portfolio NPV
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatCurrency(metrics.portfolioNPV)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  At 10% discount rate
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Avg. Payback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {metrics.averagePayback.toFixed(1)} mo
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Average across portfolio
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Selected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {useCases.filter(uc => uc.selected).length} / {useCases.length}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Use cases in portfolio
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* ROI Bar Chart */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg">ROI by Use Case</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={roiChartData} layout="vertical">
                      <XAxis type="number" tickFormatter={(v) => `${v}%`} />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                      <Tooltip 
                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'ROI']}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="roi" radius={[0, 4, 4, 0]}>
                        {roiChartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.selected ? '#60a5fa' : '#374151'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Timeframe Distribution */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg">Timeframe Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={timeframeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {timeframeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Use Cases Table */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">Use Cases (Ranked by Value)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 text-left text-sm text-muted-foreground">
                      <th className="pb-3 pr-4">Select</th>
                      <th className="pb-3 pr-4">Use Case</th>
                      <th className="pb-3 pr-4">Benefits</th>
                      <th className="pb-3 pr-4">Cost</th>
                      <th className="pb-3 pr-4">ROI</th>
                      <th className="pb-3 pr-4">NPV</th>
                      <th className="pb-3 pr-4">Payback</th>
                      <th className="pb-3 pr-4">Risk</th>
                      <th className="pb-3">Timeframe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankedUseCases.map((uc) => {
                      const roi = calculateROI(uc);
                      return (
                        <tr 
                          key={uc.id} 
                          className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-3 pr-4">
                            <input
                              type="checkbox"
                              checked={uc.selected}
                              onChange={() => toggleUseCaseSelection(uc.id)}
                              className="rounded border-border"
                            />
                          </td>
                          <td className="py-3 pr-4">
                            <div className="font-medium">{uc.name}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {uc.problemStatement}
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-emerald-500">
                            {formatCurrency(uc.hardBenefits)}
                          </td>
                          <td className="py-3 pr-4">
                            {formatCurrency(uc.implementationCost + uc.annualCost)}
                          </td>
                          <td className="py-3 pr-4">
                            <Badge 
                              variant={roi.basicROI >= 50 ? 'default' : 'secondary'}
                              className={roi.basicROI >= 50 ? 'bg-emerald-500/20 text-emerald-500' : ''}
                            >
                              {formatPercent(roi.basicROI)}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4">
                            {formatCurrency(roi.npv)}
                          </td>
                          <td className="py-3 pr-4">
                            {roi.paybackPeriod === Infinity ? (
                              <Minus className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              `${roi.paybackPeriod} mo`
                            )}
                          </td>
                          <td className="py-3 pr-4">
                            <Badge 
                              variant="outline"
                              className={
                                uc.riskLevel === 'Low' ? 'border-emerald-500/50 text-emerald-500' :
                                uc.riskLevel === 'Medium' ? 'border-amber-500/50 text-amber-500' :
                                'border-red-500/50 text-red-500'
                              }
                            >
                              {uc.riskLevel}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Badge variant="outline">
                              {uc.timeframe}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Near-Term vs Long-Term ROI */}
          <div className="grid sm:grid-cols-2 gap-4 mt-8">
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  Near-Term ROI (Q1 + 1-Year)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">
                  {formatPercent(metrics.nearTermROI)}
                </div>
                <Progress 
                  value={Math.min(Math.max(metrics.nearTermROI, 0), 200) / 2} 
                  className="mt-2 h-2"
                />
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  Long-Term ROI (3-Year)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-violet-400">
                  {formatPercent(metrics.longTermROI)}
                </div>
                <Progress 
                  value={Math.min(Math.max(metrics.longTermROI, 0), 200) / 2} 
                  className="mt-2 h-2"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

