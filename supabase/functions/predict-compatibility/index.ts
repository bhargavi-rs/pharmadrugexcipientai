import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Authentication helper
async function authenticateRequest(req: Request): Promise<{ user: { id: string; email?: string } } | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return null;
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error } = await supabaseClient.auth.getUser();
  if (error || !user) {
    return null;
  }

  return { user: { id: user.id, email: user.email } };
}

// Excipient category map (matching Python model)
const EXCIPIENT_CATEGORY_MAP: Record<string, string> = {
  "lactose": "reducing_sugar",
  "mannitol": "sugar_alcohol",
  "sorbitol": "sugar_alcohol",
  "hpmc": "polymer",
  "hydroxypropyl methylcellulose": "polymer",
  "pvp": "polymer",
  "pvp k30": "polymer",
  "povidone": "polymer",
  "polyvinylpyrrolidone": "polymer",
  "dcp": "inorganic_salt",
  "dicalcium phosphate": "inorganic_salt",
  "sodium bicarbonate": "inorganic_salt",
  "calcium carbonate": "inorganic_salt",
  "mcc": "filler",
  "microcrystalline cellulose": "filler",
  "magnesium stearate": "lubricant",
  "stearic acid": "lubricant",
  "talc": "lubricant",
  "sodium starch glycolate": "disintegrant",
  "starch": "disintegrant",
  "croscarmellose": "disintegrant",
  "crospovidone": "disintegrant",
};

