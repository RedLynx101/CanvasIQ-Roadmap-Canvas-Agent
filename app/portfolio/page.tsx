'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCanvasStore } from '@/store/canvas-store';
import { 
  calculateROI, 
  calculateRiskAdjustedValue,
  formatCurrency,
  selectPortfolioByBudget
} from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { 
  Zap, 
  Star, 
  HelpCircle, 
  Trash2,
  Wand2,
  DollarSign,
  Plus,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

// Impact-Effort Matrix quadrant definitions
const QUADRANTS = [
  { id: 'quick-wins', label: 'Quick Wins', description: 'High Impact, Low Effort', icon: Zap, color: 'emerald' },
  { id: 'strategic', label: 'Strategic Projects', description: 'High Impact, High Effort', icon: Star, color: 'blue' },
  { id: 'fill-ins', label: 'Fill-Ins', description: 'Low Impact, Low Effort', icon: HelpCircle, color: 'amber' },
  { id: 'avoid', label: 'Reconsider', description: 'Low Impact, High Effort', icon: Trash2, color: 'red' },
];

export default function PortfolioPage() {
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
  
  return <PortfolioContent />;
}

function PortfolioContent() {
  const { useCases, toggleUseCaseSelection, setUseCases, budgetConstraint } = useCanvasStore();
  const [budget, setBudget] = useState(budgetConstraint);

  // Categorize use cases into quadrants
  const categorizeUseCase = (impactScore: number, effortScore: number) => {
    const highImpact = impactScore >= 3.5;
    const highEffort = effortScore >= 3.5;
    
    if (highImpact && !highEffort) return 'quick-wins';
    if (highImpact && highEffort) return 'strategic';
    if (!highImpact && !highEffort) return 'fill-ins';
    return 'avoid';
  };

  const useCasesByQuadrant = QUADRANTS.reduce((acc, q) => {
    acc[q.id] = useCases.filter(uc => categorizeUseCase(uc.impactScore, uc.effortScore) === q.id);
    return acc;
  }, {} as Record<string, typeof useCases>);

  const handleAutoSelect = () => {
    const optimized = selectPortfolioByBudget(useCases, budget);
    setUseCases(optimized);
  };

  const handleSelectQuadrant = (quadrantId: string, select: boolean) => {
    const quadrantUseCases = useCasesByQuadrant[quadrantId];
    setUseCases(useCases.map(uc => 
      quadrantUseCases.some(quc => quc.id === uc.id) 
        ? { ...uc, selected: select }
        : uc
    ));
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
      {
        id: '6',
        name: 'Basic Reporting Dashboard',
        problemStatement: 'Manual report generation',
        kpis: ['Report generation time'],
        hardBenefits: 100000,
        softBenefits: ['Better visibility'],
        implementationCost: 50000,
        annualCost: 10000,
        effortScore: 1 as const,
        impactScore: 2 as const,
        riskLevel: 'Low' as const,
        dependencies: [],
        timeframe: 'Q1' as const,
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
            <h1 className="text-3xl font-bold mb-4">Portfolio Selection</h1>
            <p className="text-muted-foreground mb-8">
              No use cases to display. Start the interview or add demo data.
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
              <h1 className="text-3xl font-bold mb-2">Portfolio Selection</h1>
              <p className="text-muted-foreground">
                Use the Impact-Effort matrix to prioritize your AI initiatives
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-32"
                  placeholder="Budget"
                />
              </div>
              <Button onClick={handleAutoSelect} className="gap-2">
                <Wand2 className="w-4 h-4" />
                Auto-Select by Budget
              </Button>
            </div>
          </div>

          {/* Impact-Effort Matrix */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {QUADRANTS.map((quadrant) => {
              const Icon = quadrant.icon;
              const quadrantUseCases = useCasesByQuadrant[quadrant.id];
              const selectedCount = quadrantUseCases.filter(uc => uc.selected).length;
              
              return (
                <Card 
                  key={quadrant.id}
                  className={cn(
                    "border-border/50 bg-card/50 min-h-[300px]",
                    quadrant.id === 'quick-wins' && "border-l-4 border-l-emerald-500",
                    quadrant.id === 'strategic' && "border-l-4 border-l-blue-500",
                    quadrant.id === 'fill-ins' && "border-l-4 border-l-amber-500",
                    quadrant.id === 'avoid' && "border-l-4 border-l-red-500",
                  )}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Icon className={cn(
                          "w-5 h-5",
                          quadrant.color === 'emerald' && "text-emerald-500",
                          quadrant.color === 'blue' && "text-blue-500",
                          quadrant.color === 'amber' && "text-amber-500",
                          quadrant.color === 'red' && "text-red-500",
                        )} />
                        {quadrant.label}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {selectedCount}/{quadrantUseCases.length}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleSelectQuadrant(quadrant.id, true)}
                          className="h-6 px-2 text-xs"
                        >
                          All
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleSelectQuadrant(quadrant.id, false)}
                          className="h-6 px-2 text-xs"
                        >
                          None
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{quadrant.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {quadrantUseCases.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No use cases in this quadrant
                      </p>
                    ) : (
                      quadrantUseCases.map((uc) => {
                        const roi = calculateROI(uc);
                        const riskAdjustedValue = calculateRiskAdjustedValue(uc);
                        
                        return (
                          <div
                            key={uc.id}
                            onClick={() => toggleUseCaseSelection(uc.id)}
                            className={cn(
                              "p-3 rounded-lg border cursor-pointer transition-all duration-200",
                              uc.selected 
                                ? "bg-primary/10 border-primary/50" 
                                : "bg-background/50 border-border/30 hover:border-border"
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{uc.name}</div>
                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                  <span>{formatCurrency(uc.implementationCost)}</span>
                                  <span>•</span>
                                  <span className="text-emerald-500">ROI: {roi.basicROI.toFixed(0)}%</span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <Badge 
                                  variant="outline"
                                  className={cn(
                                    "text-[10px]",
                                    uc.riskLevel === 'Low' && "border-emerald-500/50 text-emerald-500",
                                    uc.riskLevel === 'Medium' && "border-amber-500/50 text-amber-500",
                                    uc.riskLevel === 'High' && "border-red-500/50 text-red-500",
                                  )}
                                >
                                  {uc.riskLevel}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground">
                                  Value: {formatCurrency(riskAdjustedValue)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Matrix Legend */}
          <Card className="border-border/50 bg-card/50">
            <CardContent className="py-4">
              <div className="flex items-center justify-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-500" />
                  <span>Quick Wins - Prioritize First</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500" />
                  <span>Strategic - Plan Carefully</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-amber-500" />
                  <span>Fill-Ins - If Budget Allows</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-500" />
                  <span>Reconsider - Low Priority</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selection Summary */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Selected {useCases.filter(uc => uc.selected).length} use cases with total implementation cost of{' '}
              <span className="font-semibold text-foreground">
                {formatCurrency(useCases.filter(uc => uc.selected).reduce((sum, uc) => sum + uc.implementationCost, 0))}
              </span>
            </p>
            <div className="mt-4">
              <Link href="/roadmap">
                <Button className="gap-2">
                  Continue to Roadmap
                  <Zap className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

