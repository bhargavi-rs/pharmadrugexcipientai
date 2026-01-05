import { useState } from "react";
import { Pill, Atom, FlaskConical, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableCombobox } from "@/components/SearchableCombobox";

// Expanded drug list with SMILES codes
const DRUGS_WITH_SMILES: { name: string; smiles: string }[] = [
  { name: "Aspirin", smiles: "CC(=O)OC1=CC=CC=C1C(=O)O" },
  { name: "Ibuprofen", smiles: "CC(C)CC1=CC=C(C=C1)C(C)C(=O)O" },
  { name: "Paracetamol", smiles: "CC(=O)NC1=CC=C(C=C1)O" },
  { name: "Metformin", smiles: "CN(C)C(=N)NC(=N)N" },
  { name: "Amlodipine", smiles: "CCOC(=O)C1=C(NC(=C(C1C2=CC=CC=C2Cl)C(=O)OC)C)COCCN" },
  { name: "Atorvastatin", smiles: "CC(C)C1=C(C(=C(N1CCC(CC(CC(=O)O)O)O)C2=CC=C(C=C2)F)C3=CC=CC=C3)C(=O)NC4=CC=CC=C4" },
  { name: "Omeprazole", smiles: "CC1=CN=C(C(=C1OC)C)CS(=O)C2=NC3=C(N2)C=CC(=C3)OC" },
  { name: "Metoprolol", smiles: "CC(C)NCC(COC1=CC=C(C=C1)CCOC)O" },
  { name: "Losartan", smiles: "CCCCC1=NC(=C(N1CC2=CC=C(C=C2)C3=CC=CC=C3C4=NNN=N4)CO)Cl" },
  { name: "Simvastatin", smiles: "CCC(C)(C)C(=O)OC1CC(C=C2C1C(C(C=C2)C)CCC3CC(CC(=O)O3)O)C" },
  { name: "Lisinopril", smiles: "NCCCC[C@H](N[C@@H](CCc1ccccc1)C(=O)O)C(=O)N1CCC[C@H]1C(=O)O" },
  { name: "Gabapentin", smiles: "NCC1(CCCCC1)CC(=O)O" },
  { name: "Sertraline", smiles: "CN[C@H]1CC[C@@H](C2=CC=CC=C12)C3=CC(=C(C=C3)Cl)Cl" },
  { name: "Azithromycin", smiles: "CC1C(C(C(C(=O)C(CC(C(C(C(C(C(=O)O1)C)OC2CC(C(C(O2)C)O)(C)OC)C)OC3C(C(CC(O3)C)N(C)C)O)(C)O)C)C)O)(C)O" },
  { name: "Amoxicillin", smiles: "CC1(C(N2C(S1)C(C2=O)NC(=O)C(C3=CC=C(C=C3)O)N)C(=O)O)C" },
  { name: "Ciprofloxacin", smiles: "C1CC1N2C=C(C(=O)C3=CC(=C(C=C32)N4CCNCC4)F)C(=O)O" },
  { name: "Fluoxetine", smiles: "CNCCC(C1=CC=CC=C1)OC2=CC=C(C=C2)C(F)(F)F" },
  { name: "Warfarin", smiles: "CC(=O)CC(C1=CC=CC=C1)C2=C(C3=CC=CC=C3OC2=O)O" },
  { name: "Clopidogrel", smiles: "COC(=O)[C@H](C1=CC=CS1)N2CCC3=CC=CC=C3C2" },
  { name: "Hydrochlorothiazide", smiles: "C1=C(C=C(C(=C1NS(=O)(=O)N)S(=O)(=O)N)Cl)S(=O)(=O)N" },
  { name: "Ranitidine", smiles: "CNC(=C[N+](=O)[O-])NCCSCC1=CC=C(O1)CN(C)C" },
  { name: "Diazepam", smiles: "CN1C(=O)CN=C(C2=C1C=CC(=C2)Cl)C3=CC=CC=C3" },
  { name: "Alprazolam", smiles: "CC1=NN=C2CN=C(C3=CC=CC=C3F)C4=C(N12)C=CC(=C4)Cl" },
  { name: "Prednisone", smiles: "CC12CCC(=O)C=C1CCC3C2C(=O)CC4(C3CCC4(C(=O)CO)O)C" },
  { name: "Dexamethasone", smiles: "CC1CC2C3CCC4=CC(=O)C=CC4(C3(C(CC2(C1(C(=O)CO)O)C)O)F)C" },
  { name: "Furosemide", smiles: "C1=CC(=C(C=C1S(=O)(=O)N)C(=O)O)NCC2=CC=CO2" },
  { name: "Levothyroxine", smiles: "C1=CC(=C(C=C1CC(C(=O)O)N)I)OC2=CC(=C(C(=C2)I)O)I" },
  { name: "Montelukast", smiles: "CC(C)(C)C1=CC=CC=C1CC/C=C/C2=CC=CC=C2C3=NC4=C(N3)C=CC(=C4)Cl" },
  { name: "Esomeprazole", smiles: "CC1=C(C(=CC=C1)OC)CS(=O)C2=NC3=CC=CC=C3N2" },
  { name: "Pantoprazole", smiles: "COC1=CC=NC(=C1OC)CS(=O)C2=NC3=C(N2)C=C(C=C3)OC(F)F" },
];

