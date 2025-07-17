import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "./button";
import { Textarea } from "./textarea";
import { Input } from "./input";
import { Slider } from "./slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SymptomTrackerProps {
  patientId: number;
}

const symptoms = [
  { id: "stanchezza", name: "Stanchezza", type: "intensity" },
  { id: "malessere", name: "Malessere", type: "intensity" },
  { id: "rash", name: "Rash cutaneo", type: "intensity" },
  { id: "diarrea", name: "Diarrea", type: "count" },
  { id: "dolore_addominale", name: "Dolore addominale", type: "intensity" },
  { id: "dolori_articolari", name: "Dolori articolari", type: "intensity" },
  { id: "febbre", name: "Febbre", type: "fever" },
  { id: "sintomi_influenzali", name: "Sintomi influenzali", type: "boolean" },
];

export default function SymptomTracker({ patientId }: SymptomTrackerProps) {
  const [symptomStates, setSymptomStates] = useState<Record<string, any>>({});
  const [additionalNotes, setAdditionalNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveSymptomsMutation = useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const symptomsData = symptoms.map((symptom) => {
        const state = symptomStates[symptom.id] || {};
        return {
          patientId,
          date: today,
          symptomType: symptom.id,
          present: state.present || false,
          intensity: state.intensity || null,
          diarrheaCount: state.count || null,
          feverTemperature: state.temperature || null,
          feverChills: state.chills || false,
          additionalNotes: symptom.id === symptoms[0].id ? additionalNotes : null,
        };
      });

      await apiRequest("POST", "/api/symptoms", { symptoms: symptomsData });
    },
    onSuccess: () => {
      toast({
        title: "Sintomi salvati",
        description: "I tuoi sintomi sono stati registrati con successo.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/symptoms"] });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile salvare i sintomi. Riprova.",
        variant: "destructive",
      });
    },
  });

  const updateSymptomState = (symptomId: string, updates: any) => {
    setSymptomStates(prev => ({
      ...prev,
      [symptomId]: {
        ...prev[symptomId],
        ...updates,
      },
    }));
  };

  const toggleSymptom = (symptomId: string, present: boolean) => {
    updateSymptomState(symptomId, { present });
  };

  return (
    <div className="space-y-4">
      {symptoms.map((symptom) => {
        const state = symptomStates[symptom.id] || {};
        return (
          <div key={symptom.id} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{symptom.name}</span>
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    !state.present 
                      ? "bg-sage-500 text-white" 
                      : "bg-gray-200 text-gray-600"
                  }`}
                  onClick={() => toggleSymptom(symptom.id, false)}
                >
                  No
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    state.present 
                      ? "bg-sage-500 text-white" 
                      : "bg-gray-200 text-gray-600"
                  }`}
                  onClick={() => toggleSymptom(symptom.id, true)}
                >
                  Sì
                </Button>
              </div>
            </div>
            
            {state.present && (
              <div className="mt-2">
                {symptom.type === "intensity" && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">0</span>
                    <Slider
                      value={[state.intensity || 0]}
                      onValueChange={(value) => updateSymptomState(symptom.id, { intensity: value[0] })}
                      max={10}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-500">10</span>
                  </div>
                )}
                
                {symptom.type === "count" && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Scariche/giorno:</span>
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      value={state.count || 0}
                      onChange={(e) => updateSymptomState(symptom.id, { count: parseInt(e.target.value) || 0 })}
                      className="w-16 text-sm"
                    />
                  </div>
                )}
                
                {symptom.type === "fever" && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Temperatura max (°C):</span>
                      <Input
                        type="number"
                        min="35"
                        max="45"
                        step="0.1"
                        value={state.temperature || ""}
                        onChange={(e) => updateSymptomState(symptom.id, { temperature: parseFloat(e.target.value) || null })}
                        className="w-20 text-sm"
                        placeholder="37.5"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Picco febbrile con brividi:</span>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`px-2 py-1 rounded text-xs ${
                            !state.chills 
                              ? "bg-sage-500 text-white" 
                              : "bg-gray-200 text-gray-600"
                          }`}
                          onClick={() => updateSymptomState(symptom.id, { chills: false })}
                        >
                          No
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`px-2 py-1 rounded text-xs ${
                            state.chills 
                              ? "bg-sage-500 text-white" 
                              : "bg-gray-200 text-gray-600"
                          }`}
                          onClick={() => updateSymptomState(symptom.id, { chills: true })}
                        >
                          Sì
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {symptom.type === "intensity" && (
                  <div className="text-center mt-1">
                    <span className="text-sm font-medium text-sage-600">
                      Intensità: {state.intensity || 0}/10
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Altri sintomi da segnalare:
        </label>
        <Textarea
          className="w-full h-16 resize-none focus:ring-sage-500 focus:border-sage-500"
          placeholder="Descrivi eventuali altri sintomi..."
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
        />
      </div>

      <Button
        onClick={() => saveSymptomsMutation.mutate()}
        disabled={saveSymptomsMutation.isPending}
        className="w-full bg-sage-500 hover:bg-sage-600 text-white mt-4"
      >
        {saveSymptomsMutation.isPending ? "Salvando..." : "Salva Sintomi"}
      </Button>
    </div>
  );
}
