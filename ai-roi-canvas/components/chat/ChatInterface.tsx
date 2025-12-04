'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useCanvasStore } from '@/store/canvas-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Send, 
  Loader2, 
  Bot, 
  User, 
  Sparkles,
  ArrowRight,
  Save
} from 'lucide-react';

const phaseLabels: Record<string, string> = {
  'welcome': 'Welcome',
  'company-context': 'Company Context',
  'use-case-capture': 'Use Case Capture',
  'roi-review': 'ROI Review',
  'portfolio-selection': 'Portfolio Selection',
  'roadmap-generation': 'Roadmap Generation',
  'canvas-export': 'Canvas Export',
  'complete': 'Complete',
};

const phaseProgress: Record<string, number> = {
  'welcome': 0,
  'company-context': 15,
  'use-case-capture': 30,
  'roi-review': 50,
  'portfolio-selection': 65,
  'roadmap-generation': 80,
  'canvas-export': 95,
  'complete': 100,
};

// Markdown components for styling
const markdownComponents = {
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="mb-2 last:mb-0">{children}</p>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="ml-2">{children}</li>
  ),
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }: { children: React.ReactNode }) => (
    <em className="italic">{children}</em>
  ),
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="text-lg font-bold mb-2 mt-3">{children}</h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-base font-bold mb-2 mt-3">{children}</h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-sm font-bold mb-1 mt-2">{children}</h3>
  ),
  code: ({ children, className }: { children: React.ReactNode; className?: string }) => {
    const isInline = !className;
    if (isInline) {
      return <code className="bg-muted px-1 py-0.5 rounded text-xs">{children}</code>;
    }
    return (
      <pre className="bg-muted p-2 rounded-md overflow-x-auto my-2">
        <code className="text-xs">{children}</code>
      </pre>
    );
  },
  table: ({ children }: { children: React.ReactNode }) => (
    <div className="overflow-x-auto my-2">
      <table className="min-w-full text-xs border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }: { children: React.ReactNode }) => (
    <th className="border border-border px-2 py-1 bg-muted font-semibold text-left">{children}</th>
  ),
  td: ({ children }: { children: React.ReactNode }) => (
    <td className="border border-border px-2 py-1">{children}</td>
  ),
};

