// Export utilities for Canvas generation
import { AIROICanvas, AIUseCase } from './canvas-schema';
import { calculatePortfolioMetrics, formatCurrency, formatPercent } from './calculations';

/**
 * Generate canvas data from use cases and context
 */
export function generateCanvasFromData(
  useCases: AIUseCase[],
  companyName: string,
  industry: string,
  designedBy: string = 'AI ROI Canvas Agent'
): AIROICanvas {
  const selectedUseCases = useCases.filter(uc => uc.selected);
  const metrics = calculatePortfolioMetrics(useCases);
  
  // Aggregate data from use cases
  const allKPIs = [...new Set(selectedUseCases.flatMap(uc => uc.kpis))];
  const allSoftBenefits = [...new Set(selectedUseCases.flatMap(uc => uc.softBenefits))];
  const allDependencies = [...new Set(selectedUseCases.flatMap(uc => uc.dependencies))];
  
  // Group by timeframe
  const q1Cases = selectedUseCases.filter(uc => uc.timeframe === 'Q1');
  const yearCases = selectedUseCases.filter(uc => uc.timeframe === '1-Year');
  const threeYearCases = selectedUseCases.filter(uc => uc.timeframe === '3-Year');
  
  const today = new Date();
  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  
  return {
    header: {
      canvasTitle: 'AI ROI & Roadmap Canvas',
      name: `${companyName} AI Strategy`,
      designedBy,
      designedFor: companyName,
      date: formatDate(today),
      version: '1.0',
    },
    objectives: {
      primaryGoal: `Transform ${companyName} operations through strategic AI adoption`,
      strategicFocus: [
        'Automate repetitive processes',
        'Enhance decision-making with data insights',
        'Improve customer experience',
        ...allKPIs.slice(0, 3),
      ],
    },
    inputs: {
      resources: [
        'AI/ML development platform',
        'Cloud infrastructure',
        'Data storage and processing',
        ...allDependencies.filter(d => d.toLowerCase().includes('data') || d.toLowerCase().includes('platform')),
      ],
      personnel: [
        'AI/ML Engineers',
        'Data Scientists',
        'Project Managers',
        'Business Analysts',
      ],
      externalSupport: [
        'AI consulting partners',
        'Cloud service providers',
        'Training and certification programs',
      ],
    },
    impacts: {
      hardBenefits: selectedUseCases.map(uc => 
        `${uc.name}: ${formatCurrency(uc.hardBenefits)}/year`
      ),
      softBenefits: allSoftBenefits,
    },
    timeline: [
      ...q1Cases.map(uc => ({
        aiInitiative: uc.name,
        startDate: formatDate(today),
        endDate: formatDate(new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)),
        milestones: [
          { name: 'Kickoff', date: formatDate(today), description: 'Project initiation' },
          { name: 'MVP', date: formatDate(new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000)), description: 'Minimum viable product' },
          { name: 'Go-Live', date: formatDate(new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)), description: 'Production deployment' },
        ],
        timeframe: 'Q1' as const,
      })),
      ...yearCases.map(uc => ({
        aiInitiative: uc.name,
        startDate: formatDate(new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)),
        endDate: formatDate(new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000)),
        milestones: [
          { name: 'Planning', date: formatDate(new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)), description: 'Detailed planning' },
          { name: 'Development', date: formatDate(new Date(today.getTime() + 200 * 24 * 60 * 60 * 1000)), description: 'Core development' },
          { name: 'Launch', date: formatDate(new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000)), description: 'Full launch' },
        ],
        timeframe: '1-Year' as const,
      })),
      ...threeYearCases.map(uc => ({
        aiInitiative: uc.name,
        startDate: formatDate(new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000)),
        endDate: formatDate(new Date(today.getTime() + 1095 * 24 * 60 * 60 * 1000)),
        milestones: [
          { name: 'Foundation', date: formatDate(new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000)), description: 'Build foundation' },
          { name: 'Scale', date: formatDate(new Date(today.getTime() + 730 * 24 * 60 * 60 * 1000)), description: 'Scale operations' },
          { name: 'Optimize', date: formatDate(new Date(today.getTime() + 1095 * 24 * 60 * 60 * 1000)), description: 'Full optimization' },
        ],
        timeframe: '3-Year' as const,
      })),
    ],
    risks: selectedUseCases
      .filter(uc => uc.riskLevel !== 'Low')
      .map(uc => ({
        name: `${uc.name} Implementation Risk`,
        likelihood: uc.riskLevel === 'High' ? 'High' as const : 'Medium' as const,
        impact: 'Medium' as const,
        mitigation: `Phased rollout, pilot testing, and change management for ${uc.name}`,
      })),
    capabilities: {
      skillsNeeded: [
        'Machine Learning',
        'Natural Language Processing',
        'Computer Vision',
        'Data Engineering',
        'Cloud Architecture',
        'MLOps',
      ],
      technology: [
        'Python/TensorFlow/PyTorch',
        'Cloud AI Services (AWS/Azure/GCP)',
        'Data Pipeline Tools',
        'Model Monitoring Systems',
        'API Development',
      ],
    },
    costs: {
      nearTerm: q1Cases.reduce((sum, uc) => sum + uc.implementationCost, 0),
      longTerm: yearCases.reduce((sum, uc) => sum + uc.implementationCost, 0) + 
                threeYearCases.reduce((sum, uc) => sum + uc.implementationCost, 0),
      annualMaintenance: selectedUseCases.reduce((sum, uc) => sum + uc.annualCost, 0),
    },
    benefits: {
      nearTerm: q1Cases.reduce((sum, uc) => sum + uc.hardBenefits, 0),
      longTerm: yearCases.reduce((sum, uc) => sum + uc.hardBenefits, 0) + 
                threeYearCases.reduce((sum, uc) => sum + uc.hardBenefits, 0),
      softBenefits: allSoftBenefits,
    },
    portfolioROI: {
      nearTermROIPercent: metrics.nearTermROI,
      longTermROIPercent: metrics.longTermROI,
      portfolioNote: `Portfolio of ${selectedUseCases.length} AI initiatives with total NPV of ${formatCurrency(metrics.portfolioNPV)} and average payback of ${metrics.averagePayback.toFixed(1)} months.`,
    },
    footer: {
      creditLine: `Generated by AI ROI Canvas Agent | ${formatDate(today)}`,
    },
  };
}

