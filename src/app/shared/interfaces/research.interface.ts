// ===============================
// INTERFACES Y MODELOS
// ===============================

// interfaces/research.interface.ts
export interface SoilAnalysis {
  id: string;
  plotId: string;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  organicMatter: number;
  moisture: number;
  temperature: number;
  conductivity: number;
  analysisDate: Date;
  recommendations: string[];
}

export interface CropPrediction {
  id: string;
  plotId: string;
  cropType: string;
  predictedYield: number;
  confidenceLevel: number;
  factors: PredictionFactor[];
  predictionDate: Date;
  harvestDate: Date;
  weatherFactors: WeatherFactor[];
}

export interface PredictionFactor {
  name: string;
  impact: number; // -100 to 100
  description: string;
}

export interface WeatherFactor {
  parameter: string;
  currentValue: number;
  optimalRange: [number, number];
  impact: 'positive' | 'negative' | 'neutral';
}

export interface OptimizationSuggestion {
  id: string;
  type: 'irrigation' | 'fertilization' | 'pest-control' | 'harvesting';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedImprovement: number;
  cost: number;
  implementationTime: number; // días
  affectedPlots: string[];
}

export interface SustainabilityMetric {
  id: string;
  metric: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
  recommendations: string[];
}

export interface ResearchReport {
  id: string;
  title: string;
  type: 'soil-analysis' | 'yield-prediction' | 'optimization' | 'sustainability';
  generatedDate: Date;
  plotIds: string[];
  summary: string;
  data: any;
  charts: ChartData[];
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'scatter';
  title: string;
  data: any[];
  labels: string[];
  colors?: string[];
}

export interface AIRecommendation {
  id: string;
  category: string;
  recommendation: string;
  confidence: number;
  impact: number;
  priority: number;
  implementationSteps: string[];
  expectedResults: string[];
}