export function ChatInterface() {
  const [input, setInput] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initialMessageSent = useRef(false);
  
  const { 
    messages, 
    addMessage, 
    currentPhase, 
    setCurrentPhase,
    isLoading, 
    setIsLoading,
    companyName,
    industry,
    budgetConstraint,
    useCases,
    setCompanyContext,
    setUseCases,
  } = useCanvasStore();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Send initial welcome message - only once
  useEffect(() => {
    if (messages.length === 0 && !initialMessageSent.current && !isLoading) {
      initialMessageSent.current = true;
      sendMessage('', true);
    }
  }, [messages.length, isLoading]);

  // Extract structured data from AI response (JSON blocks)
  const extractDataFromResponse = useCallback((aiContent: string, userMessage: string) => {
    // First, try to extract JSON blocks from AI response
    const jsonBlockRegex = /```json\s*([\s\S]*?)```/g;
    let match;
    let jsonExtractedCompany = false;
    let jsonExtractedUseCases = false;
    const aggregatedNewUseCases: Array<{
      id: string;
      name: string;
      problemStatement: string;
      kpis: string[];
      hardBenefits: number;
      softBenefits: string[];
      implementationCost: number;
      annualCost: number;
      effortScore: 1|2|3|4|5;
      impactScore: 1|2|3|4|5;
      riskLevel: 'Low'|'Medium'|'High';
      dependencies: string[];
      timeframe: 'Q1'|'1-Year'|'3-Year';
      selected: boolean;
    }> = [];
    
    while ((match = jsonBlockRegex.exec(aiContent)) !== null) {
      try {
        const jsonData = JSON.parse(match[1].trim());
        
        // Handle company context from JSON
        if (jsonData.company) {
          const { name, industry: ind, budget } = jsonData.company;
          if (name || ind || budget) {
            setCompanyContext(
              name || companyName,
              ind || industry,
              budget || budgetConstraint
            );
            jsonExtractedCompany = true;
          }
        }
        
        // Handle use cases array from JSON
        if (jsonData.useCases && Array.isArray(jsonData.useCases)) {
          const newUseCases = jsonData.useCases.map((uc: {
            name?: string;
            problemStatement?: string;
            kpis?: string[];
            hardBenefits?: number;
            softBenefits?: string[];
            implementationCost?: number;
            annualCost?: number;
            effortScore?: number;
            impactScore?: number;
            riskLevel?: string;
            dependencies?: string[];
            timeframe?: string;
          }, index: number) => {
            // Clamp effort and impact scores to valid range
            let effort = Math.min(5, Math.max(1, uc.effortScore || 3)) as 1|2|3|4|5;
            let impact = Math.min(5, Math.max(1, uc.impactScore || 3)) as 1|2|3|4|5;
            
            // Validate risk level
            const validRisks = ['Low', 'Medium', 'High'];
            let risk: 'Low'|'Medium'|'High' = 'Medium';
            if (uc.riskLevel && validRisks.includes(uc.riskLevel)) {
              risk = uc.riskLevel as 'Low'|'Medium'|'High';
            }
            
            // Validate timeframe
            const validTimeframes = ['Q1', '1-Year', '3-Year'];
            let timeframe: 'Q1'|'1-Year'|'3-Year' = '1-Year';
            if (uc.timeframe && validTimeframes.includes(uc.timeframe)) {
              timeframe = uc.timeframe as 'Q1'|'1-Year'|'3-Year';
            }
            
            return {
              id: `uc-${Date.now()}-${index}`,
              name: uc.name || 'Unnamed Use Case',
              problemStatement: uc.problemStatement || '',
              kpis: uc.kpis || [],
              hardBenefits: uc.hardBenefits || 0,
              softBenefits: uc.softBenefits || [],
              implementationCost: uc.implementationCost || 0,
              annualCost: uc.annualCost || 0,
              effortScore: effort,
              impactScore: impact,
              riskLevel: risk,
              dependencies: uc.dependencies || [],
              timeframe: timeframe,
              selected: true,
            };
          });
          
          aggregatedNewUseCases.push(...newUseCases);
          jsonExtractedUseCases = true;
        }
      } catch (e) {
        // JSON parsing failed, will use fallback extraction
        console.log('JSON parsing failed:', e);
      }
    }

    // Fallback: if no fenced JSON blocks, try to parse inline JSON containing "useCases"
    if (!jsonExtractedUseCases) {
      const inlineJsonRegex = /\{[\s\S]*?"useCases"\s*:\s*\[[\s\S]*?\}\s*\}/g;
      const inlineMatches = aiContent.match(inlineJsonRegex) || [];

      inlineMatches.forEach((block) => {
        try {
          const jsonData = JSON.parse(block);
          if (jsonData.useCases && Array.isArray(jsonData.useCases)) {
            const newUseCases = jsonData.useCases.map((uc: {
              name?: string;
              problemStatement?: string;
              kpis?: string[];
              hardBenefits?: number;
              softBenefits?: string[];
              implementationCost?: number;
              annualCost?: number;
              effortScore?: number;
              impactScore?: number;
              riskLevel?: string;
              dependencies?: string[];
              timeframe?: string;
            }, index: number) => {
              let effort = Math.min(5, Math.max(1, uc.effortScore || 3)) as 1|2|3|4|5;
              let impact = Math.min(5, Math.max(1, uc.impactScore || 3)) as 1|2|3|4|5;
              
              const validRisks = ['Low', 'Medium', 'High'];
              const normalizedRisk = (uc.riskLevel || '').toLowerCase().replace(/[^a-z]/g, '');
              const riskMap: Record<string, 'Low'|'Medium'|'High'> = {
                low: 'Low',
                medium: 'Medium',
                high: 'High',
                lowmedium: 'Medium',
                mediumlow: 'Medium',
                mediumhigh: 'Medium',
                highmedium: 'Medium',
              };
              let risk: 'Low'|'Medium'|'High' = riskMap[normalizedRisk] || 'Medium';
              if (!validRisks.includes(risk)) risk = 'Medium';
              
              const validTimeframes = ['Q1', '1-Year', '3-Year'];
              let timeframe: 'Q1'|'1-Year'|'3-Year' = '1-Year';
              if (uc.timeframe && validTimeframes.includes(uc.timeframe)) {
                timeframe = uc.timeframe as 'Q1'|'1-Year'|'3-Year';
              }

              return {
                id: `uc-${Date.now()}-${index}`,
                name: uc.name || 'Unnamed Use Case',
                problemStatement: uc.problemStatement || '',
                kpis: uc.kpis || [],
                hardBenefits: uc.hardBenefits || 0,
                softBenefits: uc.softBenefits || [],
                implementationCost: uc.implementationCost || 0,
                annualCost: uc.annualCost || 0,
                effortScore: effort,
                impactScore: impact,
                riskLevel: risk,
                dependencies: uc.dependencies || [],
                timeframe: timeframe,
                selected: true,
              };
            });

            aggregatedNewUseCases.push(...newUseCases);
          }
        } catch (e) {
          console.log('Inline JSON parsing failed:', e);
        }
      });
    }
    
    // Fallback: Extract company context from user message (only if JSON extraction didn't find it)
    // Note: This is a backup - the AI should output JSON blocks for reliable extraction
    if (!jsonExtractedCompany && !companyName) {
      // More precise regex patterns with word boundaries
      const companyMatch = userMessage.match(/(?:I'm|I am|we're|we are)\s+(?:the\s+)?(?:CTO|CEO|VP|Director|Manager|Head)?\s*(?:at|of|for)\s+([A-Za-z0-9\s]+?)(?:,|\.|\s+a\s|\s+in\s)/i);
      // Look for explicit industry mentions only
      const industryMatch = userMessage.match(/\b(?:in the|industry[:\s]+|sector[:\s]+)\s*([A-Za-z][A-Za-z\s]{2,}?)(?:\s+industry|\s+sector|\s+space|\.|\,)/i);
      const budgetMatch = userMessage.match(/budget[^\d]*\$?([\d,.]+)\s*(million|m|k|thousand)?/i);
      
      let name = companyMatch ? companyMatch[1].trim() : '';
      let ind = industryMatch ? industryMatch[1].trim() : '';
      
      // Sanity check - industry should be at least 3 characters and not be a common word
      if (ind && (ind.length < 3 || ['the', 'a', 'an', 'and', 'or'].includes(ind.toLowerCase()))) {
        ind = '';
      }
      
      let budget = budgetConstraint;
      if (budgetMatch) {
        budget = parseFloat(budgetMatch[1].replace(/,/g, ''));
        const multiplier = budgetMatch[2]?.toLowerCase();
        if (multiplier === 'million' || multiplier === 'm') budget *= 1000000;
        else if (multiplier === 'thousand' || multiplier === 'k') budget *= 1000;
      }
      
      if (name || (ind && ind.length >= 3) || budgetMatch) {
        setCompanyContext(name || companyName, ind || industry, budget);
      }
    }

    // After processing all blocks, merge use cases once using latest state
    if (aggregatedNewUseCases.length > 0) {
      setUseCases((prev) => {
        const existingNames = new Set(prev.map(u => u.name.toLowerCase()));
        const deduped = aggregatedNewUseCases.filter(
          (uc) => !existingNames.has(uc.name.toLowerCase())
        );
        return deduped.length > 0 ? [...prev, ...deduped] : prev;
      });
    }
  }, [companyName, industry, budgetConstraint, useCases, setCompanyContext, setUseCases]);

  const sendMessage = async (userMessage: string, isInitial = false) => {
    if (!isInitial && !userMessage.trim()) return;
    
    // Add user message if not initial
    if (!isInitial && userMessage.trim()) {
      addMessage({ role: 'user', content: userMessage.trim() });
    }
    
    setIsLoading(true);
    setStreamingContent('');
    
    try {
      // Prepare messages for API
      const apiMessages = isInitial 
        ? [] 
        : [...messages, { role: 'user', content: userMessage.trim() }]
            .filter(m => m.role !== 'system')
            .map(m => ({ role: m.role, content: m.content }));
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          phase: currentPhase,
          context: {
            companyName,
            industry,
            useCaseCount: useCases.length,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullContent += parsed.content;
                  setStreamingContent(fullContent);
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
      }

      // Add completed message
      if (fullContent) {
        addMessage({ role: 'assistant', content: fullContent });
        setStreamingContent('');
        
        // Extract data from the conversation
        if (!isInitial && userMessage.trim()) {
          extractDataFromResponse(fullContent, userMessage);
        }
        
        // Check for phase transitions based on content
        checkPhaseTransition(fullContent, userMessage);
      }
    } catch (error) {
      console.error('Chat error:', error);
      addMessage({ 
        role: 'assistant', 
        content: `I apologize, but I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please make sure your OpenAI API key is configured correctly.`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkPhaseTransition = (content: string, userMessage: string) => {
    const lowerContent = content.toLowerCase();
    const lowerUser = userMessage.toLowerCase();
    
    // Transition to company-context
    if (currentPhase === 'welcome' && (
      lowerContent.includes('tell me about') ||
      lowerContent.includes('company') ||
      lowerContent.includes('organization') ||
      lowerContent.includes('ready to begin')
    )) {
      setCurrentPhase('company-context');
    }
    
    // Transition to use-case-capture
    if (currentPhase === 'company-context' && (
      lowerUser.includes('use case') ||
      lowerUser.includes('ai initiative') ||
      lowerContent.includes('use cases') ||
      lowerContent.includes('ai projects')
    )) {
      setCurrentPhase('use-case-capture');
    }
    
    // Transition to roi-review when we have use cases
    if (currentPhase === 'use-case-capture' && useCases.length >= 3 && (
      lowerContent.includes('roi') ||
      lowerContent.includes('return on investment') ||
      lowerContent.includes('calculate')
    )) {
      setCurrentPhase('roi-review');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const advancePhase = () => {
    const phases = Object.keys(phaseLabels);
    const currentIndex = phases.indexOf(currentPhase);
    if (currentIndex < phases.length - 1) {
      const nextPhase = phases[currentIndex + 1];
      setCurrentPhase(nextPhase as typeof currentPhase);
      sendMessage(`Let's move on to ${phaseLabels[nextPhase]}.`);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Phase Progress Bar - Fixed at top */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            <Sparkles className="w-3 h-3 mr-1" />
            {phaseLabels[currentPhase]}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {phaseProgress[currentPhase]}% Complete
          </span>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[var(--electric)] to-[var(--emerald-accent)] transition-all duration-500"
            style={{ width: `${phaseProgress[currentPhase]}%` }}
          />
        </div>
      </div>

      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4 max-w-3xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 animate-message-in",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--electric)] to-[var(--emerald-accent)] flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <Card className={cn(
                  "px-4 py-3 max-w-[85%]",
                  message.role === 'user' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-card border-border/50"
                )}>
                  {message.role === 'user' ? (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>
                  ) : (
                    <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </Card>
                
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
            
            {/* Streaming message */}
            {streamingContent && (
              <div className="flex gap-3 animate-message-in">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--electric)] to-[var(--emerald-accent)] flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <Card className="px-4 py-3 max-w-[85%] bg-card border-border/50">
                  <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={markdownComponents}
                    >
                      {streamingContent}
                    </ReactMarkdown>
                    <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse ml-1" />
                  </div>
                </Card>
              </div>
            )}
            
            {/* Loading indicator */}
            {isLoading && !streamingContent && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--electric)] to-[var(--emerald-accent)] flex items-center justify-center flex-shrink-0 pulse-glow">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <Card className="px-4 py-3 bg-card border-border/50">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </Card>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="flex-shrink-0 p-4 border-t border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="min-h-[52px] max-h-[200px] resize-none bg-background/50"
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button 
                type="submit" 
                size="icon"
                disabled={isLoading || !input.trim()}
                className="h-[52px] w-[52px] bg-gradient-to-r from-[var(--electric)] to-[var(--emerald-accent)] hover:opacity-90"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </form>
          
          {/* Quick actions */}
          <div className="mt-3 flex justify-between items-center">
            {useCases.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                <Save className="w-3 h-3 mr-1" />
                {useCases.length} use case{useCases.length !== 1 ? 's' : ''} captured
              </Badge>
            )}
            {currentPhase !== 'complete' && !isLoading && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={advancePhase}
                className="text-muted-foreground hover:text-foreground ml-auto"
              >
                Skip to next phase
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
