import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, Save, AlertTriangle, User, Bell, MoreVertical } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import MedicationCalendar from "@/components/ui/medication-calendar";
import SymptomTracker from "@/components/ui/symptom-tracker";
import BottomNavigation from "@/components/ui/bottom-navigation";

export default function PatientHome() {
  const [diaryContent, setDiaryContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: patient } = useQuery({
    queryKey: ["/api/patients/me"],
  });

  const saveDiaryMutation = useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      await apiRequest("POST", "/api/diary-entries", {
        date: today,
        content: diaryContent,
      });
    },
    onSuccess: () => {
      toast({
        title: "Diario salvato",
        description: "La tua nota è stata salvata con successo.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/diary-entries"] });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile salvare il diario. Riprova.",
        variant: "destructive",
      });
    },
  });

  const sendUrgentAlert = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/messages", {
        patientId: patient?.id,
        content: "Segnalazione urgente: La paziente ha richiesto assistenza medica immediata.",
        isUrgent: true,
      });
    },
    onSuccess: () => {
      toast({
        title: "Segnalazione inviata",
        description: "Il medico è stato avvisato della tua segnalazione urgente.",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile inviare la segnalazione. Riprova.",
        variant: "destructive",
      });
    },
  });

  const currentDate = new Date().toLocaleDateString("it-IT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (!patient) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
        <p className="text-sage-600">Caricamento profilo paziente...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-16">
      {/* Header */}
      <div className="bg-sage-500 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">{patient.firstName} {patient.lastName}</h1>
            <p className="text-sage-100 text-sm">{patient.medication} {patient.dosage}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:bg-sage-600">
                <Settings className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setLocation("/profile")}>
                <User className="mr-2 h-4 w-4" />
                Profilo paziente
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation("/settings")}>
                <Bell className="mr-2 h-4 w-4" />
                Impostazioni app
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Weekly Calendar */}
      <div className="p-4 bg-white border-b border-gray-200">
        <h2 className="text-md font-semibold text-gray-800 mb-3">Calendario Settimanale</h2>
        <MedicationCalendar medication={patient.medication} />
      </div>

      {/* Daily Diary */}
      <div className="p-4 bg-white border-b border-gray-200">
        <h2 className="text-md font-semibold text-gray-800 mb-2">Diario del giorno:</h2>
        <p className="text-sm text-gray-500 mb-3">{currentDate}</p>
        <Textarea
          className="w-full h-20 resize-none focus:ring-sage-500 focus:border-sage-500"
          placeholder="Scrivi qui le tue note del giorno..."
          value={diaryContent}
          onChange={(e) => setDiaryContent(e.target.value)}
        />
        <Button 
          onClick={() => saveDiaryMutation.mutate()}
          disabled={saveDiaryMutation.isPending || !diaryContent.trim()}
          className="mt-2 bg-sage-500 hover:bg-sage-600"
          size="sm"
        >
          <Save className="w-4 h-4 mr-2" />
          {saveDiaryMutation.isPending ? "Salvando..." : "Salva"}
        </Button>
      </div>

      {/* Symptoms Section */}
      <div className="p-4 bg-white">
        <h2 className="text-md font-semibold text-gray-800 mb-4">Sintomi</h2>
        <SymptomTracker patientId={patient.id} />

        {/* Manual Alert */}
        <div className="mt-6">
          <Button
            onClick={() => sendUrgentAlert.mutate()}
            disabled={sendUrgentAlert.isPending}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            {sendUrgentAlert.isPending ? "Invio..." : "Invia Segnalazione Urgente al Medico"}
          </Button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
