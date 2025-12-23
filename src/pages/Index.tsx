import { useState } from "react";
import { Header } from "@/components/Header";
import { InputForm } from "@/components/InputForm";
import { PredictionResult } from "@/components/PredictionResult";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Activity, Database, Shield, Lightbulb } from "lucide-react";

interface PredictionData {
  compatibility_status: 'Compatible' | 'Non-Compatible';
  probability_score: number;
  confidence_level: 'High' | 'Medium' | 'Low';
  analysis_summary: string[];
}

const Index = () => {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: {
    drugName: string;
    smilesCode: string;
    excipient: string;
  }) => {
    setIsLoading(true);
    setPrediction(null);

    try {
      const { data: result, error } = await supabase.functions.invoke('predict-compatibility', {
        body: data,
      });

      if (error) {
        throw error;
      }

      setPrediction(result as PredictionData);
      
      toast({
        title: "Analysis Complete",
        description: `${data.drugName} compatibility with ${data.excipient} has been analyzed.`,
      });
    } catch (error) {
      console.error('Prediction error:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to process the compatibility prediction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 lg:py-12">
        {/* Hero Section */}
        <div className="text-center mb-10 lg:mb-14 animate-fade-in">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
            AI-Powered Drug Formulation Screening
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Predict drug-excipient compatibility in seconds. Reduce experimental workload and accelerate your formulation development with Quality by Design principles.
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 text-sm text-secondary-foreground">
            <Activity className="w-4 h-4 text-primary" />
            Real-time Analysis
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 text-sm text-secondary-foreground">
            <Database className="w-4 h-4 text-primary" />
            ML-Ready Backend
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 text-sm text-secondary-foreground">
            <Shield className="w-4 h-4 text-primary" />
            QbD Compliant
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 text-sm text-secondary-foreground">
            <Lightbulb className="w-4 h-4 text-primary" />
            Chemical Insights
          </div>
        </div>

        {/* Main Two-Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {/* Left Panel - Input Form */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>

          {/* Right Panel - Prediction Results */}
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <PredictionResult data={prediction} isLoading={isLoading} />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 lg:mt-16 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-success" />
            Backend API ready for ML model integration
          </div>
          <p className="mt-4 text-xs text-muted-foreground max-w-lg mx-auto">
            This computational screening tool supports early-stage drug formulation decisions. 
            Always validate predictions with experimental stability studies.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
