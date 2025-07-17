import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useLocation } from "wouter";
import { ArrowLeft, Save, Calendar, FileText, Activity, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const medications = {
  abemaciclib: ["150mg 2 volte", "100mg 2 volte", "50mg 2 volte"],
  ribociclib: ["3 cp", "2 cp", "1 cp"],
  palbociclib: ["125mg", "100mg", "75mg"],
};

export default function DoctorPatientDetail() {
  const [match] = useRoute("/doctor/patient/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const patientId = match?.id ? parseInt(match.id) : null;
  
  const [selectedMedication, setSelectedMedication] = useState<string>("");
  const [selectedDosage, setSelectedDosage] = useState<string>("");
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: ["/api/patients", patientId],
    enabled: !!patientId,
  });

  const { data: diaryEntries } = useQuery({
    queryKey: ["/api/diary-entries", patientId],
    enabled: !!patientId,
  });

  const { data: symptoms } = useQuery({
    queryKey: ["/api/symptoms", patientId],
    enabled: !!patientId,
  });

  const { data: medicationSchedules } = useQuery({
    queryKey: ["/api/medication-schedules", patientId],
    enabled: !!patientId,
  });

  const updatePatientMutation = useMutation({
    mutationFn: async (data: { medication: string; dosage: string }) => {
      await apiRequest("PUT", `/api/patients/${patientId}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Trattamento aggiornato",
        description: "Il trattamento del paziente è stato modificato con successo.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/patients", patientId] });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il trattamento. Riprova.",
        variant: "destructive",
      });
    },
  });

  const toggleMedicationDayMutation = useMutation({
    mutationFn: async (data: { date: string; shouldTake: boolean }) => {
      await apiRequest("POST", `/api/medication-schedules/${patientId}/toggle`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medication-schedules", patientId] });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile modificare il calendario. Riprova.",
        variant: "destructive",
      });
    },
  });

  React.useEffect(() => {
    if (patient) {
      setSelectedMedication(patient.medication || "");
      setSelectedDosage(patient.dosage || "");
    }
  }, [patient]);

  const getShouldTakeDefault = (medication: string, date: Date): boolean => {
    const cycleStart = new Date('2024-01-01');
    const daysSinceStart = Math.floor((date.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24));
    
    if (medication === "abemaciclib") {
      return true;
    } else if (medication === "ribociclib" || medication === "palbociclib") {
      const cycleDay = daysSinceStart % 28;
      return cycleDay < 21;
    }
    return false;
  };

  // Calendar logic
  const weeks = React.useMemo(() => {
    const weekDays = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    startOfWeek.setDate(startOfWeek.getDate() + (currentWeekOffset * 7));
    
    return Array.from({ length: 4 }, (_, weekIndex) => {
      return Array.from({ length: 7 }, (_, dayIndex) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + (weekIndex * 7) + dayIndex);
        const dateStr = date.toISOString().split('T')[0];
        const schedule = medicationSchedules?.find(s => s.date === dateStr);
        
        return {
          date: date.getDate(),
          month: date.getMonth(),
          dayName: weekDays[dayIndex],
          dateStr,
          shouldTake: schedule?.shouldTake ?? getShouldTakeDefault(patient?.medication, date),
          isToday: date.toDateString() === today.toDateString(),
        };
      });
    });
  }, [currentWeekOffset, medicationSchedules, patient?.medication]);

  const handleUpdateTreatment = () => {
    if (selectedMedication && selectedDosage) {
      updatePatientMutation.mutate({
        medication: selectedMedication,
        dosage: selectedDosage,
      });
    }
  };

  const handleToggleDay = (dateStr: string, currentShouldTake: boolean) => {
    toggleMedicationDayMutation.mutate({
      date: dateStr,
      shouldTake: !currentShouldTake,
    });
  };

  const getSymptomSeverity = (value: any) => {
    if (typeof value === 'boolean') return value ? 'Presente' : 'Assente';
    if (typeof value === 'number') {
      if (value <= 2) return 'Lieve';
      if (value <= 4) return 'Moderato';
      return 'Severo';
    }
    return value?.toString() || 'N/A';
  };

  const getSymptomBadgeColor = (value: any) => {
    if (typeof value === 'boolean') return value ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';
    if (typeof value === 'number') {
      if (value <= 2) return 'bg-green-100 text-green-800';
      if (value <= 4) return 'bg-yellow-100 text-yellow-800';
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  if (patientLoading) {
    return (
      <div className="max-w-6xl mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-sage-500 rounded-full flex items-center justify-center mb-4">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-sage-600">Caricamento paziente...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-6xl mx-auto bg-white min-h-screen flex items-center justify-center">
        <p className="text-red-600">Paziente non trovato</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-white min-h-screen">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/doctor")}
            className="text-sage-600 mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-sage-800">
            {patient.firstName} {patient.lastName}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Info and Treatment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Pill className="w-5 h-5 mr-2" />
                Informazioni e Trattamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Età</Label>
                  <p className="text-sm">{patient.age} anni</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Sesso</Label>
                  <p className="text-sm">{patient.gender === 'F' ? 'Femminile' : 'Maschile'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Peso</Label>
                  <p className="text-sm">{patient.weight} kg</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Altezza</Label>
                  <p className="text-sm">{patient.height} cm</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Modifica Trattamento</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Farmaco</Label>
                    <Select 
                      value={selectedMedication} 
                      onValueChange={(value) => {
                        setSelectedMedication(value);
                        setSelectedDosage("");
                      }}
                    >
                      <SelectTrigger className="focus:ring-sage-500">
                        <SelectValue placeholder="Seleziona farmaco" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="abemaciclib">Abemaciclib</SelectItem>
                        <SelectItem value="ribociclib">Ribociclib</SelectItem>
                        <SelectItem value="palbociclib">Palbociclib</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Dosaggio</Label>
                    <Select 
                      value={selectedDosage} 
                      onValueChange={setSelectedDosage}
                    >
                      <SelectTrigger className="focus:ring-sage-500">
                        <SelectValue placeholder="Seleziona dosaggio" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedMedication && medications[selectedMedication as keyof typeof medications]?.map((dosage) => (
                          <SelectItem key={dosage} value={dosage}>{dosage}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    onClick={handleUpdateTreatment}
                    disabled={updatePatientMutation.isPending || !selectedMedication || !selectedDosage}
                    className="w-full bg-sage-500 hover:bg-sage-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updatePatientMutation.isPending ? "Salvando..." : "Aggiorna Trattamento"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medication Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Calendario Terapia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentWeekOffset(currentWeekOffset - 1)}
                  >
                    ← Precedente
                  </Button>
                  <span className="text-sm font-medium">4 Settimane</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
                  >
                    Successivo →
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-cols-7 gap-1">
                      {week.map((day, dayIndex) => (
                        <div
                          key={`${weekIndex}-${dayIndex}`}
                          className={`
                            p-2 text-center text-xs cursor-pointer border rounded
                            ${day.isToday ? 'ring-2 ring-sage-400' : ''}
                            ${day.shouldTake 
                              ? 'bg-sage-100 text-sage-800 hover:bg-sage-200' 
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }
                          `}
                          onClick={() => handleToggleDay(day.dateStr, day.shouldTake)}
                        >
                          <div className="font-medium">{day.dayName}</div>
                          <div>{day.date}</div>
                          <div className="text-xs">
                            {day.shouldTake ? 'Terapia' : 'Pausa'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                
                <div className="text-xs text-gray-500 mt-2">
                  Clicca su un giorno per modificare se il paziente deve assumere la terapia
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Diary Entries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Diario Paziente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {diaryEntries?.length ? (
                  diaryEntries.map((entry: any) => (
                    <div key={entry.id} className="border-b pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium">
                          {new Date(entry.date).toLocaleDateString('it-IT')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(entry.createdAt).toLocaleString('it-IT')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{entry.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Nessuna nota nel diario</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Symptoms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Sintomi Riportati
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {symptoms?.length ? (
                  symptoms.map((symptom: any) => (
                    <div key={symptom.id} className="border-b pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium">
                          {new Date(symptom.date).toLocaleDateString('it-IT')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(symptom.createdAt).toLocaleString('it-IT')}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{symptom.type}</span>
                          <Badge className={getSymptomBadgeColor(symptom.value)}>
                            {getSymptomSeverity(symptom.value)}
                          </Badge>
                        </div>
                        {symptom.notes && (
                          <p className="text-xs text-gray-600">{symptom.notes}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Nessun sintomo riportato</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}