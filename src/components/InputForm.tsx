import { useState } from "react";
import { Pill, Atom, FlaskConical, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EXCIPIENTS = [
  "Lactose Monohydrate",
  "Magnesium Stearate",
  "Microcrystalline Cellulose",
];

interface InputFormProps {
  onSubmit: (data: {
    drugName: string;
    smilesCode: string;
    excipient: string;
  }) => void;
  isLoading: boolean;
}

export const InputForm = ({ onSubmit, isLoading }: InputFormProps) => {
  const [drugName, setDrugName] = useState("");
  const [smilesCode, setSmilesCode] = useState("");
  const [excipient, setExcipient] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (drugName && smilesCode && excipient) {
      onSubmit({ drugName, smilesCode, excipient });
    }
  };

  const isValid = drugName && smilesCode && excipient;

  return (
    <div className="pharma-card p-6 lg:p-8 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-primary" />
          Input Parameters
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter drug and excipient details for compatibility analysis
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Drug Name Input */}
        <div className="space-y-2">
          <Label htmlFor="drugName" className="flex items-center gap-2 text-sm font-medium">
            <Pill className="w-4 h-4 text-primary" />
            Input Drug Name
          </Label>
          <Input
            id="drugName"
            placeholder="e.g., Aspirin"
            value={drugName}
            onChange={(e) => setDrugName(e.target.value)}
            className="h-11 bg-background/50 border-border/60 focus:border-primary focus:ring-primary/20"
          />
        </div>

        {/* SMILES Code Input */}
        <div className="space-y-2">
          <Label htmlFor="smilesCode" className="flex items-center gap-2 text-sm font-medium">
            <Atom className="w-4 h-4 text-primary" />
            SMILES Code
          </Label>
          <Input
            id="smilesCode"
            placeholder="e.g., CC(=O)OC1=CC=CC=C1C(=O)O"
            value={smilesCode}
            onChange={(e) => setSmilesCode(e.target.value)}
            className="h-11 bg-background/50 border-border/60 focus:border-primary focus:ring-primary/20 font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Enter the Simplified Molecular Input Line Entry System notation
          </p>
        </div>

        {/* Excipient Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="excipient" className="flex items-center gap-2 text-sm font-medium">
            <FlaskConical className="w-4 h-4 text-primary" />
            Select Excipient
          </Label>
          <Select value={excipient} onValueChange={setExcipient}>
            <SelectTrigger className="h-11 bg-background/50 border-border/60 focus:border-primary focus:ring-primary/20">
              <SelectValue placeholder="Choose an excipient..." />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {EXCIPIENTS.map((exc) => (
                <SelectItem key={exc} value={exc} className="cursor-pointer">
                  {exc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full h-12 mt-4 pharma-gradient-bg text-primary-foreground font-semibold shadow-pharma hover:shadow-pharma-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Analyzing...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Predict Compatibility
            </div>
          )}
        </Button>
      </form>

      {/* Quick Examples */}
      <div className="mt-6 pt-6 border-t border-border/50">
        <p className="text-xs text-muted-foreground mb-3">Quick examples:</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setDrugName("Aspirin");
              setSmilesCode("CC(=O)OC1=CC=CC=C1C(=O)O");
            }}
            className="px-3 py-1.5 text-xs rounded-full bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
          >
            Aspirin
          </button>
          <button
            type="button"
            onClick={() => {
              setDrugName("Ibuprofen");
              setSmilesCode("CC(C)CC1=CC=C(C=C1)C(C)C(=O)O");
            }}
            className="px-3 py-1.5 text-xs rounded-full bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
          >
            Ibuprofen
          </button>
          <button
            type="button"
            onClick={() => {
              setDrugName("Paracetamol");
              setSmilesCode("CC(=O)NC1=CC=C(C=C1)O");
            }}
            className="px-3 py-1.5 text-xs rounded-full bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
          >
            Paracetamol
          </button>
        </div>
      </div>
    </div>
  );
};
