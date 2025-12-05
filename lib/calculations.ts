// ROI Calculation Engine
import { AIUseCase, ROICalculation } from './canvas-schema';

const DISCOUNT_RATE = 0.10; // 10% for NPV
const PROJECTION_YEARS = 3;
const RISK_MULTIPLIERS = {
  Low: 1.0,
  Medium: 0.8,
  High: 0.6,
};

/**
 * Calculate basic ROI: (Benefit - Cost) / Cost * 100
 */
export function calculateBasicROI(useCase: AIUseCase): number {
  const totalCost = useCase.implementationCost + useCase.annualCost;
  if (totalCost === 0) return 0;
  
  const roi = ((useCase.hardBenefits - totalCost) / totalCost) * 100;
  return Math.round(roi * 100) / 100;
}

/**
 * Calculate Net Present Value at 10% discount rate
 * NPV = Σ (Cash Flow / (1 + r)^t) - Initial Investment
 */
export function calculateNPV(useCase: AIUseCase): number {
  const initialInvestment = useCase.implementationCost;
  const annualBenefit = useCase.hardBenefits;
  const annualCost = useCase.annualCost;
  const annualNetCashFlow = annualBenefit - annualCost;
  
  let npv = -initialInvestment;
  
  for (let year = 1; year <= PROJECTION_YEARS; year++) {
    const discountFactor = Math.pow(1 + DISCOUNT_RATE, year);
    npv += annualNetCashFlow / discountFactor;
  }
  
  return Math.round(npv * 100) / 100;
}

/**
 * Calculate Payback Period in months
 * Simple payback: Initial Investment / Monthly Net Benefit
 */
export function calculatePaybackPeriod(useCase: AIUseCase): number {
  const monthlyBenefit = useCase.hardBenefits / 12;
  const monthlyCost = useCase.annualCost / 12;
  const monthlyNetBenefit = monthlyBenefit - monthlyCost;
  
  if (monthlyNetBenefit <= 0) return Infinity;
  
  const paybackMonths = useCase.implementationCost / monthlyNetBenefit;
  return Math.round(paybackMonths * 10) / 10;
}

/**
 * Calculate Risk-Adjusted Value
 * Value = NPV * Risk Multiplier * (Impact Score / Effort Score)
 */
export function calculateRiskAdjustedValue(useCase: AIUseCase): number {
  const npv = calculateNPV(useCase);
  const riskMultiplier = RISK_MULTIPLIERS[useCase.riskLevel];
  const effortImpactRatio = useCase.impactScore / useCase.effortScore;
  
  const riskAdjustedValue = npv * riskMultiplier * effortImpactRatio;
  return Math.round(riskAdjustedValue * 100) / 100;
}

/**
 * Calculate all ROI metrics for a use case
 */
export function calculateROI(useCase: AIUseCase): ROICalculation {
  return {
    useCaseId: useCase.id,
    basicROI: calculateBasicROI(useCase),
    npv: calculateNPV(useCase),
    paybackPeriod: calculatePaybackPeriod(useCase),
    riskAdjustedValue: calculateRiskAdjustedValue(useCase),
  };
}

/**
 * Calculate portfolio-level metrics for selected use cases
 */
export function calculatePortfolioMetrics(useCases: AIUseCase[]) {
  const selected = useCases.filter(uc => uc.selected);
  
  if (selected.length === 0) {
    return {
      totalImplementationCost: 0,
      totalAnnualCost: 0,
      totalAnnualBenefits: 0,
      portfolioROI: 0,
      portfolioNPV: 0,
      averagePayback: 0,
      nearTermROI: 0,
      longTermROI: 0,
    };
  }
  
  const totalImplementationCost = selected.reduce((sum, uc) => sum + uc.implementationCost, 0);
  const totalAnnualCost = selected.reduce((sum, uc) => sum + uc.annualCost, 0);
  const totalAnnualBenefits = selected.reduce((sum, uc) => sum + uc.hardBenefits, 0);
  
  // Near-term (Q1 + 1-Year) vs Long-term (3-Year)
  const nearTermCases = selected.filter(uc => uc.timeframe === 'Q1' || uc.timeframe === '1-Year');
  const longTermCases = selected.filter(uc => uc.timeframe === '3-Year');
  
  const nearTermCost = nearTermCases.reduce((sum, uc) => sum + uc.implementationCost + uc.annualCost, 0);
  const nearTermBenefit = nearTermCases.reduce((sum, uc) => sum + uc.hardBenefits, 0);
  const nearTermROI = nearTermCost > 0 ? ((nearTermBenefit - nearTermCost) / nearTermCost) * 100 : 0;
  
  const longTermCost = longTermCases.reduce((sum, uc) => sum + uc.implementationCost + uc.annualCost, 0);
  const longTermBenefit = longTermCases.reduce((sum, uc) => sum + uc.hardBenefits, 0);
  const longTermROI = longTermCost > 0 ? ((longTermBenefit - longTermCost) / longTermCost) * 100 : 0;
  
  const totalCost = totalImplementationCost + totalAnnualCost;
  const portfolioROI = totalCost > 0 ? ((totalAnnualBenefits - totalCost) / totalCost) * 100 : 0;
  
  // Sum of individual NPVs
  const portfolioNPV = selected.reduce((sum, uc) => sum + calculateNPV(uc), 0);
  
  // Average payback across selected
  const paybacks = selected.map(uc => calculatePaybackPeriod(uc)).filter(p => p !== Infinity);
  const averagePayback = paybacks.length > 0 
    ? paybacks.reduce((sum, p) => sum + p, 0) / paybacks.length 
    : 0;
  
  return {
    totalImplementationCost: Math.round(totalImplementationCost),
    totalAnnualCost: Math.round(totalAnnualCost),
    totalAnnualBenefits: Math.round(totalAnnualBenefits),
    portfolioROI: Math.round(portfolioROI * 100) / 100,
    portfolioNPV: Math.round(portfolioNPV),
    averagePayback: Math.round(averagePayback * 10) / 10,
    nearTermROI: Math.round(nearTermROI * 100) / 100,
    longTermROI: Math.round(longTermROI * 100) / 100,
  };
}

/**
 * Rank use cases by risk-adjusted value for portfolio selection
 */
export function rankUseCases(useCases: AIUseCase[]): AIUseCase[] {
  const withCalculations = useCases.map(uc => ({
    useCase: uc,
    riskAdjustedValue: calculateRiskAdjustedValue(uc),
  }));
  
  withCalculations.sort((a, b) => b.riskAdjustedValue - a.riskAdjustedValue);
  
  return withCalculations.map(item => item.useCase);
}

/**
 * Auto-select portfolio based on budget constraint
 */
export function selectPortfolioByBudget(
  useCases: AIUseCase[], 
  maxBudget: number
): AIUseCase[] {
  const ranked = rankUseCases(useCases);
  const selected: AIUseCase[] = [];
  let remainingBudget = maxBudget;
  
  for (const useCase of ranked) {
    const cost = useCase.implementationCost;
    if (cost <= remainingBudget) {
      selected.push({ ...useCase, selected: true });
      remainingBudget -= cost;
    } else {
      selected.push({ ...useCase, selected: false });
    }
  }
  
  return selected;
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage for display
 */
export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

