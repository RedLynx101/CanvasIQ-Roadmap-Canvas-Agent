'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navigation } from '@/components/Navigation';
import { 
  ArrowRight, 
  MessageSquare, 
  Calculator, 
  PieChart, 
  Map, 
  FileOutput,
  Sparkles,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'AI Interview',
    description: 'Guided conversation to capture your AI use cases, KPIs, and strategic goals.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Calculator,
    title: 'ROI Computation',
    description: 'Automatic calculation of ROI, NPV, payback period, and risk-adjusted value.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: PieChart,
    title: 'Portfolio Selection',
    description: 'Impact-Effort matrix visualization with constraint-based optimization.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: Map,
    title: 'Roadmap Generation',
    description: 'Strategic timeline with Q1, 1-Year, and 3-Year milestone planning.',
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: FileOutput,
    title: 'Canvas Export',
    description: 'Export your complete AI ROI & Roadmap Canvas in multiple formats.',
    color: 'from-pink-500 to-rose-500',
  },
];

const benefits = [
  {
    icon: TrendingUp,
    title: 'Data-Driven Decisions',
    description: 'Make AI investment decisions backed by rigorous financial analysis.',
  },
  {
    icon: Shield,
    title: 'Risk Management',
    description: 'Identify and mitigate risks with risk-adjusted portfolio optimization.',
  },
  {
    icon: Zap,
    title: 'Quick Time-to-Value',
    description: 'Prioritize quick wins while building toward transformational AI.',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-8 animate-fade-up">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">AI-Powered Strategic Planning</span>
          </div>

          {/* Logo Icon */}
          <div className="flex justify-center mb-6 animate-fade-up animate-delay-100">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--electric)] via-[var(--emerald-accent)] to-[var(--violet-accent)] p-1 shadow-2xl shadow-primary/30">
              <div className="w-full h-full rounded-xl bg-background/90 flex items-center justify-center">
                <Image 
                  src="/favicon.ico" 
                  alt="CanvasIQ" 
                  width={48} 
                  height={48}
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-up animate-delay-200">
            <span className="text-foreground">Canvas</span>
            <span className="gradient-text">IQ</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4 animate-fade-up animate-delay-300">
            Build Your <span className="text-foreground font-medium">AI Strategy</span> with Confidence
          </p>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up animate-delay-300">
            Capture use cases, compute ROI, select your portfolio, and generate 
            a strategic roadmap—all guided by an intelligent AI consultant.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up animate-delay-400">
            <Link href="/interview">
              <Button size="lg" className="gap-2 px-8 h-12 text-base bg-gradient-to-r from-[var(--electric)] to-[var(--emerald-accent)] hover:opacity-90 transition-opacity">
                Start Building
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="gap-2 px-8 h-12 text-base">
                View Dashboard
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto mt-16 animate-fade-up animate-delay-500">
            <div>
              <div className="text-3xl font-bold gradient-text">5+</div>
              <div className="text-sm text-muted-foreground">Use Cases</div>
            </div>
            <div>
              <div className="text-3xl font-bold gradient-text">4</div>
              <div className="text-sm text-muted-foreground">ROI Metrics</div>
            </div>
            <div>
              <div className="text-3xl font-bold gradient-text">3</div>
              <div className="text-sm text-muted-foreground">Export Formats</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Complete AI Strategy Toolkit
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to plan, prioritize, and execute your AI initiatives.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.title} 
                  className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Why Use <span className="text-foreground">Canvas</span><span className="gradient-text">IQ</span>?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Transform your AI strategy from wishful thinking to data-driven 
                execution with our comprehensive planning framework.
              </p>

              <div className="space-y-6">
                {benefits.map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={benefit.title} className="flex gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{benefit.title}</h3>
                        <p className="text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Canvas Preview */}
            <div className="relative">
              <div className="glass rounded-2xl p-6 border border-primary/20">
                <div className="flex items-center gap-2 mb-4">
                  <Image 
                    src="/favicon.ico" 
                    alt="CanvasIQ" 
                    width={20} 
                    height={20}
                    className="object-contain"
                  />
                  <span className="text-sm font-medium">CanvasIQ Output</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/10 rounded-lg p-4">
                    <div className="text-xs text-muted-foreground mb-1">Portfolio ROI</div>
                    <div className="text-2xl font-bold text-primary">+127%</div>
                  </div>
                  <div className="bg-accent/10 rounded-lg p-4">
                    <div className="text-xs text-muted-foreground mb-1">Payback</div>
                    <div className="text-2xl font-bold text-accent">8.5 mo</div>
                  </div>
                  <div className="col-span-2 bg-muted/50 rounded-lg p-4">
                    <div className="text-xs text-muted-foreground mb-2">Timeline</div>
                    <div className="flex gap-2">
                      <div className="flex-1 h-2 rounded-full bg-blue-500/60" />
                      <div className="flex-1 h-2 rounded-full bg-emerald-500/60" />
                      <div className="flex-1 h-2 rounded-full bg-violet-500/60" />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Q1</span>
                      <span>1 Year</span>
                      <span>3 Year</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border/50 text-center text-sm text-muted-foreground">
                  AI ROI & Roadmap Canvas v1.0
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-[var(--electric)] to-transparent opacity-20 rounded-full blur-3xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-[var(--emerald-accent)] to-transparent opacity-20 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Build Your AI Strategy?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Start the guided interview process and generate your 
                AI ROI & Roadmap Canvas in minutes.
              </p>
              <Link href="/interview">
                <Button size="lg" className="gap-2 px-8 h-12 text-base bg-gradient-to-r from-[var(--electric)] to-[var(--emerald-accent)] hover:opacity-90 transition-opacity">
                  Begin Interview
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/50">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <Image 
              src="/favicon.ico" 
              alt="CanvasIQ" 
              width={16} 
              height={16}
              className="object-contain opacity-60"
            />
            <span><strong className="text-foreground">CanvasIQ</strong> — AI ROI & Strategic Roadmap Planning</span>
          </p>
        </div>
      </footer>
    </main>
  );
}
