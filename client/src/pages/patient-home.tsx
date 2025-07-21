import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, Save, AlertTriangle, User, Bell, MoreVertical, XCircle, Calendar, Plus, X } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useKeyboardVisibility } from "@/hooks/use-keyboard-visibility";
import { apiRequest } from "@/lib/queryClient";
import MedicationCalendar from "@/components/ui/medication-calendar";
import SymptomTracker from "@/components/ui/symptom-tracker";
import BottomNavigation from "@/components/ui/bottom-navigation";

export default function PatientHome() {
  const [diaryContent, setDiaryContent] = useState("");
  const [diaryDate, setDiaryDate] = useState(new Date().toISOString().split('T')[0]);
  const [showMissedMedDialog, setShowMissedMedDialog] = useState(false);
  const [missedDates, setMissedDates] = useState<string[]>([]);
  const [missedMedNotes, setMissedMedNotes] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  // Keyboard visibility hooks for text inputs
  const diaryTextareaRef = useKeyboardVisibility();
  const missedMedNotesRef = useKeyboardVisibility();

  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: ["/api/patients/me"],
  });

  const saveDiaryMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/diary-entries", {
        date: diaryDate,
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



  const reportMissedMedication = useMutation({
    mutationFn: async () => {
      if (!patient?.id) {
        throw new Error("Dati paziente non disponibili");
      }
      if (missedDates.length === 0) {
        throw new Error("Seleziona almeno una data");
      }
      await apiRequest("POST", "/api/missed-medication", {
        patientId: patient.id,
        missedDates: missedDates,
        notes: missedMedNotes,
      });
    },
    onSuccess: () => {
      toast({
        title: "Segnalazione inviata",
        description: "Il medico è stato informato delle dosi mancate.",
      });
      setShowMissedMedDialog(false);
      setMissedDates([]);
      setMissedMedNotes("");
      queryClient.invalidateQueries({ queryKey: ["/api/missed-medication"] });
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
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
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
              <DropdownMenuItem onClick={() => setLocation("/patient/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Impostazioni
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Weekly Calendar */}
      <div className="p-4 bg-white border-b border-gray-200">
        <MedicationCalendar medication={patient.medication} patientId={patient.id} />
        
        {/* Missed Medication Button */}
        <div className="mt-4">
          <Dialog open={showMissedMedDialog} onOpenChange={setShowMissedMedDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
              >
                <XCircle className="w-5 h-5 mr-2" />
                Segnala Terapia Non Assunta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Segnalazione Terapia Non Assunta</DialogTitle>
              </DialogHeader>
              <MissedMedicationDialog
                missedDates={missedDates}
                setMissedDates={setMissedDates}
                notes={missedMedNotes}
                setNotes={setMissedMedNotes}
                onSave={() => reportMissedMedication.mutate()}
                onCancel={() => setShowMissedMedDialog(false)}
                isLoading={reportMissedMedication.isPending}
                notesRef={missedMedNotesRef}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Daily Diary */}
      <div className="p-4 bg-white border-b border-gray-200">
        <h2 className="text-md font-semibold text-gray-800 mb-3">Diario del giorno:</h2>
        
        {/* Date Selector for Diary */}
        <div className="mb-3">
          <Label htmlFor="diary-date" className="text-sm font-medium text-gray-700 flex items-center mb-1">
            <Calendar className="w-4 h-4 mr-2" />
            Data del diario
          </Label>
          <Input
            id="diary-date"
            type="date"
            value={diaryDate}
            onChange={(e) => setDiaryDate(e.target.value)}
            className="focus:ring-sage-500 focus:border-sage-500 text-sm"
            max={new Date().toISOString().split('T')[0]} // Non permettere date future
          />
          <p className="text-xs text-gray-500 mt-1">
            {new Date(diaryDate).toLocaleDateString("it-IT", {
              weekday: "long",
              year: "numeric", 
              month: "long",
              day: "numeric"
            })}
          </p>
        </div>

        <Textarea
          ref={diaryTextareaRef}
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


      </div>

      <BottomNavigation />
    </div>
  );
}

// Missed Medication Dialog Component
function MissedMedicationDialog({
  missedDates,
  setMissedDates,
  notes,
  setNotes,
  onSave,
  onCancel,
  isLoading,
  notesRef,
}: {
  missedDates: string[];
  setMissedDates: (dates: string[]) => void;
  notes: string;
  setNotes: (notes: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
  notesRef: React.RefObject<HTMLTextAreaElement>;
}) {
  const generateLastDays = (days: number) => {
    const dates = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const lastThirtyDays = generateLastDays(30);

  const handleDateToggle = (date: string) => {
    if (missedDates.includes(date)) {
      setMissedDates(missedDates.filter(d => d !== date));
    } else {
      setMissedDates([...missedDates, date]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-800 mb-3">
          Seleziona i giorni in cui non hai assunto correttamente la terapia:
        </h3>
        <div className="max-h-48 overflow-y-auto space-y-2">
          {lastThirtyDays.map((date) => (
            <div key={date} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
              <Checkbox
                id={date}
                checked={missedDates.includes(date)}
                onCheckedChange={() => handleDateToggle(date)}
              />
              <label htmlFor={date} className="text-sm cursor-pointer flex-1">
                {formatDate(date)}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-800 mb-2">
          Note (opzionale):
        </h3>
        <Textarea
          ref={notesRef}
          placeholder="Scrivi qui le motivazioni per cui non hai assunto la terapia..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-20"
        />
      </div>

      <div className="flex space-x-2">
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1"
          disabled={isLoading}
        >
          Annulla
        </Button>
        <Button
          onClick={onSave}
          disabled={isLoading || missedDates.length === 0}
          className="flex-1 bg-sage-500 hover:bg-sage-600"
        >
          {isLoading ? "Salvando..." : "Salva"}
        </Button>
      </div>
    </div>
  );
}
