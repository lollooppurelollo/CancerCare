import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useLocation } from "wouter";
import { ArrowLeft, Save, Calendar, FileText, Activity, Pill, Phone } from "lucide-react";
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
  abemaciclib: ["150mg BID", "100mg BID", "50mg BID"],
  ribociclib: ["600mg", "400mg", "200mg"],
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
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  const { data: patient, isLoading: patientLoading, error: patientError } = useQuery({
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

  const { data: doctors } = useQuery({
    queryKey: ["/api/doctors"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: missedMedications } = useQuery({
    queryKey: ["/api/missed-medication", patientId],
    enabled: !!patientId,
  });

  const updatePatientMutation = useMutation({
    mutationFn: async (data: { medication?: string; dosage?: string; assignedDoctorId?: number }) => {
      await apiRequest("PATCH", `/api/patients/${patientId}`, data);
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
    const updates: any = {};
    
    if (selectedMedication && selectedDosage) {
      updates.medication = selectedMedication;
      updates.dosage = selectedDosage;
    }
    
    if (selectedDoctorId && selectedDoctorId !== patient?.assignedDoctorId?.toString()) {
      updates.assignedDoctorId = parseInt(selectedDoctorId);
    }
    
    if (Object.keys(updates).length > 0) {
      updatePatientMutation.mutate(updates);
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

  if (patientError) {
    return (
      <div className="max-w-6xl mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Errore nel caricamento del paziente</p>
          <Button onClick={() => setLocation("/doctor")}>
            Torna al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-6xl mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Paziente non trovato</p>
          <Button onClick={() => setLocation("/doctor")}>
            Torna al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-white min-h-screen">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/doctor")}
              className="text-sage-600 mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-sage-800">
                {patient.firstName} {patient.lastName}
              </h1>
              {patient.birthDate && (
                <p className="text-sm text-gray-600">
                  Nato il {new Date(patient.birthDate).toLocaleDateString('it-IT')}
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={() => setLocation(`/doctor/chat/${patientId}`)}
            className="bg-sage-500 hover:bg-sage-600"
          >
            <Phone className="w-4 h-4 mr-2" />
            Chat
          </Button>
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
                    <Label htmlFor="assignedDoctor">Medico di Riferimento</Label>
                    <Select 
                      value={selectedDoctorId || patient.assignedDoctorId?.toString() || ""} 
                      onValueChange={setSelectedDoctorId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona medico" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors?.map((doctor: any) => (
                          <SelectItem key={doctor.id} value={doctor.id.toString()}>
                            {doctor.firstName} {doctor.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                    disabled={updatePatientMutation.isPending || (!selectedMedication && !selectedDoctorId) || (selectedMedication && !selectedDosage)}
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

          {/* Missed Medication Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Pill className="w-5 h-5 mr-2" />
                Terapie Non Assunte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {missedMedications && missedMedications.length > 0 ? (
                  missedMedications.map((entry: any) => (
                    <div key={entry.id} className="border rounded-lg p-3 bg-red-50 border-red-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className="bg-red-100 text-red-800">
                              {entry.missedDates?.length || 0} {entry.missedDates?.length === 1 ? 'dose mancata' : 'dosi mancate'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(entry.createdAt).toLocaleDateString('it-IT', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          {entry.missedDates && entry.missedDates.length > 0 && (
                            <div className="mb-2">
                              <p className="text-sm font-medium text-gray-700">Date mancate:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {entry.missedDates.map((date: string) => (
                                  <span key={date} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                    {new Date(date).toLocaleDateString('it-IT', {
                                      day: 'numeric',
                                      month: 'short'
                                    })}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {entry.notes && (
                            <div>
                              <p className="text-sm font-medium text-gray-700">Note:</p>
                              <p className="text-sm text-gray-600 italic">"{entry.notes}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Nessuna terapia non assunta segnalata</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}