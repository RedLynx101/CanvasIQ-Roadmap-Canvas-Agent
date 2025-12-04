'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCanvasStore } from '@/store/canvas-store';
import { AIROICanvas } from '@/lib/canvas-schema';
import { formatCurrency, formatPercent } from '@/lib/calculations';
import { 
  generateCanvasFromData, 
  exportToJSON, 
  exportToMarkdown,
  downloadFile 
} from '@/lib/export';
import { cn } from '@/lib/utils';
import { 
  FileJson,
  FileText,
  FileImage,
  RefreshCw,
  Plus,
  Target,
  Calendar,
  AlertTriangle,
  Cpu,
  DollarSign,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function CanvasPage() {
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
  
  return <CanvasContent />;
}

function CanvasContent() {
  const { useCases, companyName, setUseCases } = useCanvasStore();
  const [canvas, setCanvas] = useState<AIROICanvas | null>(null);
  const [activeTab, setActiveTab] = useState('preview');

  const selectedUseCases = useCases.filter(uc => uc.selected);

  useEffect(() => {
    if (selectedUseCases.length > 0) {
      const generated = generateCanvasFromData(
        useCases,
        companyName || 'Your Organization',
        '',
        'AI ROI Canvas Agent'
      );
      setCanvas(generated);
    }
  }, [useCases, companyName, selectedUseCases.length]);

  const handleExportJSON = () => {
    if (canvas) {
      const json = exportToJSON(canvas);
      downloadFile(json, 'ai-roi-canvas.json', 'application/json');
    }
  };

  const handleExportMarkdown = () => {
    if (canvas) {
      const md = exportToMarkdown(canvas);
      downloadFile(md, 'ai-roi-canvas.md', 'text/markdown');
    }
  };

  const handleExportPDF = () => {
    // For PDF, we'll use the browser's print functionality
    window.print();
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
            <h1 className="text-3xl font-bold mb-4">Canvas Export</h1>
            <p className="text-muted-foreground mb-8">
              No use cases selected. Complete the interview and portfolio selection first.
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

  if (!canvas) {
    return (
      <main className="min-h-screen">
        <Navigation />
        <div className="pt-24 px-4 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen print:bg-white">
      <Navigation />
      
      <div className="pt-24 px-4 pb-12 print:pt-0 print:px-0">
        <div className="max-w-5xl mx-auto">
          {/* Header - Hide on print */}
          <div className="flex items-center justify-between mb-8 print:hidden">
            <div>
              <h1 className="text-3xl font-bold mb-2">AI ROI & Roadmap Canvas</h1>
              <p className="text-muted-foreground">
                Review and export your complete canvas
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportJSON} className="gap-2">
                <FileJson className="w-4 h-4" />
                JSON
              </Button>
              <Button variant="outline" onClick={handleExportMarkdown} className="gap-2">
                <FileText className="w-4 h-4" />
                Markdown
              </Button>
              <Button onClick={handleExportPDF} className="gap-2">
                <FileImage className="w-4 h-4" />
                Print/PDF
              </Button>
            </div>
          </div>

          {/* Tabs - Hide on print */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="print:hidden">
            <TabsList className="mb-6">
              <TabsTrigger value="preview">Canvas Preview</TabsTrigger>
              <TabsTrigger value="json">JSON View</TabsTrigger>
              <TabsTrigger value="markdown">Markdown View</TabsTrigger>
            </TabsList>

            <TabsContent value="json">
              <Card className="border-border/50 bg-card/50">
                <CardContent className="p-4">
                  <pre className="text-xs overflow-auto max-h-[600px] bg-background/50 p-4 rounded-lg">
                    {exportToJSON(canvas)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="markdown">
              <Card className="border-border/50 bg-card/50">
                <CardContent className="p-4">
                  <pre className="text-xs overflow-auto max-h-[600px] bg-background/50 p-4 rounded-lg whitespace-pre-wrap">
                    {exportToMarkdown(canvas)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview">
              {/* Canvas Preview - This is what gets printed */}
              <CanvasPreview canvas={canvas} />
            </TabsContent>
          </Tabs>

          {/* Print-only canvas */}
          <div className="hidden print:block">
            <CanvasPreview canvas={canvas} />
          </div>
        </div>
      </div>
    </main>
  );
}

function CanvasPreview({ canvas }: { canvas: AIROICanvas }) {
  return (
    <div className="space-y-4 print:space-y-2">
      {/* Header Section */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent print:border print:bg-white">
        <CardContent className="p-6 print:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--electric)] to-[var(--emerald-accent)] flex items-center justify-center print:bg-blue-500">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold print:text-xl">{canvas.header.canvasTitle}</h1>
                <p className="text-muted-foreground print:text-gray-600">{canvas.header.name}</p>
              </div>
            </div>
            <div className="text-right text-sm">
              <div><span className="text-muted-foreground">Designed By:</span> {canvas.header.designedBy}</div>
              <div><span className="text-muted-foreground">For:</span> {canvas.header.designedFor}</div>
              <div><span className="text-muted-foreground">Date:</span> {canvas.header.date}</div>
              <Badge variant="outline" className="mt-1">v{canvas.header.version}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid md:grid-cols-3 gap-4 print:gap-2">
        {/* Objectives */}
        <Card className="border-border/50 print:border">
          <CardHeader className="pb-2 print:pb-1">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              Objectives
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2 print:text-xs">
            <div>
              <div className="font-medium">Primary Goal</div>
              <p className="text-muted-foreground print:text-gray-600">{canvas.objectives.primaryGoal}</p>
            </div>
            <div>
              <div className="font-medium">Strategic Focus</div>
              <ul className="text-muted-foreground print:text-gray-600 list-disc list-inside">
                {canvas.objectives.strategicFocus.slice(0, 4).map((s, i) => (
                  <li key={i} className="truncate">{s}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Inputs */}
        <Card className="border-border/50 print:border">
          <CardHeader className="pb-2 print:pb-1">
            <CardTitle className="text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-500" />
              Inputs
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2 print:text-xs">
            <div>
              <div className="font-medium">Resources</div>
              <p className="text-muted-foreground print:text-gray-600">
                {canvas.inputs.resources.slice(0, 3).join(', ')}
              </p>
            </div>
            <div>
              <div className="font-medium">Personnel</div>
              <p className="text-muted-foreground print:text-gray-600">
                {canvas.inputs.personnel.slice(0, 3).join(', ')}
              </p>
            </div>
            <div>
              <div className="font-medium">External Support</div>
              <p className="text-muted-foreground print:text-gray-600">
                {canvas.inputs.externalSupport.slice(0, 2).join(', ')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Impacts */}
        <Card className="border-border/50 print:border">
          <CardHeader className="pb-2 print:pb-1">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-500" />
              Impacts
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2 print:text-xs">
            <div>
              <div className="font-medium">Hard Benefits</div>
              <ul className="text-muted-foreground print:text-gray-600 text-xs">
                {canvas.impacts.hardBenefits.slice(0, 3).map((b, i) => (
                  <li key={i} className="truncate">• {b}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-medium">Soft Benefits</div>
              <p className="text-muted-foreground print:text-gray-600">
                {canvas.impacts.softBenefits.slice(0, 4).join(', ')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card className="border-border/50 print:border">
        <CardHeader className="pb-2 print:pb-1">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 print:gap-2">
            {['Q1', '1-Year', '3-Year'].map((timeframe) => {
              const items = canvas.timeline.filter(t => t.timeframe === timeframe);
              return (
                <div key={timeframe} className="space-y-2">
                  <Badge 
                    variant="outline"
                    className={cn(
                      timeframe === 'Q1' && 'border-blue-500/50 text-blue-500',
                      timeframe === '1-Year' && 'border-emerald-500/50 text-emerald-500',
                      timeframe === '3-Year' && 'border-violet-500/50 text-violet-500',
                    )}
                  >
                    {timeframe}
                  </Badge>
                  {items.length === 0 ? (
                    <p className="text-xs text-muted-foreground print:text-gray-500">No initiatives</p>
                  ) : (
                    <ul className="text-xs space-y-1">
                      {items.map((item, i) => (
                        <li key={i} className="text-muted-foreground print:text-gray-600">
                          • {item.aiInitiative}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Grid */}
      <div className="grid md:grid-cols-4 gap-4 print:gap-2">
        {/* Risks */}
        <Card className="border-border/50 print:border">
          <CardHeader className="pb-2 print:pb-1">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Risks
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-1">
            {canvas.risks.length === 0 ? (
              <p className="text-muted-foreground print:text-gray-500">No high risks identified</p>
            ) : (
              canvas.risks.slice(0, 3).map((r, i) => (
                <div key={i} className="flex items-center gap-1">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[10px] px-1",
                      r.likelihood === 'High' && 'border-red-500/50 text-red-500',
                      r.likelihood === 'Medium' && 'border-amber-500/50 text-amber-500',
                    )}
                  >
                    {r.likelihood}
                  </Badge>
                  <span className="truncate text-muted-foreground print:text-gray-600">{r.name}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Capabilities */}
        <Card className="border-border/50 print:border">
          <CardHeader className="pb-2 print:pb-1">
            <CardTitle className="text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-500" />
              Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            <div className="mb-2">
              <div className="font-medium text-muted-foreground print:text-gray-500">Skills</div>
              <p className="text-muted-foreground print:text-gray-600">
                {canvas.capabilities.skillsNeeded.slice(0, 3).join(', ')}
              </p>
            </div>
            <div>
              <div className="font-medium text-muted-foreground print:text-gray-500">Tech</div>
              <p className="text-muted-foreground print:text-gray-600">
                {canvas.capabilities.technology.slice(0, 3).join(', ')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Costs */}
        <Card className="border-border/50 print:border">
          <CardHeader className="pb-2 print:pb-1">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-red-500" />
              Costs
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground print:text-gray-500">Near-Term:</span>
              <span className="font-medium">{formatCurrency(canvas.costs.nearTerm)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground print:text-gray-500">Long-Term:</span>
              <span className="font-medium">{formatCurrency(canvas.costs.longTerm)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground print:text-gray-500">Maintenance:</span>
              <span className="font-medium">{formatCurrency(canvas.costs.annualMaintenance)}/yr</span>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="border-border/50 print:border">
          <CardHeader className="pb-2 print:pb-1">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Benefits
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground print:text-gray-500">Near-Term:</span>
              <span className="font-medium text-emerald-500">{formatCurrency(canvas.benefits.nearTerm)}/yr</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground print:text-gray-500">Long-Term:</span>
              <span className="font-medium text-emerald-500">{formatCurrency(canvas.benefits.longTerm)}/yr</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio ROI */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 print:border print:bg-gray-50">
        <CardContent className="p-4 print:p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <div className="text-xs text-muted-foreground print:text-gray-500">Near-Term ROI</div>
                <div className="text-2xl font-bold text-blue-500 print:text-blue-600">
                  {formatPercent(canvas.portfolioROI.nearTermROIPercent)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground print:text-gray-500">Long-Term ROI</div>
                <div className="text-2xl font-bold text-violet-500 print:text-violet-600">
                  {formatPercent(canvas.portfolioROI.longTermROIPercent)}
                </div>
              </div>
            </div>
            <div className="text-right max-w-md">
              <div className="text-xs text-muted-foreground print:text-gray-600">
                {canvas.portfolioROI.portfolioNote}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground print:text-gray-500 pt-2">
        {canvas.footer.creditLine}
      </div>
    </div>
  );
}

