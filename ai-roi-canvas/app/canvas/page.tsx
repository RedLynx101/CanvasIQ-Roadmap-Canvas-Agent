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
  Sparkles,
  CheckSquare,
  Database,
  Users,
  Zap,
  Shield,
  BarChart3,
  PieChart
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
        'CanvasIQ'
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
    <main className="min-h-screen print:bg-white print:min-h-0">
      <Navigation />
      
      <div className="pt-24 px-4 pb-12 print:hidden">
        <div className="max-w-5xl mx-auto">
          {/* Header - Hide on print */}
          <div className="flex items-center justify-between mb-8">
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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
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
              {/* Canvas Preview - scrollable version for screen */}
              <CanvasPreview canvas={canvas} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Print-only single-page canvas */}
      <PrintableCanvas canvas={canvas} />
    </main>
  );
}

function CanvasPreview({ canvas }: { canvas: AIROICanvas }) {
  return (
    <div className="canvas-print-container space-y-4 print:space-y-3">
      {/* Header Section - Should stay together */}
      <div className="canvas-header print-section">
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent print:border-2 print:border-blue-200 print:bg-blue-50">
          <CardContent className="p-6 print:p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--electric)] to-[var(--emerald-accent)] flex items-center justify-center print:bg-blue-500">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold print:text-xl print:text-gray-900">{canvas.header.canvasTitle}</h1>
                  <p className="text-muted-foreground print:text-gray-600">{canvas.header.name}</p>
                </div>
              </div>
              <div className="text-right text-sm print:text-xs">
                <div className="print:text-gray-700"><span className="text-muted-foreground print:text-gray-500">Designed By:</span> {canvas.header.designedBy}</div>
                <div className="print:text-gray-700"><span className="text-muted-foreground print:text-gray-500">For:</span> {canvas.header.designedFor}</div>
                <div className="print:text-gray-700"><span className="text-muted-foreground print:text-gray-500">Date:</span> {canvas.header.date}</div>
                <Badge variant="outline" className="mt-1 print:border-gray-400 print:text-gray-600">v{canvas.header.version}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategy Section - Objectives, Inputs, Impacts */}
      <div className="canvas-section print-section">
        <div className="grid md:grid-cols-3 gap-4 print:gap-3 print:grid-cols-3">
          {/* Objectives */}
          <Card className="border-border/50 print:border print:border-gray-300">
            <CardHeader className="pb-2 print:pb-1 print:bg-gray-50">
              <CardTitle className="text-sm flex items-center gap-2 print:text-gray-800">
                <Target className="w-4 h-4 text-blue-500 print:text-blue-600" />
                Objectives
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 print:text-xs print:space-y-1">
              <div>
                <div className="font-medium print:text-gray-800">Primary Goal</div>
                <p className="text-muted-foreground print:text-gray-600">{canvas.objectives.primaryGoal}</p>
              </div>
              <div>
                <div className="font-medium print:text-gray-800">Strategic Focus</div>
                <ul className="text-muted-foreground print:text-gray-600 list-disc list-inside">
                  {canvas.objectives.strategicFocus.slice(0, 4).map((s, i) => (
                    <li key={i} className="print:leading-tight">{s}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Inputs */}
          <Card className="border-border/50 print:border print:border-gray-300">
            <CardHeader className="pb-2 print:pb-1 print:bg-gray-50">
              <CardTitle className="text-sm flex items-center gap-2 print:text-gray-800">
                <Cpu className="w-4 h-4 text-emerald-500 print:text-emerald-600" />
                Inputs
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 print:text-xs print:space-y-1">
              <div>
                <div className="font-medium print:text-gray-800">Resources</div>
                <p className="text-muted-foreground print:text-gray-600">
                  {canvas.inputs.resources.slice(0, 3).join(', ')}
                </p>
              </div>
              <div>
                <div className="font-medium print:text-gray-800">Personnel</div>
                <p className="text-muted-foreground print:text-gray-600">
                  {canvas.inputs.personnel.slice(0, 3).join(', ')}
                </p>
              </div>
              <div>
                <div className="font-medium print:text-gray-800">External Support</div>
                <p className="text-muted-foreground print:text-gray-600">
                  {canvas.inputs.externalSupport.slice(0, 2).join(', ')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Impacts */}
          <Card className="border-border/50 print:border print:border-gray-300">
            <CardHeader className="pb-2 print:pb-1 print:bg-gray-50">
              <CardTitle className="text-sm flex items-center gap-2 print:text-gray-800">
                <TrendingUp className="w-4 h-4 text-violet-500 print:text-violet-600" />
                Impacts
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 print:text-xs print:space-y-1">
              <div>
                <div className="font-medium print:text-gray-800">Hard Benefits</div>
                <ul className="text-muted-foreground print:text-gray-600 text-xs">
                  {canvas.impacts.hardBenefits.slice(0, 3).map((b, i) => (
                    <li key={i} className="print:leading-tight">• {b}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-medium print:text-gray-800">Soft Benefits</div>
                <p className="text-muted-foreground print:text-gray-600">
                  {canvas.impacts.softBenefits.slice(0, 4).join(', ')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Timeline Section - Keep together */}
      <div className="canvas-section print-section">
        <Card className="border-border/50 print:border print:border-gray-300">
          <CardHeader className="pb-2 print:pb-1 print:bg-gray-50">
            <CardTitle className="text-sm flex items-center gap-2 print:text-gray-800">
              <Calendar className="w-4 h-4 text-blue-500 print:text-blue-600" />
              Implementation Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="print:py-3">
            <div className="grid md:grid-cols-3 gap-4 print:gap-3 print:grid-cols-3">
              {['Q1', '1-Year', '3-Year'].map((timeframe) => {
                const items = canvas.timeline.filter(t => t.timeframe === timeframe);
                return (
                  <div key={timeframe} className="space-y-2 print:space-y-1">
                    <Badge 
                      variant="outline"
                      className={cn(
                        "print:font-semibold",
                        timeframe === 'Q1' && 'border-blue-500/50 text-blue-500 print:border-blue-400 print:text-blue-600 print:bg-blue-50',
                        timeframe === '1-Year' && 'border-emerald-500/50 text-emerald-500 print:border-emerald-400 print:text-emerald-600 print:bg-emerald-50',
                        timeframe === '3-Year' && 'border-violet-500/50 text-violet-500 print:border-violet-400 print:text-violet-600 print:bg-violet-50',
                      )}
                    >
                      {timeframe === 'Q1' ? 'Quick Wins (Q1)' : timeframe === '1-Year' ? 'Mid-Term (1 Year)' : 'Long-Term (3 Year)'}
                    </Badge>
                    {items.length === 0 ? (
                      <p className="text-xs text-muted-foreground print:text-gray-400 italic">No initiatives planned</p>
                    ) : (
                      <ul className="text-xs space-y-1 print:space-y-0.5">
                        {items.map((item, i) => (
                          <li key={i} className="text-muted-foreground print:text-gray-600 print:leading-tight">
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
      </div>

      {/* Details Grid - May span pages, each card stays together */}
      <div className="canvas-section">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 print:gap-3 print:grid-cols-4">
          {/* Risks */}
          <Card className="border-border/50 print:border print:border-gray-300 print-section">
            <CardHeader className="pb-2 print:pb-1 print:bg-amber-50">
              <CardTitle className="text-sm flex items-center gap-2 print:text-gray-800">
                <AlertTriangle className="w-4 h-4 text-amber-500 print:text-amber-600" />
                Risks
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-1 print:space-y-0.5">
              {canvas.risks.length === 0 ? (
                <p className="text-muted-foreground print:text-gray-400 italic">No high risks identified</p>
              ) : (
                canvas.risks.slice(0, 4).map((r, i) => (
                  <div key={i} className="flex items-center gap-1 print:leading-tight">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[10px] px-1 print:text-[9px]",
                        r.likelihood === 'High' && 'border-red-500/50 text-red-500 print:border-red-400 print:text-red-600 print:bg-red-50',
                        r.likelihood === 'Medium' && 'border-amber-500/50 text-amber-500 print:border-amber-400 print:text-amber-600 print:bg-amber-50',
                      )}
                    >
                      {r.likelihood}
                    </Badge>
                    <span className="text-muted-foreground print:text-gray-600">{r.name}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Capabilities */}
          <Card className="border-border/50 print:border print:border-gray-300 print-section">
            <CardHeader className="pb-2 print:pb-1 print:bg-emerald-50">
              <CardTitle className="text-sm flex items-center gap-2 print:text-gray-800">
                <Cpu className="w-4 h-4 text-emerald-500 print:text-emerald-600" />
                Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs print:space-y-1">
              <div className="mb-2 print:mb-1">
                <div className="font-medium text-muted-foreground print:text-gray-700">Skills Needed</div>
                <p className="text-muted-foreground print:text-gray-600">
                  {canvas.capabilities.skillsNeeded.slice(0, 3).join(', ')}
                </p>
              </div>
              <div>
                <div className="font-medium text-muted-foreground print:text-gray-700">Technology Stack</div>
                <p className="text-muted-foreground print:text-gray-600">
                  {canvas.capabilities.technology.slice(0, 3).join(', ')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Costs */}
          <Card className="border-border/50 print:border print:border-gray-300 print-section">
            <CardHeader className="pb-2 print:pb-1 print:bg-red-50">
              <CardTitle className="text-sm flex items-center gap-2 print:text-gray-800">
                <DollarSign className="w-4 h-4 text-red-500 print:text-red-600" />
                Investment Costs
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-1 print:space-y-0.5">
              <div className="flex justify-between print:leading-tight">
                <span className="text-muted-foreground print:text-gray-500">Near-Term:</span>
                <span className="font-medium print:text-gray-800">{formatCurrency(canvas.costs.nearTerm)}</span>
              </div>
              <div className="flex justify-between print:leading-tight">
                <span className="text-muted-foreground print:text-gray-500">Long-Term:</span>
                <span className="font-medium print:text-gray-800">{formatCurrency(canvas.costs.longTerm)}</span>
              </div>
              <div className="flex justify-between print:leading-tight border-t border-border/50 pt-1 print:border-gray-200">
                <span className="text-muted-foreground print:text-gray-500">Annual Maintenance:</span>
                <span className="font-medium print:text-gray-800">{formatCurrency(canvas.costs.annualMaintenance)}/yr</span>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card className="border-border/50 print:border print:border-gray-300 print-section">
            <CardHeader className="pb-2 print:pb-1 print:bg-emerald-50">
              <CardTitle className="text-sm flex items-center gap-2 print:text-gray-800">
                <TrendingUp className="w-4 h-4 text-emerald-500 print:text-emerald-600" />
                Expected Benefits
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-1 print:space-y-0.5">
              <div className="flex justify-between print:leading-tight">
                <span className="text-muted-foreground print:text-gray-500">Near-Term:</span>
                <span className="font-medium text-emerald-500 print:text-emerald-600">{formatCurrency(canvas.benefits.nearTerm)}/yr</span>
              </div>
              <div className="flex justify-between print:leading-tight">
                <span className="text-muted-foreground print:text-gray-500">Long-Term:</span>
                <span className="font-medium text-emerald-500 print:text-emerald-600">{formatCurrency(canvas.benefits.longTerm)}/yr</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Portfolio ROI Summary - Key section, stays together */}
      <div className="canvas-section print-section">
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 print:border-2 print:border-blue-300 print:bg-gradient-to-r print:from-blue-50 print:to-violet-50">
          <CardContent className="p-4 print:p-4">
            <div className="text-center mb-3 print:mb-2">
              <h3 className="text-sm font-semibold text-muted-foreground print:text-gray-700 uppercase tracking-wide">Portfolio ROI Summary</h3>
            </div>
            <div className="flex items-center justify-center gap-12 print:gap-8 flex-wrap">
              <div className="text-center">
                <div className="text-xs text-muted-foreground print:text-gray-500 mb-1">Near-Term ROI</div>
                <div className="text-3xl font-bold text-blue-500 print:text-blue-600">
                  {formatPercent(canvas.portfolioROI.nearTermROIPercent)}
                </div>
              </div>
              <div className="hidden print:block w-px h-12 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground print:text-gray-500 mb-1">Long-Term ROI</div>
                <div className="text-3xl font-bold text-violet-500 print:text-violet-600">
                  {formatPercent(canvas.portfolioROI.longTermROIPercent)}
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border/30 print:border-gray-200 text-center">
              <p className="text-xs text-muted-foreground print:text-gray-600 max-w-2xl mx-auto">
                {canvas.portfolioROI.portfolioNote}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="canvas-footer text-center text-xs text-muted-foreground print:text-gray-500 pt-4 print:pt-3 print:mt-4 print:border-t print:border-gray-200">
        <p>{canvas.footer.creditLine}</p>
      </div>
    </div>
  );
}

// ============================================================
// PRINTABLE CANVAS - Single Page PDF Export Layout
// ============================================================
function PrintableCanvas({ canvas }: { canvas: AIROICanvas }) {
  return (
    <div className="print-canvas hidden print:block">
      {/* Main Title Header */}
      <header className="print-canvas-header">
        <h1 className="print-canvas-title">AI Overall ROI and Roadmap Canvas</h1>
        <div className="print-canvas-brand">
          <Sparkles className="w-4 h-4" />
          <span>CanvasIQ</span>
        </div>
      </header>

      {/* Objectives - Full Width */}
      <section className="print-section-objectives">
        <div className="print-section-header">
          <span className="print-section-title">Objectives</span>
          <Target className="print-section-icon" />
        </div>
        <div className="print-section-content">
          <p>{canvas.objectives.primaryGoal} {canvas.objectives.strategicFocus.length > 0 && `Balance focus areas: ${canvas.objectives.strategicFocus.slice(0, 3).join(', ')}.`}</p>
        </div>
      </section>

      {/* Main Grid Layout */}
      <div className="print-main-grid">
        {/* Left Column: Inputs */}
        <section className="print-section-inputs">
          <div className="print-section-header">
            <span className="print-section-title">Inputs</span>
            <Database className="print-section-icon" />
          </div>
          <div className="print-section-content">
            <div className="print-subsection">
              <strong>Data:</strong> {canvas.inputs.resources.slice(0, 3).join(', ')}.
            </div>
            <div className="print-subsection">
              <strong>People:</strong> {canvas.inputs.personnel.slice(0, 3).join(', ')}.
            </div>
            <div className="print-subsection">
              <strong>Technology:</strong> {canvas.inputs.externalSupport.slice(0, 2).join(', ')}.
            </div>
          </div>
        </section>

        {/* Middle Column: Impacts */}
        <section className="print-section-impacts">
          <div className="print-section-header">
            <span className="print-section-title">Impacts</span>
            <CheckSquare className="print-section-icon" />
          </div>
          <div className="print-section-content">
            {canvas.impacts.hardBenefits.slice(0, 3).map((b, i) => (
              <div key={i} className="print-subsection">
                <strong>{b.split(':')[0]}:</strong> {b.includes(':') ? b.split(':')[1] : b}
              </div>
            ))}
            <div className="print-subsection">
              <strong>Soft benefits:</strong> {canvas.impacts.softBenefits.slice(0, 3).join(', ')}.
            </div>
          </div>
        </section>

        {/* Right Column: Timeline - Spans multiple rows */}
        <section className="print-section-timeline">
          <div className="print-section-header">
            <span className="print-section-title">Timeline & Milestones</span>
            <Calendar className="print-section-icon" />
          </div>
          <div className="print-section-content print-timeline-content">
            {['Q1', '1-Year', '3-Year'].map((timeframe, idx) => {
              const items = canvas.timeline.filter(t => t.timeframe === timeframe);
              const phaseLabel = timeframe === 'Q1' ? 'Phase 1 (Q1)' : timeframe === '1-Year' ? 'Phase 2 (Year 1)' : 'Phase 3 (Years 2-3)';
              return items.length > 0 && (
                <div key={timeframe} className="print-phase">
                  <strong>{phaseLabel}:</strong> {items.map(t => t.aiInitiative).join(', ')}.
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom Left in Grid: Risks */}
        <section className="print-section-risks">
          <div className="print-section-header">
            <span className="print-section-title">Risks</span>
            <AlertTriangle className="print-section-icon" />
          </div>
          <div className="print-section-content">
            {canvas.risks.length === 0 ? (
              <div className="print-subsection"><em>No significant risks identified.</em></div>
            ) : (
              canvas.risks.slice(0, 3).map((r, i) => (
                <div key={i} className="print-subsection">
                  <strong>{r.likelihood} risk:</strong> {r.name.replace(' Implementation Risk', '')} - {r.mitigation.substring(0, 60)}...
                </div>
              ))
            )}
          </div>
        </section>

        {/* Bottom Middle: Capabilities */}
        <section className="print-section-capabilities">
          <div className="print-section-header">
            <span className="print-section-title">Capabilities</span>
            <Cpu className="print-section-icon" />
          </div>
          <div className="print-section-content">
            <div className="print-subsection">
              <strong>Existing:</strong> {canvas.capabilities.skillsNeeded.slice(0, 3).join(', ')}.
            </div>
            <div className="print-subsection">
              <strong>Required to scale:</strong> {canvas.capabilities.technology.slice(0, 3).join(', ')}.
            </div>
          </div>
        </section>
      </div>

      {/* Costs & Benefits Row */}
      <div className="print-costs-benefits-row">
        <section className="print-section-costs">
          <div className="print-section-header">
            <span className="print-section-title">Costs</span>
            <DollarSign className="print-section-icon" />
          </div>
          <div className="print-section-content">
            <div className="print-subsection">
              <strong>Hard costs:</strong> Implementation {formatCurrency(canvas.costs.nearTerm + canvas.costs.longTerm)}, Annual maintenance {formatCurrency(canvas.costs.annualMaintenance)}.
            </div>
            <div className="print-subsection">
              <strong>Soft costs:</strong> Training, change management, governance overhead.
            </div>
            <div className="print-subsection">
              <strong>Portfolio view:</strong> Near-term {formatCurrency(canvas.costs.nearTerm)}, Long-term {formatCurrency(canvas.costs.longTerm)}.
            </div>
          </div>
        </section>

        <section className="print-section-benefits">
          <div className="print-section-header">
            <span className="print-section-title">Benefits</span>
            <TrendingUp className="print-section-icon" />
          </div>
          <div className="print-section-content">
            <div className="print-subsection">
              <strong>Hard benefits:</strong> Near-term {formatCurrency(canvas.benefits.nearTerm)}/yr, Long-term {formatCurrency(canvas.benefits.longTerm)}/yr.
            </div>
            <div className="print-subsection">
              <strong>Soft benefits:</strong> {canvas.benefits.softBenefits.slice(0, 4).join(', ')}.
            </div>
          </div>
        </section>
      </div>

      {/* Portfolio ROI - Full Width */}
      <section className="print-section-roi">
        <div className="print-section-header">
          <span className="print-section-title">Portfolio Return on Investment</span>
          <PieChart className="print-section-icon" />
        </div>
        <div className="print-section-content">
          <p>
            <strong>Near-Term ROI: {formatPercent(canvas.portfolioROI.nearTermROIPercent)}</strong> | <strong>Long-Term ROI: {formatPercent(canvas.portfolioROI.longTermROIPercent)}</strong>
          </p>
          <p className="print-roi-note">{canvas.portfolioROI.portfolioNote}</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="print-canvas-footer">
        <span>{canvas.footer.creditLine}</span>
      </footer>
    </div>
  );
}

