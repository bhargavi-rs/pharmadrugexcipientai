import { CheckCircle2, XCircle, TrendingUp, Shield, Beaker, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PredictionData {
  compatibility_status: 'Compatible' | 'Non-Compatible';
  probability_score: number;
  confidence_level: 'High' | 'Medium' | 'Low';
  analysis_summary: string[];
}

interface PredictionResultProps {
  data: PredictionData | null;
  isLoading: boolean;
}

export const PredictionResult = ({ data, isLoading }: PredictionResultProps) => {
  if (isLoading) {
    return (
      <div className="pharma-card p-6 lg:p-8 h-full animate-fade-in">
        <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2 mb-6">
          <Beaker className="w-5 h-5 text-primary" />
          Prediction Analysis
        </h2>
        
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-secondary flex items-center justify-center">
              <Beaker className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="mt-6 text-muted-foreground font-medium">Analyzing molecular compatibility...</p>
          <p className="mt-2 text-sm text-muted-foreground/70">Processing SMILES structure</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="pharma-card p-6 lg:p-8 h-full animate-fade-in">
        <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2 mb-6">
          <Beaker className="w-5 h-5 text-primary" />
          Prediction Analysis
        </h2>
        
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
            <Beaker className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">No prediction yet</p>
          <p className="mt-2 text-sm text-muted-foreground/70 max-w-xs">
            Enter drug details and select an excipient to get AI-powered compatibility analysis
          </p>
        </div>
      </div>
    );
  }

  const isCompatible = data.compatibility_status === 'Compatible';
  const confidenceColor = data.confidence_level === 'High' ? 'text-success' : data.confidence_level === 'Medium' ? 'text-warning' : 'text-destructive';

  return (
    <div className="pharma-card p-6 lg:p-8 h-full animate-slide-up">
      <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2 mb-6">
        <Beaker className="w-5 h-5 text-primary" />
        Prediction Analysis
      </h2>

      {/* Status Badge */}
      <div className="mb-8">
        <div
          className={`inline-flex items-center gap-3 px-6 py-4 rounded-xl ${
            isCompatible
              ? 'bg-success/10 border border-success/20'
              : 'bg-destructive/10 border border-destructive/20'
          }`}
        >
          {isCompatible ? (
            <CheckCircle2 className="w-8 h-8 text-success" />
          ) : (
            <XCircle className="w-8 h-8 text-destructive" />
          )}
          <div>
            <span
              className={`text-2xl font-display font-bold ${
                isCompatible ? 'text-success' : 'text-destructive'
              }`}
            >
              {data.compatibility_status.toUpperCase()}
            </span>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isCompatible ? 'Safe for formulation' : 'Further evaluation needed'}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Probability Score */}
        <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Probability Score</span>
          </div>
          <div className="text-3xl font-display font-bold text-foreground">
            {data.probability_score}%
          </div>
          <Progress
            value={data.probability_score}
            className="mt-3 h-2"
          />
        </div>

        {/* Confidence Level */}
        <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Confidence Level</span>
          </div>
          <div className={`text-3xl font-display font-bold ${confidenceColor}`}>
            {data.confidence_level}
          </div>
          <div className="flex gap-1 mt-3">
            {['Low', 'Medium', 'High'].map((level, idx) => (
              <div
                key={level}
                className={`h-2 flex-1 rounded-full ${
                  ['Low', 'Medium', 'High'].indexOf(data.confidence_level) >= idx
                    ? 'bg-primary'
                    : 'bg-border'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Chemical Interaction Insight */}
      <div className="border-t border-border/50 pt-6">
        <h3 className="text-base font-display font-semibold text-foreground flex items-center gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-primary" />
          Chemical Interaction Insight
        </h3>
        <p className="text-sm text-muted-foreground mb-4">Analysis Summary</p>

        <div className="bg-secondary/20 rounded-xl p-4 border border-border/30">
          <ul className="space-y-2.5">
            {data.analysis_summary.map((line, index) => (
              line ? (
                <li key={index} className="text-sm text-foreground/90 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>{line}</span>
                </li>
              ) : (
                <li key={index} className="h-2" />
              )
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
