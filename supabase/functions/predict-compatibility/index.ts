import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Allowed excipients whitelist
const ALLOWED_EXCIPIENTS = [
  'Lactose Monohydrate',
  'Magnesium Stearate',
  'Microcrystalline Cellulose'
] as const;

// SMILES code validation pattern (valid chemical notation characters)
const SMILES_PATTERN = /^[A-Za-z0-9@+\-\[\]()=#\/\\%.]+$/;

// Input length limits
const MAX_DRUG_NAME_LENGTH = 200;
const MAX_SMILES_LENGTH = 500;

interface PredictionRequest {
  drugName: string;
  smilesCode: string;
  excipient: typeof ALLOWED_EXCIPIENTS[number];
}

interface PredictionResponse {
  compatibility_status: 'Compatible' | 'Non-Compatible';
  probability_score: number;
  confidence_level: 'High' | 'Medium' | 'Low';
  analysis_summary: string[];
}

// Safe error messages mapping - prevents exposing implementation details
const SAFE_ERROR_MESSAGES: Record<string, { message: string; status: number }> = {
  'validation': { message: 'Invalid request format', status: 400 },
  'method': { message: 'Method not allowed', status: 405 },
  'parse': { message: 'Invalid request body', status: 400 },
  'default': { message: 'Unable to process prediction request', status: 500 }
};

function getSafeError(errorType: string): { message: string; status: number } {
  return SAFE_ERROR_MESSAGES[errorType] || SAFE_ERROR_MESSAGES.default;
}

// Validate and sanitize input
function validateInput(body: unknown): PredictionRequest {
  if (!body || typeof body !== 'object') {
    throw { type: 'validation', detail: 'Request body must be an object' };
  }

  const data = body as Record<string, unknown>;

  // Validate drugName
  if (typeof data.drugName !== 'string' || data.drugName.trim().length === 0) {
    throw { type: 'validation', detail: 'drugName must be a non-empty string' };
  }
  if (data.drugName.length > MAX_DRUG_NAME_LENGTH) {
    throw { type: 'validation', detail: `drugName exceeds maximum length of ${MAX_DRUG_NAME_LENGTH}` };
  }

  // Validate smilesCode
  if (typeof data.smilesCode !== 'string' || data.smilesCode.trim().length === 0) {
    throw { type: 'validation', detail: 'smilesCode must be a non-empty string' };
  }
  if (data.smilesCode.length > MAX_SMILES_LENGTH) {
    throw { type: 'validation', detail: `smilesCode exceeds maximum length of ${MAX_SMILES_LENGTH}` };
  }
  if (!SMILES_PATTERN.test(data.smilesCode)) {
    throw { type: 'validation', detail: 'smilesCode contains invalid characters' };
  }

  // Validate excipient against whitelist
  if (typeof data.excipient !== 'string') {
    throw { type: 'validation', detail: 'excipient must be a string' };
  }
  if (!ALLOWED_EXCIPIENTS.includes(data.excipient as typeof ALLOWED_EXCIPIENTS[number])) {
    throw { type: 'validation', detail: 'excipient must be one of the allowed values' };
  }

  return {
    drugName: data.drugName.trim(),
    smilesCode: data.smilesCode.trim(),
    excipient: data.excipient as typeof ALLOWED_EXCIPIENTS[number]
  };
}

// Mock prediction logic - structured for easy ML model integration
function predictCompatibility(request: PredictionRequest): PredictionResponse {
  console.log(`Processing prediction request for drug: ${request.drugName}`);

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

  console.log(`Prediction completed: ${isCompatible ? 'Compatible' : 'Non-Compatible'}`);

  return {
    compatibility_status: isCompatible ? 'Compatible' : 'Non-Compatible',
    probability_score: Math.round(probabilityScore * 1000) / 10,
    confidence_level: confidenceLevel,
    analysis_summary: analysisSummary,
  };
}

function detectReactiveGroups(smiles: string): boolean {
  const reactivePatterns = ['CHO', 'NH2', 'COOH', 'C=O'];
  return reactivePatterns.some(pattern => smiles.toUpperCase().includes(pattern));
}

function getExcipientRiskProfile(excipient: string): 'low' | 'medium' | 'high' {
  const riskProfiles: Record<string, 'low' | 'medium' | 'high'> = {
    'Lactose Monohydrate': 'medium',
    'Magnesium Stearate': 'low',
    'Microcrystalline Cellulose': 'low',
  };
  return riskProfiles[excipient] || 'medium';
}

function calculateStabilityScore(smiles: string, excipient: string): number {
  let score = 0.8;
  
  if (detectReactiveGroups(smiles)) {
    score -= 0.15;
  }
  
  if (excipient === 'Lactose Monohydrate' && smiles.includes('N')) {
    score -= 0.2;
  }
  
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
      throw { type: 'method', detail: 'Only POST method is allowed' };
    }

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      throw { type: 'parse', detail: 'Failed to parse JSON body' };
    }

    // Validate and sanitize input
    const validatedInput = validateInput(rawBody);
    
    console.log('Validated input, processing prediction...');
    
    // Simulate some processing time (200-500ms)
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
    
    const prediction = predictCompatibility(validatedInput);

    return new Response(
      JSON.stringify(prediction),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: unknown) {
    // Log full error details server-side for debugging
    console.error('Error processing request:', error);
    
    // Return safe, sanitized error message to client
    const errorInfo = typeof error === 'object' && error !== null && 'type' in error
      ? getSafeError((error as { type: string }).type)
      : getSafeError('default');
    
    return new Response(
      JSON.stringify({ error: errorInfo.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: errorInfo.status,
      }
    );
  }
});