// Expanded excipient list matching Python model
const EXCIPIENTS = [
  "Lactose Monohydrate",
  "Lactose Anhydrous",
  "Mannitol",
  "Sorbitol",
  "HPMC (Hydroxypropyl Methylcellulose)",
  "PVP (Polyvinylpyrrolidone)",
  "PVP K30",
  "DCP (Dicalcium Phosphate)",
  "Sodium Bicarbonate",
  "MCC (Microcrystalline Cellulose)",
  "Microcrystalline Cellulose",
  "Magnesium Stearate",
  "Sodium Starch Glycolate",
  "Starch",
  "Croscarmellose Sodium",
  "Crospovidone",
  "Colloidal Silicon Dioxide",
  "Talc",
  "Stearic Acid",
  "Hydroxypropyl Cellulose",
  "Ethyl Cellulose",
  "Polyethylene Glycol",
  "Titanium Dioxide",
  "Calcium Carbonate",
  "Sodium Lauryl Sulfate",
  "Povidone",
  "Gelatin",
  "Sucrose",
  "Dextrose",
  "Maltodextrin",
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

  const drugNames = DRUGS_WITH_SMILES.map(d => d.name);

  const handleDrugSelect = (name: string) => {
    setDrugName(name);
    const drug = DRUGS_WITH_SMILES.find(d => d.name === name);
    if (drug) {
      setSmilesCode(drug.smiles);
    }
  };

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
        {/* Drug Name Combobox */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Pill className="w-4 h-4 text-primary" />
            Input Drug Name
          </Label>
          <SearchableCombobox
            options={drugNames}
            value={drugName}
            onValueChange={handleDrugSelect}
            placeholder="Select or type drug name..."
            searchPlaceholder="Search drugs..."
            emptyMessage="No drugs found."
            allowCustom={true}
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
            Auto-filled when selecting a drug, or enter manually
          </p>
        </div>

        {/* Excipient Combobox */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <FlaskConical className="w-4 h-4 text-primary" />
            Select Excipient
          </Label>
          <SearchableCombobox
            options={EXCIPIENTS}
            value={excipient}
            onValueChange={setExcipient}
            placeholder="Select or type excipient..."
            searchPlaceholder="Search excipients..."
            emptyMessage="No excipients found."
            allowCustom={true}
          />
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
            onClick={() => handleDrugSelect("Aspirin")}
            className="px-3 py-1.5 text-xs rounded-full bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
          >
            Aspirin
          </button>
          <button
            type="button"
            onClick={() => handleDrugSelect("Ibuprofen")}
            className="px-3 py-1.5 text-xs rounded-full bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
          >
            Ibuprofen
          </button>
          <button
            type="button"
            onClick={() => handleDrugSelect("Paracetamol")}
            className="px-3 py-1.5 text-xs rounded-full bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
          >
            Paracetamol
          </button>
          <button
            type="button"
            onClick={() => handleDrugSelect("Metformin")}
            className="px-3 py-1.5 text-xs rounded-full bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
          >
            Metformin
          </button>
        </div>
      </div>
    </div>
  );
};
