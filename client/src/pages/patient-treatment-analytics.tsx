import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Clock, Activity, TrendingUp, Pill } from "lucide-react";

interface TreatmentAnalytics {
  weeksOnTreatment: number;
  weeksOnCurrentDosage: number;
  patient: {
    medication: string;
    dosage: string;
    treatmentSetting: string;
    treatmentStartDate?: string;
    currentDosageStartDate?: string;
  };
}

export default function PatientTreatmentAnalytics() {
  const { data: patient } = useQuery({ queryKey: ["/api/patients/me"] });
  
  const { data: weeksOnTreatment } = useQuery({
    queryKey: [`/api/analytics/patient/${patient?.id}/weeks-on-treatment`],
    enabled: !!patient?.id,
  });
  
  const { data: weeksOnCurrentDosage } = useQuery({
    queryKey: [`/api/analytics/patient/${patient?.id}/weeks-on-current-dosage`],
    enabled: !!patient?.id,
  });

  if (!patient) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="p-4 text-center">
          <div className="animate-pulse">Caricamento statistiche...</div>
        </div>
      </div>
    );
  }

  const medicationNames = {
    abemaciclib: "Abemaciclib",
    ribociclib: "Ribociclib", 
    palbociclib: "Palbociclib"
  };

  const treatmentTypeLabels = {
    metastatic: "Metastatico",
    adjuvant: "Adiuvante"
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Non disponibile";
    return new Date(dateString).toLocaleDateString("it-IT");
  };

  const calculateTreatmentProgress = (weeks: number) => {
    // Assume a typical treatment cycle is 52 weeks (1 year)
    // This is just for visual representation
    const maxWeeks = 52;
    return Math.min((weeks / maxWeeks) * 100, 100);
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-sage-600 to-sage-700 text-white p-4">
        <h1 className="text-xl font-semibold mb-1">Statistiche Trattamento</h1>
        <p className="text-sage-100 text-sm">Monitoraggio del tuo percorso terapeutico</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Medication Info Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Pill className="w-5 h-5 text-sage-600" />
              Informazioni Farmaco
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Farmaco:</span>
              <Badge variant="secondary" className="bg-sage-100 text-sage-800">
                {medicationNames[patient.medication] || patient.medication}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Dosaggio:</span>
              <Badge variant="outline">{patient.dosage}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tipo trattamento:</span>
              <Badge 
                variant={patient.treatmentSetting === "metastatic" ? "destructive" : "default"}
                className={patient.treatmentSetting === "metastatic" ? "bg-orange-100 text-orange-800" : ""}
              >
                {treatmentTypeLabels[patient.treatmentSetting] || patient.treatmentSetting}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Treatment Duration */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              Durata Trattamento Totale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {weeksOnTreatment?.weeksOnTreatment || 0}
              </div>
              <div className="text-gray-600 text-sm">settimane di trattamento</div>
            </div>
            <Progress 
              value={calculateTreatmentProgress(weeksOnTreatment?.weeksOnTreatment || 0)} 
              className="mb-2" 
            />
            <div className="text-xs text-gray-500 text-center">
              Inizio: {formatDate(patient.treatmentStartDate)}
            </div>
          </CardContent>
        </Card>

        {/* Current Dosage Duration */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              Dosaggio Attuale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {weeksOnCurrentDosage?.weeksOnCurrentDosage || 0}
              </div>
              <div className="text-gray-600 text-sm">settimane con {patient.dosage}</div>
            </div>
            <Progress 
              value={calculateTreatmentProgress(weeksOnCurrentDosage?.weeksOnCurrentDosage || 0)} 
              className="mb-2"
            />
            <div className="text-xs text-gray-500 text-center">
              Inizio dosaggio: {formatDate(patient.currentDosageStartDate)}
            </div>
          </CardContent>
        </Card>

        {/* Treatment Milestones */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Traguardi Raggiunti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Primo mese completato</span>
                <div className={`w-4 h-4 rounded-full ${(weeksOnTreatment?.weeksOnTreatment || 0) >= 4 ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">3 mesi di trattamento</span>
                <div className={`w-4 h-4 rounded-full ${(weeksOnTreatment?.weeksOnTreatment || 0) >= 12 ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">6 mesi di trattamento</span>
                <div className={`w-4 h-4 rounded-full ${(weeksOnTreatment?.weeksOnTreatment || 0) >= 24 ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">1 anno di trattamento</span>
                <div className={`w-4 h-4 rounded-full ${(weeksOnTreatment?.weeksOnTreatment || 0) >= 52 ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Summary */}
        <Card className="bg-gradient-to-r from-sage-50 to-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-sage-600" />
              Riepilogo Progresso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-700 leading-relaxed">
              Stai affrontando il trattamento con{" "}
              <span className="font-semibold text-sage-700">
                {medicationNames[patient.medication]}
              </span>{" "}
              da{" "}
              <span className="font-semibold text-blue-700">
                {weeksOnTreatment?.weeksOnTreatment || 0} settimane
              </span>
              . Il dosaggio attuale di{" "}
              <span className="font-semibold text-purple-700">
                {patient.dosage}
              </span>{" "}
              è in corso da{" "}
              <span className="font-semibold text-purple-700">
                {weeksOnCurrentDosage?.weeksOnCurrentDosage || 0} settimane
              </span>
              .
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}