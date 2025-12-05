'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCanvasStore } from '@/store/canvas-store';
import { formatCurrency, calculateROI } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { 
  Calendar,
  ArrowRight,
  Zap,
  Target,
  AlertTriangle,
  Plus,
  RefreshCw,
  Flag
} from 'lucide-react';
import Link from 'next/link';

const TIMEFRAMES = [
  { id: 'Q1', label: 'Q1 (Now)', description: 'Immediate priorities', color: 'blue', months: '0-3' },
  { id: '1-Year', label: '1 Year', description: 'Medium-term goals', color: 'emerald', months: '4-12' },
  { id: '3-Year', label: '3 Year', description: 'Long-term vision', color: 'violet', months: '13-36' },
] as const;

export default function RoadmapPage() {
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
  
  return <RoadmapContent />;
}

function RoadmapContent() {
  const { useCases, updateUseCase, setUseCases } = useCanvasStore();
  const selectedUseCases = useCases.filter(uc => uc.selected);

  const useCasesByTimeframe = TIMEFRAMES.reduce((acc, tf) => {
    acc[tf.id] = selectedUseCases.filter(uc => uc.timeframe === tf.id);
    return acc;
  }, {} as Record<string, typeof useCases>);

  const handleTimeframeChange = (useCaseId: string, newTimeframe: 'Q1' | '1-Year' | '3-Year') => {
    updateUseCase(useCaseId, { timeframe: newTimeframe });
  };

  // Auto-assign based on effort and dependencies
  const autoAssignTimeframes = () => {
    const updated = useCases.map(uc => {
      if (!uc.selected) return uc;
      
      // Quick wins (low effort, high impact) go to Q1
      if (uc.effortScore <= 2 && uc.impactScore >= 4) {
        return { ...uc, timeframe: 'Q1' as const };
      }
      // High effort projects go to 3-Year
      if (uc.effortScore >= 4) {
        return { ...uc, timeframe: '3-Year' as const };
      }
      // Everything else goes to 1-Year
      return { ...uc, timeframe: '1-Year' as const };
    });
    setUseCases(updated);
  };

  // Demo data
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
        selected: true,
      },
    ];
    setUseCases(demoUseCases);
  };

  if (selectedUseCases.length === 0) {
    return (
      <main className="min-h-screen">
        <Navigation />
        <div className="pt-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Roadmap</h1>
            <p className="text-muted-foreground mb-8">
              No use cases selected. Go to Portfolio to select use cases for your roadmap.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/portfolio">
                <Button className="gap-2">
                  <Target className="w-4 h-4" />
                  Select Portfolio
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
              <h1 className="text-3xl font-bold mb-2">AI Roadmap</h1>
              <p className="text-muted-foreground">
                Plan your AI initiatives across Q1, 1-Year, and 3-Year horizons
              </p>
            </div>
            <Button onClick={autoAssignTimeframes} variant="outline" className="gap-2">
              <Zap className="w-4 h-4" />
              Auto-Assign Timeframes
            </Button>
          </div>

          {/* Timeline Visualization */}
          <div className="relative mb-8">
            {/* Timeline line */}
            <div className="absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-violet-500 rounded-full" />
            
            {/* Timeline markers */}
            <div className="relative flex justify-between">
              {TIMEFRAMES.map((tf, index) => (
                <div key={tf.id} className="flex flex-col items-center">
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center z-10",
                    tf.color === 'blue' && "bg-blue-500/20 border-2 border-blue-500",
                    tf.color === 'emerald' && "bg-emerald-500/20 border-2 border-emerald-500",
                    tf.color === 'violet' && "bg-violet-500/20 border-2 border-violet-500",
                  )}>
                    {index === 0 && <Zap className="w-6 h-6 text-blue-500" />}
                    {index === 1 && <Target className="w-6 h-6 text-emerald-500" />}
                    {index === 2 && <Flag className="w-6 h-6 text-violet-500" />}
                  </div>
                  <div className="mt-4 text-center">
                    <div className="font-semibold">{tf.label}</div>
                    <div className="text-xs text-muted-foreground">{tf.months} months</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeframe Columns */}
          <div className="grid md:grid-cols-3 gap-6">
            {TIMEFRAMES.map((tf) => {
              const timeframeUseCases = useCasesByTimeframe[tf.id];
              const totalCost = timeframeUseCases.reduce((sum, uc) => sum + uc.implementationCost, 0);
              const totalBenefits = timeframeUseCases.reduce((sum, uc) => sum + uc.hardBenefits, 0);
              
              return (
                <Card 
                  key={tf.id}
                  className={cn(
                    "border-t-4",
                    tf.color === 'blue' && "border-t-blue-500",
                    tf.color === 'emerald' && "border-t-emerald-500",
                    tf.color === 'violet' && "border-t-violet-500",
                  )}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{tf.label}</CardTitle>
                      <Badge variant="outline">
                        {timeframeUseCases.length} projects
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{tf.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Summary */}
                    <div className="grid grid-cols-2 gap-2 p-3 bg-muted/30 rounded-lg text-xs">
                      <div>
                        <span className="text-muted-foreground">Investment:</span>
                        <div className="font-semibold">{formatCurrency(totalCost)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Benefits:</span>
                        <div className="font-semibold text-emerald-500">{formatCurrency(totalBenefits)}</div>
                      </div>
                    </div>

                    {/* Use Cases */}
                    {timeframeUseCases.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        Drag projects here or use the dropdown to assign
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {timeframeUseCases.map((uc, index) => {
                          const roi = calculateROI(uc);
                          return (
                            <div
                              key={uc.id}
                              className="p-3 rounded-lg border border-border/50 bg-background/50 hover:border-border transition-colors"
                            >
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium",
                                  tf.color === 'blue' && "bg-blue-500/20 text-blue-500",
                                  tf.color === 'emerald' && "bg-emerald-500/20 text-emerald-500",
                                  tf.color === 'violet' && "bg-violet-500/20 text-violet-500",
                                )}>
                                  {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm truncate">{uc.name}</div>
                                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                    <span>{formatCurrency(uc.implementationCost)}</span>
                                    <span>•</span>
                                    <span className="text-emerald-500">+{roi.basicROI.toFixed(0)}% ROI</span>
                                  </div>
                                  
                                  {/* Dependencies */}
                                  {uc.dependencies.length > 0 && (
                                    <div className="flex items-center gap-1 mt-2 text-xs text-amber-500">
                                      <AlertTriangle className="w-3 h-3" />
                                      <span>Depends on: {uc.dependencies.join(', ')}</span>
                                    </div>
                                  )}

                                  {/* Timeframe selector */}
                                  <div className="mt-2">
                                    <Select
                                      value={uc.timeframe}
                                      onValueChange={(value) => handleTimeframeChange(uc.id, value as 'Q1' | '1-Year' | '3-Year')}
                                    >
                                      <SelectTrigger className="h-7 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Q1">Q1 (Now)</SelectItem>
                                        <SelectItem value="1-Year">1 Year</SelectItem>
                                        <SelectItem value="3-Year">3 Year</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Milestones Summary */}
          <Card className="mt-8 border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">Key Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {TIMEFRAMES.map((tf) => {
                  const timeframeUseCases = useCasesByTimeframe[tf.id];
                  if (timeframeUseCases.length === 0) return null;
                  
                  return (
                    <div key={tf.id} className="flex items-start gap-4">
                      <div className={cn(
                        "w-3 h-3 rounded-full mt-1.5 flex-shrink-0",
                        tf.color === 'blue' && "bg-blue-500",
                        tf.color === 'emerald' && "bg-emerald-500",
                        tf.color === 'violet' && "bg-violet-500",
                      )} />
                      <div className="flex-1">
                        <div className="font-medium">{tf.label} Completion</div>
                        <div className="text-sm text-muted-foreground">
                          Complete {timeframeUseCases.length} project(s): {timeframeUseCases.map(uc => uc.name).join(', ')}
                        </div>
                      </div>
                      <Badge variant="outline" className="flex-shrink-0">
                        {tf.months} months
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Action */}
          <div className="mt-8 text-center">
            <Link href="/canvas">
              <Button className="gap-2" size="lg">
                Generate Canvas
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