/**
 * Export canvas as JSON
 */
export function exportToJSON(canvas: AIROICanvas): string {
  return JSON.stringify(canvas, null, 2);
}

/**
 * Export canvas as Markdown
 */
export function exportToMarkdown(canvas: AIROICanvas): string {
  const md = `# ${canvas.header.canvasTitle}

## Header
- **Name:** ${canvas.header.name}
- **Designed By:** ${canvas.header.designedBy}
- **Designed For:** ${canvas.header.designedFor}
- **Date:** ${canvas.header.date}
- **Version:** ${canvas.header.version}

---

## Objectives

### Primary Goal
${canvas.objectives.primaryGoal}

### Strategic Focus
${canvas.objectives.strategicFocus.map(s => `- ${s}`).join('\n')}

---

## Inputs

### Resources
${canvas.inputs.resources.map(r => `- ${r}`).join('\n')}

### Personnel
${canvas.inputs.personnel.map(p => `- ${p}`).join('\n')}

### External Support
${canvas.inputs.externalSupport.map(e => `- ${e}`).join('\n')}

---

## Impacts

### Hard Benefits
${canvas.impacts.hardBenefits.map(b => `- ${b}`).join('\n')}

### Soft Benefits
${canvas.impacts.softBenefits.map(b => `- ${b}`).join('\n')}

---

## Timeline

${canvas.timeline.map(t => `### ${t.aiInitiative} (${t.timeframe})
- **Start:** ${t.startDate}
- **End:** ${t.endDate}
- **Milestones:**
${t.milestones.map(m => `  - ${m.name} (${m.date}): ${m.description}`).join('\n')}
`).join('\n')}

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
${canvas.risks.map(r => `| ${r.name} | ${r.likelihood} | ${r.impact} | ${r.mitigation} |`).join('\n')}

---

## Capabilities

### Skills Needed
${canvas.capabilities.skillsNeeded.map(s => `- ${s}`).join('\n')}

### Technology
${canvas.capabilities.technology.map(t => `- ${t}`).join('\n')}

---

## Costs

| Category | Amount |
|----------|--------|
| Near-Term Investment | ${formatCurrency(canvas.costs.nearTerm)} |
| Long-Term Investment | ${formatCurrency(canvas.costs.longTerm)} |
| Annual Maintenance | ${formatCurrency(canvas.costs.annualMaintenance)} |

---

## Benefits

| Category | Amount |
|----------|--------|
| Near-Term Benefits | ${formatCurrency(canvas.benefits.nearTerm)}/year |
| Long-Term Benefits | ${formatCurrency(canvas.benefits.longTerm)}/year |

### Soft Benefits
${canvas.benefits.softBenefits.map(b => `- ${b}`).join('\n')}

---

## Portfolio ROI

- **Near-Term ROI:** ${formatPercent(canvas.portfolioROI.nearTermROIPercent)}
- **Long-Term ROI:** ${formatPercent(canvas.portfolioROI.longTermROIPercent)}

${canvas.portfolioROI.portfolioNote}

---

*${canvas.footer.creditLine}*
`;

  return md;
}

/**
 * Download helper function
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

