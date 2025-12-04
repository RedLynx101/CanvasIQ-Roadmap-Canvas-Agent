'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCanvasStore } from '@/store/canvas-store';
import { calculateROI, formatCurrency, formatPercent } from '@/lib/calculations';
import { 
  Briefcase, 
  Target, 
  DollarSign, 
  TrendingUp,
  AlertTriangle,
  Clock,
  RefreshCw
} from 'lucide-react';

export default function InterviewPage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return (
      <main className="h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }
  
  return <InterviewContent />;
}

function InterviewContent() {
  const { useCases, companyName, industry, budgetConstraint } = useCanvasStore();

  return (
    <main className="h-screen flex flex-col overflow-hidden">
      {/* Fixed Navigation */}
      <div className="flex-shrink-0">
        <Navigation />
      </div>
      
      {/* Main Content Area - below nav */}
      <div className="flex-1 flex overflow-hidden pt-16">
        {/* Chat Section - Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatInterface />
        </div>

        {/* Sidebar - Context & Use Cases */}
        <div className="w-80 border-l border-border/50 bg-card/30 backdrop-blur-sm hidden lg:flex flex-col overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {/* Company Context Card */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    Company Context
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {companyName ? (
                    <>
                      <div>
                        <span className="text-muted-foreground">Company:</span>
                        <span className="ml-2 font-medium">{companyName}</span>
                      </div>
                      {industry && (
                        <div>
                          <span className="text-muted-foreground">Industry:</span>
                          <span className="ml-2 font-medium">{industry}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Budget:</span>
                        <span className="ml-2 font-medium">{formatCurrency(budgetConstraint)}</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground text-xs">
                      Company context will appear here once captured during the interview.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Use Cases Summary */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Use Cases
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {useCases.length} / 5+
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {useCases.length > 0 ? (
                    <div className="space-y-3">
                      {useCases.map((uc) => {
                        const roi = calculateROI(uc);
                        return (
                          <div 
                            key={uc.id} 
                            className="p-2 rounded-lg bg-background/50 border border-border/30"
                          >
                            <div className="font-medium text-sm mb-1 truncate">
                              {uc.name || 'Unnamed Use Case'}
                            </div>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <DollarSign className="w-3 h-3" />
                                {formatCurrency(uc.hardBenefits)}
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <TrendingUp className="w-3 h-3" />
                                {formatPercent(roi.basicROI)}
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {roi.paybackPeriod === Infinity ? 'N/A' : `${roi.paybackPeriod} mo`}
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <AlertTriangle className="w-3 h-3" />
                                {uc.riskLevel}
                              </div>
                            </div>
                            <div className="flex gap-1 mt-2">
                              <Badge 
                                variant="outline" 
                                className="text-[10px] px-1.5 py-0"
                              >
                                Impact: {uc.impactScore}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className="text-[10px] px-1.5 py-0"
                              >
                                Effort: {uc.effortScore}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-xs">
                      AI use cases will appear here as you describe them during the interview.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Quick Tips</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-2">
                  <p>• Describe at least 5 AI use cases for best results</p>
                  <p>• Include specific dollar estimates for benefits</p>
                  <p>• Consider dependencies between projects</p>
                  <p>• Think about quick wins vs. long-term investments</p>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>
      </div>
    </main>
  );
}