// SMILES code validation pattern
const SMILES_PATTERN = /^[A-Za-z0-9@+\-\[\]()=#\/\\%.]+$/;
const MAX_DRUG_NAME_LENGTH = 200;
const MAX_SMILES_LENGTH = 500;

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

const SAFE_ERROR_MESSAGES: Record<string, { message: string; status: number }> = {
  'validation': { message: 'Invalid request format', status: 400 },
  'method': { message: 'Method not allowed', status: 405 },
  'parse': { message: 'Invalid request body', status: 400 },
  'auth': { message: 'Authentication required', status: 401 },
  'default': { message: 'Unable to process prediction request', status: 500 }
};

function getSafeError(errorType: string): { message: string; status: number } {
  return SAFE_ERROR_MESSAGES[errorType] || SAFE_ERROR_MESSAGES.default;
}

function normalizeText(text: string): string {
  return text.toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function validateInput(body: unknown): PredictionRequest {
  if (!body || typeof body !== 'object') {
    throw { type: 'validation', detail: 'Request body must be an object' };
  }

  const data = body as Record<string, unknown>;

  if (typeof data.drugName !== 'string' || data.drugName.trim().length === 0) {
    throw { type: 'validation', detail: 'drugName must be a non-empty string' };
  }
  if (data.drugName.length > MAX_DRUG_NAME_LENGTH) {
    throw { type: 'validation', detail: `drugName exceeds maximum length of ${MAX_DRUG_NAME_LENGTH}` };
  }

  if (typeof data.smilesCode !== 'string' || data.smilesCode.trim().length === 0) {
    throw { type: 'validation', detail: 'smilesCode must be a non-empty string' };
  }
  if (data.smilesCode.length > MAX_SMILES_LENGTH) {
    throw { type: 'validation', detail: `smilesCode exceeds maximum length of ${MAX_SMILES_LENGTH}` };
  }
  if (!SMILES_PATTERN.test(data.smilesCode)) {
    throw { type: 'validation', detail: 'smilesCode contains invalid characters' };
  }

  if (typeof data.excipient !== 'string' || data.excipient.trim().length === 0) {
    throw { type: 'validation', detail: 'excipient must be a non-empty string' };
  }

  return {
    drugName: data.drugName.trim(),
    smilesCode: data.smilesCode.trim(),
    excipient: data.excipient.trim()
  };
}

// Detect structural flags from SMILES (simplified JS version)
function computeStructuralFlags(smiles: string): Record<string, boolean | number> {
  const smilesLower = smiles.toLowerCase();
  
  return {
    is_salt: smiles.includes('.'),
    contains_cl: smilesLower.includes('[cl') || smilesLower.includes('cl]'),
    contains_na: smilesLower.includes('[na') || smilesLower.includes('na]'),
    contains_k: smilesLower.includes('[k') || smilesLower.includes('k]'),
    contains_ca: smilesLower.includes('[ca') || smilesLower.includes('ca]'),
    contains_br: smilesLower.includes('[br') || smilesLower.includes('br]'),
    has_primary_amine: smilesLower.includes('n') && !smilesLower.includes('n('),
    has_secondary_amine: (smiles.match(/N\(/g) || []).length === 1,
    has_carboxylic_acid: smilesLower.includes('c(=o)o') || smilesLower.includes('c(=o)[o-]') || smiles.includes('COOH'),
    has_phenol: smilesLower.includes('c(o)') || smilesLower.includes('c1ccc(o)'),
    is_aromatic: smiles.includes('c1') || smiles.includes('C1=C'),
    has_aldehyde: smiles.includes('CHO') || smiles.includes('C=O'),
    has_ketone: (smiles.match(/C\(=O\)C/g) || []).length > 0,
    estimated_mw: smiles.length * 8, // Rough estimation
    high_flexibility: (smiles.match(/C/g) || []).length > 15,
    high_mw: smiles.length > 60,
  };
}

// Get excipient category and risk profile
function getExcipientProfile(excipientNorm: string): { category: string; riskLevel: 'low' | 'medium' | 'high' } {
  let category = 'unknown';
  
  for (const [key, cat] of Object.entries(EXCIPIENT_CATEGORY_MAP)) {
    if (excipientNorm.includes(key)) {
      category = cat;
      break;
    }
  }

  const riskLevels: Record<string, 'low' | 'medium' | 'high'> = {
    'reducing_sugar': 'high',
    'sugar_alcohol': 'low',
    'polymer': 'low',
    'inorganic_salt': 'medium',
    'filler': 'low',
    'lubricant': 'low',
    'disintegrant': 'low',
    'unknown': 'medium',
  };

  return {
    category,
    riskLevel: riskLevels[category] || 'medium',
  };
}

// Main prediction logic (enhanced rule-based, placeholder for ML)
function predictCompatibility(request: PredictionRequest): PredictionResponse {
  console.log(`Processing prediction for drug: ${request.drugName}, excipient: ${request.excipient}`);
  
  const excipientNorm = normalizeText(request.excipient);
  const structuralFlags = computeStructuralFlags(request.smilesCode);
  const excipientProfile = getExcipientProfile(excipientNorm);
  
  // Calculate compatibility score based on rules from Python model
  let score = 0.75; // Base score
  
  // Maillard reaction risk: amines + reducing sugars
  const hasAmine = structuralFlags.has_primary_amine || structuralFlags.has_secondary_amine;
  if (hasAmine && excipientProfile.category === 'reducing_sugar') {
    score -= 0.35; // High risk
  }
  
  // Carboxylic acid + inorganic salts interaction
  if (structuralFlags.has_carboxylic_acid && excipientProfile.category === 'inorganic_salt') {
    score -= 0.15;
  }
  
  // Aldehyde reactivity
  if (structuralFlags.has_aldehyde) {
    score -= 0.20;
  }
  
  // Salt forms may have stability issues
  if (structuralFlags.is_salt) {
    score -= 0.10;
  }
  
  // High molecular weight compounds may have dissolution issues
  if (structuralFlags.high_mw) {
    score -= 0.05;
  }
  
  // Sugar alcohols are generally safe
  if (excipientProfile.category === 'sugar_alcohol') {
    score += 0.10;
  }
  
  // Polymers provide good stability
  if (excipientProfile.category === 'polymer') {
    score += 0.05;
  }
  
  // Add small random variation for realism
  score += (Math.random() - 0.5) * 0.08;
  score = Math.max(0.1, Math.min(0.95, score));
  
  // Decision logic matching Python model
  let compatibility: 'Compatible' | 'Non-Compatible';
  let confidenceLevel: 'High' | 'Medium' | 'Low';
  
  if (score < 0.42) {
    compatibility = 'Non-Compatible';
    confidenceLevel = 'High';
  } else if (score < 0.60) {
    compatibility = 'Compatible';
    confidenceLevel = 'Low';
  } else if (score < 0.80) {
    compatibility = 'Compatible';
    confidenceLevel = 'Medium';
  } else {
    compatibility = 'Compatible';
    confidenceLevel = 'High';
  }
  
  const probabilityScore = Math.round(score * 1000) / 10;
  
  // Generate analysis summary
  const summary = generateAnalysisSummary(
    request.drugName,
    request.excipient,
    excipientProfile,
    structuralFlags,
    compatibility === 'Compatible',
    score
  );
  
  console.log(`Prediction completed: ${compatibility}, score: ${probabilityScore}%`);
  
  return {
    compatibility_status: compatibility,
    probability_score: probabilityScore,
    confidence_level: confidenceLevel,
    analysis_summary: summary,
  };
}

function generateAnalysisSummary(
  drugName: string,
  excipient: string,
  excipientProfile: { category: string; riskLevel: string },
  flags: Record<string, boolean | number>,
  isCompatible: boolean,
  score: number
): string[] {
  const summary: string[] = [];
  
  const hasAmine = flags.has_primary_amine || flags.has_secondary_amine;
  
  if (isCompatible) {
    summary.push(`✓ ${drugName} shows favorable compatibility with ${excipient}.`);
    
    if (!hasAmine && excipientProfile.category === 'reducing_sugar') {
      summary.push("No reactive amine groups detected - low Maillard reaction risk.");
    }
    
    if (excipientProfile.category === 'sugar_alcohol') {
      summary.push("Sugar alcohol excipients provide excellent chemical stability.");
    }
    
    if (excipientProfile.category === 'polymer') {
      summary.push("Polymer matrix offers good physical and chemical protection.");
    }
    
    if (excipientProfile.category === 'filler') {
      summary.push("Inert filler material with minimal reactivity expected.");
    }
    
    summary.push(`Stability score: ${(score * 100).toFixed(0)}% - suitable for formulation development.`);
    summary.push(`Risk level: ${excipientProfile.riskLevel.toUpperCase()}`);
  } else {
    summary.push(`⚠️ Potential incompatibility detected between ${drugName} and ${excipient}.`);
    
    if (hasAmine && excipientProfile.category === 'reducing_sugar') {
      summary.push("⚠️ HIGH RISK: Amine functional groups detected with reducing sugar excipient.");
      summary.push("Maillard reaction may cause drug degradation and discoloration.");
    }
    
    if (flags.has_aldehyde) {
      summary.push("Aldehyde group detected - prone to oxidation and condensation reactions.");
    }
    
    if (flags.has_carboxylic_acid && excipientProfile.category === 'inorganic_salt') {
      summary.push("Carboxylic acid may interact with inorganic salt excipient.");
    }
    
    summary.push(`Risk level: HIGH - further stability studies strongly recommended.`);
    summary.push("Consider alternative excipients such as Microcrystalline Cellulose or Mannitol.");
  }
  
  summary.push("");
  summary.push("Note: This is a computational screening result. Confirm with experimental stability studies before proceeding with formulation.");
  
  return summary;
}

serve(async (req) => {
  console.log(`Received ${req.method} request`);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      throw { type: 'method', detail: 'Only POST method is allowed' };
    }

    const authResult = await authenticateRequest(req);
    if (!authResult) {
      throw { type: 'auth', detail: 'Valid authentication token required' };
    }

    console.log(`Authenticated request from user: ${authResult.user.id}`);

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      throw { type: 'parse', detail: 'Failed to parse JSON body' };
    }

    const validatedInput = validateInput(rawBody);
    
    console.log(`Processing prediction for user ${authResult.user.id}...`);
    
    // Simulate processing time
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
    console.error('Error processing request:', error);
    
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
