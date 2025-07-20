import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Calendar, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function DoctorPatientTreatmentProfile() {
  const { patientId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [treatmentProfile, setTreatmentProfile] = useState({
    actualTreatmentStartDate: "",
    firstDosageReductionDate: "",
    secondDosageReductionDate: "",
    treatmentInterruptionDate: "",
    adherenceCalculationStartDate: "",
  });

  const [selectedDate, setSelectedDate] = useState("");
  const [eventType, setEventType] = useState<"pause" | "missed">("pause");
  const [eventNotes, setEventNotes] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: patient } = useQuery({
    queryKey: ["/api/patients", patientId],
    enabled: !!patientId,
  });

  const { data: calendarEvents = [] } = useQuery({
    queryKey: ["/api/calendar-events", patientId],
    enabled: !!patientId,
  });

  // Set initial values when patient data loads
  useEffect(() => {
    if (patient) {
      setTreatmentProfile({
        actualTreatmentStartDate: patient.actualTreatmentStartDate || "",
        firstDosageReductionDate: patient.firstDosageReductionDate || "",
        secondDosageReductionDate: patient.secondDosageReductionDate || "",
        treatmentInterruptionDate: patient.treatmentInterruptionDate || "",
        adherenceCalculationStartDate: patient.adherenceCalculationStartDate || "",
      });
    }
  }, [patient]);

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      return await apiRequest("PUT", `/api/patients/${patientId}/treatment-profile`, profileData);
    },
    onSuccess: () => {
      toast({
        title: "Profilo trattamento aggiornato",
        description: "Le informazioni del trattamento sono state salvate con successo.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/patients", patientId] });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il profilo del trattamento.",
        variant: "destructive",
      });
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      return await apiRequest("POST", "/api/calendar-events", eventData);
    },
    onSuccess: () => {
      toast({
        title: "Evento calendario aggiunto",
        description: "L'evento è stato aggiunto al calendario del paziente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/calendar-events", patientId] });
      setSelectedDate("");
      setEventNotes("");
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile aggiungere l'evento al calendario.",
        variant: "destructive",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      return await apiRequest("DELETE", `/api/calendar-events/${eventId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Evento rimosso",
        description: "L'evento è stato rimosso dal calendario.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/calendar-events", patientId] });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile rimuovere l'evento.",
        variant: "destructive",
      });
    },
  });

  const handleProfileUpdate = () => {
    updateProfileMutation.mutate(treatmentProfile);
  };

  const handleAddEvent = () => {
    if (!selectedDate) {
      toast({
        title: "Errore",
        description: "Seleziona una data per l'evento.",
        variant: "destructive",
      });
      return;
    }

    createEventMutation.mutate({
      patientId: parseInt(patientId!),
      date: selectedDate,
      eventType,
      notes: eventNotes,
    });
  };

  const handleDeleteEvent = (eventId: number) => {
    deleteEventMutation.mutate(eventId);
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case "pause":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "missed":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-green-100 text-green-800 border-green-300";
    }
  };

  const getEventTypeLabel = (eventType: string) => {
    switch (eventType) {
      case "pause":
        return "Pausa terapia";
      case "missed":
        return "Mancata assunzione";
      default:
        return "Normale";
    }
  };

  if (!patient) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation(`/doctor/patient-view/${patientId}`)}
            className="text-sage-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Indietro
          </Button>
          <h1 className="text-xl font-bold text-sage-800">Profilo Trattamento</h1>
        </div>

        {/* Patient Info */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            {patient.firstName} {patient.lastName}
          </h2>
          <p className="text-sm text-gray-600">
            {patient.medication} - {patient.dosage}
          </p>
        </div>

        {/* Treatment Profile Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-sage-800">Date importanti del trattamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="actualTreatmentStartDate">Inizio trattamento effettivo</Label>
              <Input
                id="actualTreatmentStartDate"
                type="date"
                value={treatmentProfile.actualTreatmentStartDate}
                onChange={(e) =>
                  setTreatmentProfile({
                    ...treatmentProfile,
                    actualTreatmentStartDate: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="firstDosageReductionDate">Prima riduzione dosaggio</Label>
              <Input
                id="firstDosageReductionDate"
                type="date"
                value={treatmentProfile.firstDosageReductionDate}
                onChange={(e) =>
                  setTreatmentProfile({
                    ...treatmentProfile,
                    firstDosageReductionDate: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="secondDosageReductionDate">Seconda riduzione dosaggio</Label>
              <Input
                id="secondDosageReductionDate"
                type="date"
                value={treatmentProfile.secondDosageReductionDate}
                onChange={(e) =>
                  setTreatmentProfile({
                    ...treatmentProfile,
                    secondDosageReductionDate: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="treatmentInterruptionDate">Interruzione trattamento</Label>
              <Input
                id="treatmentInterruptionDate"
                type="date"
                value={treatmentProfile.treatmentInterruptionDate}
                onChange={(e) =>
                  setTreatmentProfile({
                    ...treatmentProfile,
                    treatmentInterruptionDate: e.target.value,
                  })
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Lascia vuoto se il trattamento non è stato interrotto
              </p>
            </div>

            <div>
              <Label htmlFor="adherenceCalculationStartDate">Inizio calcolo aderenza</Label>
              <Input
                id="adherenceCalculationStartDate"
                type="date"
                value={treatmentProfile.adherenceCalculationStartDate}
                onChange={(e) =>
                  setTreatmentProfile({
                    ...treatmentProfile,
                    adherenceCalculationStartDate: e.target.value,
                  })
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Data da cui calcolare l'aderenza (inizio uso app)
              </p>
            </div>

            <Button
              onClick={handleProfileUpdate}
              disabled={updateProfileMutation.isPending}
              className="w-full bg-sage-500 hover:bg-sage-600"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateProfileMutation.isPending ? "Salvando..." : "Salva Profilo"}
            </Button>
          </CardContent>
        </Card>

        {/* Calendar Management */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-sage-800">Gestione Calendario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="selectedDate">Data evento</Label>
              <Input
                id="selectedDate"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="eventType">Tipo evento</Label>
              <Select value={eventType} onValueChange={(value: "pause" | "missed") => setEventType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pause">Pausa terapia (grigio)</SelectItem>
                  <SelectItem value="missed">Mancata assunzione (rosso)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="eventNotes">Note evento</Label>
              <Textarea
                id="eventNotes"
                value={eventNotes}
                onChange={(e) => setEventNotes(e.target.value)}
                placeholder="Note aggiuntive per l'evento..."
                rows={2}
              />
            </div>

            <Button
              onClick={handleAddEvent}
              disabled={createEventMutation.isPending}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              <Calendar className="w-4 h-4 mr-2" />
              {createEventMutation.isPending ? "Aggiungendo..." : "Aggiungi Evento"}
            </Button>
          </CardContent>
        </Card>

        {/* Existing Calendar Events */}
        {calendarEvents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-sage-800">Eventi Calendario Esistenti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {calendarEvents.map((event: any) => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg border ${getEventColor(event.eventType)} flex items-center justify-between`}
                  >
                    <div>
                      <p className="font-medium">
                        {new Date(event.date).toLocaleDateString('it-IT')}
                      </p>
                      <p className="text-sm">{getEventTypeLabel(event.eventType)}</p>
                      {event.notes && (
                        <p className="text-xs mt-1 opacity-75">{event.notes}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEvent(event.id)}
                      disabled={deleteEventMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}