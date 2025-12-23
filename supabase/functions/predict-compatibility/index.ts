import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PredictionRequest {
  drugName: string;
  smilesCode: string;
  excipient: string;
}

interface PredictionResponse {
  compatibility_status: 'Compatible' | 'Non-Compatible';
  probability_score: number;
  confidence_level: 'High' | 'Medium' | 'Low';
  analysis_summary: string[];
}

// Mock prediction logic - structured for easy ML model integration
function predictCompatibility(request: PredictionRequest): PredictionResponse {
  console.log(`Processing prediction request for drug: ${request.drugName}`);
  console.log(`SMILES: ${request.smilesCode}`);
  console.log(`Excipient: ${request.excipient}`);

  // Simulate processing delay
  const hasReactiveGroups = detectReactiveGroups(request.smilesCode);
  const excipientRisk = getExcipientRiskProfile(request.excipient);
  const stabilityScore = calculateStabilityScore(request.smilesCode, request.excipient);

  // Rule-based compatibility prediction (placeholder for ML model)
  const isCompatible = stabilityScore > 0.6 && excipientRisk !== 'high';
  const probabilityScore = isCompatible 
    ? 0.75 + Math.random() * 0.2  // 75-95% for compatible
    : 0.15 + Math.random() * 0.3; // 15-45% for incompatible

  const confidenceLevel = probabilityScore > 0.85 ? 'High' : probabilityScore > 0.6 ? 'Medium' : 'Low';

  const analysisSummary = generateAnalysisSummary(
    request.drugName,
    request.excipient,
    hasReactiveGroups,
    isCompatible,
    stabilityScore
  );

  console.log(`Prediction result: ${isCompatible ? 'Compatible' : 'Non-Compatible'}`);
  console.log(`Probability: ${(probabilityScore * 100).toFixed(1)}%`);

  return {
    compatibility_status: isCompatible ? 'Compatible' : 'Non-Compatible',
    probability_score: Math.round(probabilityScore * 1000) / 10, // e.g., 92.4%
    confidence_level: confidenceLevel,
    analysis_summary: analysisSummary,
  };
}

function detectReactiveGroups(smiles: string): boolean {
  // Simplified detection of reactive functional groups
  const reactivePatterns = ['CHO', 'NH2', 'COOH', 'C=O'];
  return reactivePatterns.some(pattern => smiles.toUpperCase().includes(pattern));
}

function getExcipientRiskProfile(excipient: string): 'low' | 'medium' | 'high' {
  const riskProfiles: Record<string, 'low' | 'medium' | 'high'> = {
    'Lactose Monohydrate': 'medium', // Can cause Maillard reaction with amines
    'Magnesium Stearate': 'low',
    'Microcrystalline Cellulose': 'low',
  };
  return riskProfiles[excipient] || 'medium';
}

function calculateStabilityScore(smiles: string, excipient: string): number {
  // Simulated stability calculation
  let score = 0.8;
  
  // Reduce score for reactive groups
  if (detectReactiveGroups(smiles)) {
    score -= 0.15;
  }
  
  // Adjust based on excipient
  if (excipient === 'Lactose Monohydrate' && smiles.includes('N')) {
    score -= 0.2; // Potential Maillard reaction
  }
  
  // Add some controlled randomness for demo purposes
  score += (Math.random() - 0.5) * 0.1;
  
  return Math.max(0, Math.min(1, score));
}

function generateAnalysisSummary(
  drugName: string,
  excipient: string,
  hasReactiveGroups: boolean,
  isCompatible: boolean,
  stabilityScore: number
): string[] {
  const summary: string[] = [];
  
  if (isCompatible) {
    if (!hasReactiveGroups) {
      summary.push("No reactive functional groups detected in the API structure.");
    } else {
      summary.push("Reactive functional groups detected but pose minimal risk with selected excipient.");
    }
    summary.push(`${excipient} shows chemical stability with ${drugName}.`);
    summary.push(`Risk level: LOW (Maillard reaction unlikely).`);
    summary.push(`Stability score: ${(stabilityScore * 100).toFixed(0)}% - suitable for formulation development.`);
  } else {
    if (hasReactiveGroups) {
      summary.push("⚠️ Reactive functional groups detected that may interact with excipient.");
    }
    if (excipient === 'Lactose Monohydrate') {
      summary.push(`Potential Maillard reaction risk with ${drugName} and Lactose Monohydrate.`);
    }
    summary.push(`Risk level: HIGH - further stability studies recommended.`);
    summary.push(`Consider alternative excipients such as Microcrystalline Cellulose.`);
  }
  
  summary.push("");
  summary.push("Note: This is a computational screening result. Confirm with experimental stability studies before proceeding with formulation.");
  
  return summary;
}

serve(async (req) => {
  console.log(`Received ${req.method} request`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed. Use POST.');
    }

    const body: PredictionRequest = await req.json();
    
    // Validate input
    if (!body.drugName || !body.smilesCode || !body.excipient) {
      throw new Error('Missing required fields: drugName, smilesCode, or excipient');
    }

    console.log('Validated input, processing prediction...');
    
    // Simulate some processing time (200-500ms)
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
    
    const prediction = predictCompatibility(body);

    return new Response(
      JSON.stringify(prediction),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Error processing request:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
