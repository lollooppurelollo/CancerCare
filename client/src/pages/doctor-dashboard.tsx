import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, Settings, TriangleAlert, Eye, Video, MessageCircle, Calendar, BarChart3, CheckCircle, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import PatientCard from "@/components/ui/patient-card";

export default function DoctorDashboard() {
  const [firstNameSearch, setFirstNameSearch] = useState("");
  const [lastNameSearch, setLastNameSearch] = useState("");
  const [birthDateSearch, setBirthDateSearch] = useState("");
  const [, setLocation] = useLocation();
  const { logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const viewMode = localStorage.getItem("patientViewMode") || "all";
  const selectedDoctorId = localStorage.getItem("selectedDoctorId") || "";

  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["/api/alerts"],
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["/api/messages"],
  });

  const { data: allMissedMedications = [] } = useQuery({
    queryKey: ["/api/missed-medication/all"],
  });

  const { data: chatNotifications = [] } = useQuery({
    queryKey: ["/api/chat-notifications"],
  });

  const resolveAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      await apiRequest("POST", `/api/alerts/${alertId}/resolve`, {});
    },
    onSuccess: () => {
      toast({
        title: "Avviso risolto",
        description: "L'avviso è stato rimosso dalla lista degli avvisi attivi.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile risolvere l'avviso.",
        variant: "destructive",
      });
    },
  });

  const dismissChatNotificationMutation = useMutation({
    mutationFn: async (patientId: number) => {
      await apiRequest("PUT", `/api/chat-notifications/${patientId}/dismiss`, {});
    },
    onSuccess: () => {
      toast({
        title: "Notifica rimossa",
        description: "La notifica chat è stata rimossa dalla dashboard.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/chat-notifications"] });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile rimuovere la notifica.",
        variant: "destructive",
      });
    },
  });

  const filteredPatients = patients.filter((patient: any) => {
    const firstNameMatch = firstNameSearch === "" || 
      patient.firstName.toLowerCase().includes(firstNameSearch.toLowerCase());
    
    const lastNameMatch = lastNameSearch === "" || 
      patient.lastName.toLowerCase().includes(lastNameSearch.toLowerCase());
    
    const birthDateMatch = birthDateSearch === "" || 
      (patient.birthDate && patient.birthDate.includes(birthDateSearch));
    
    // Apply doctor filter if in doctor mode
    const doctorMatch = viewMode === "all" || 
      (viewMode === "doctor" && patient.assignedDoctorId && patient.assignedDoctorId.toString() === selectedDoctorId);
    
    return firstNameMatch && lastNameMatch && birthDateMatch && doctorMatch;
  });

  // Filter alerts by doctor if in doctor mode
  const filteredAlerts = alerts.filter((alert: any) => {
    if (viewMode === "all") return true;
    const patient = patients.find((p: any) => p.id === alert.patientId);
    return patient && patient.assignedDoctorId && patient.assignedDoctorId.toString() === selectedDoctorId;
  });

  const urgentAlerts = filteredAlerts.filter((alert: any) => alert.severity === "high");
  const messageAlerts = filteredAlerts.filter((alert: any) => alert.type === "message");
  
  // Filter missed medication alerts by doctor and count > 5
  const missedMedicationAlerts = allMissedMedications.filter((entry: any) => {
    const missedDatesCount = entry.missedDates ? entry.missedDates.length : 0;
    if (missedDatesCount <= 5) return false;
    
    if (viewMode === "all") return true;
    const patient = patients.find((p: any) => p.id === entry.patientId);
    return patient && patient.assignedDoctorId && patient.assignedDoctorId.toString() === selectedDoctorId;
  });

  // Filter chat notifications by doctor
  const filteredChatNotifications = chatNotifications.filter((notification: any) => {
    if (viewMode === "all") return true;
    const patient = patients.find((p: any) => p.id === notification.patientId);
    return patient && patient.assignedDoctorId && patient.assignedDoctorId.toString() === selectedDoctorId;
  });
  
  // Apply doctor filter to all statistics
  const statisticsPatients = patients.filter((patient: any) => {
    return viewMode === "all" || 
      (viewMode === "doctor" && patient.assignedDoctorId && patient.assignedDoctorId.toString() === selectedDoctorId);
  });

  // Conteggio pazienti per farmaco (filtrati per medico se necessario)
  const patientsByDrug = statisticsPatients.reduce((acc: any, patient: any) => {
    const drug = patient.medication || "non specificato";
    acc[drug] = (acc[drug] || 0) + 1;
    return acc;
  }, {});
  
  const abemaciclibCount = patientsByDrug.abemaciclib || 0;
  const ribociclibCount = patientsByDrug.ribociclib || 0;
  const palbociclibCount = patientsByDrug.palbociclib || 0;

  const getPatientName = (patientId: number) => {
    const patient = patients.find((p: any) => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : "Paziente sconosciuto";
  };

  // Carica i dati dei medici usando React Query
  const { data: doctorsData } = useQuery({
    queryKey: ["/api/doctors"],
    retry: false,
  });

  const getPatientDoctor = (patientId: number) => {
    const patient = patients.find((p: any) => p.id === patientId);
    if (!patient || !patient.assignedDoctorId) return "Nessun medico assegnato";
    
    if (doctorsData) {
      const doctor = doctorsData.find((d: any) => d.id === patient.assignedDoctorId);
      if (doctor) {
        return `Medico: ${doctor.firstName} ${doctor.lastName}`;
      }
    }
    return `Medico ID: ${patient.assignedDoctorId}`;
  };

  const getPatientBirthDate = (patientId: number) => {
    const patient = patients.find((p: any) => p.id === patientId);
    if (!patient?.birthDate) return "";
    const birthDate = new Date(patient.birthDate);
    return birthDate.toLocaleDateString('it-IT');
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-50 border-red-200 text-red-800";
      case "medium":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  const formatTimestamp = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("it-IT", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const handleVideoCall = (patientId: number) => {
    const patient = patients.find((p: any) => p.id === patientId);
    if (patient) {
      const meetingTitle = `Consulenza medica con ${patient.firstName} ${patient.lastName}`;
      const meetUrl = `https://meet.google.com/new?title=${encodeURIComponent(meetingTitle)}`;
      window.open(meetUrl, '_blank');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-sage-800">Dashboard Medico</h1>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-600 hover:text-blue-700 transition-all duration-200 hover:scale-105"
              onClick={() => setLocation("/doctor/advanced-analytics")}
              title="Statistiche Avanzate"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sage-600 hover:text-sage-700 transition-all duration-200 hover:scale-105"
              onClick={() => setLocation("/settings")}
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => logout()}
              className="text-sage-600"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Quick Stats - Solo contatori */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            <TriangleAlert className="inline w-5 h-5 mr-2 text-red-500" />
            Avvisi e messaggi
          </h2>
          
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => {
                const urgentSection = document.getElementById('urgent-alerts-section');
                urgentSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-red-50 p-2 rounded-lg border border-red-200 hover:bg-red-100 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 text-left"
            >
              <div className="text-lg font-bold text-red-600 transition-transform duration-200 hover:scale-110">{urgentAlerts.length}</div>
              <div className="text-xs text-gray-600">Avvisi urgenti</div>
            </button>
            <button 
              onClick={() => {
                const messageSection = document.getElementById('message-alerts-section');
                messageSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-orange-50 p-2 rounded-lg border border-orange-200 hover:bg-orange-100 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 text-left"
            >
              <div className="text-lg font-bold text-orange-600 transition-transform duration-200 hover:scale-110">{messageAlerts.length}</div>
              <div className="text-xs text-gray-600">Messaggi importanti</div>
            </button>
            <button 
              onClick={() => {
                const chatSection = document.getElementById('chat-notifications-section');
                chatSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-blue-50 p-2 rounded-lg border border-blue-200 hover:bg-blue-100 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 text-left"
            >
              <div className="text-lg font-bold text-blue-600 transition-transform duration-200 hover:scale-110">{filteredChatNotifications.length}</div>
              <div className="text-xs text-gray-600">Messaggi chat</div>
            </button>
          </div>
        </div>

        {/* Numero di pazienti totali */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Numero di pazienti totali
          </h2>
          
          {/* Pazienti totali - riga intera */}
          <div className="mb-3">
            <div className="bg-sage-50 p-4 rounded-lg border border-sage-200 text-center">
              <div className="text-2xl font-bold text-sage-600">{statisticsPatients.length}</div>
              <div className="text-sm text-gray-600">Pazienti Totali</div>
            </div>
          </div>
          
          {/* Farmaci - stessa riga */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="text-xl font-bold text-green-600">{abemaciclibCount}</div>
              <div className="text-xs text-gray-600">Abemaciclib</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="text-xl font-bold text-blue-600">{ribociclibCount}</div>
              <div className="text-xs text-gray-600">Ribociclib</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <div className="text-xl font-bold text-purple-600">{palbociclibCount}</div>
              <div className="text-xs text-gray-600">Palbociclib</div>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        <div className="mb-6" id="alerts-section">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            <TriangleAlert className="inline w-5 h-5 mr-2 text-red-500" />
            Avvisi ({filteredAlerts.length})
          </h2>
          
          {filteredAlerts.length > 0 && (
            <div className="space-y-6">
              {/* Avvisi urgenti */}
              {urgentAlerts.length > 0 && (
                <div id="urgent-alerts-section">
                  <h3 className="text-md font-medium text-red-700 mb-3 flex items-center">
                    <TriangleAlert className="w-4 h-4 mr-2" />
                    Avvisi urgenti ({urgentAlerts.length})
                  </h3>
                  <div className="space-y-3">
                    {urgentAlerts.map((alert: any) => (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-lg border ${getAlertColor(alert.severity)} relative`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 pr-4">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="font-medium">{alert.message}</p>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                Sintomo
                              </span>
                            </div>
                            <button
                              onClick={() => setLocation(`/doctor/patient-view/${alert.patientId}`)}
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                            >
                              {getPatientName(alert.patientId)} {getPatientBirthDate(alert.patientId) && `(nato il ${getPatientBirthDate(alert.patientId)})`}
                            </button>
                            <p className="text-xs opacity-75 mt-1">
                              {formatTimestamp(alert.createdAt)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {getPatientDoctor(alert.patientId)}
                            </p>
                            
                            {/* Pulsante Risolto in basso a sinistra */}
                            <div className="mt-3">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600 text-xs px-2 py-1 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
                                onClick={() => resolveAlertMutation.mutate(alert.id)}
                                disabled={resolveAlertMutation.isPending}
                                title="Contrassegna come risolto"
                              >
                                <CheckCircle className="w-3 h-3 mr-1 transition-transform duration-200 hover:scale-110" />
                                Risolto
                              </Button>
                            </div>
                          </div>
                          
                          {/* Pulsanti principali a destra */}
                          <div className="flex flex-col space-y-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-sage-500 hover:bg-sage-600 text-white border-sage-500 hover:border-sage-600 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
                              onClick={() => setLocation(`/doctor/patient-view/${alert.patientId}`)}
                              title="Visualizza profilo paziente"
                            >
                              <Eye className="w-4 h-4 mr-2 transition-transform duration-200 hover:scale-110" />
                              Profilo
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500 hover:border-blue-600 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
                              onClick={() => setLocation(`/doctor/chat/${alert.patientId}`)}
                              title="Chat con paziente"
                            >
                              <MessageCircle className="w-4 h-4 mr-2 transition-transform duration-200 hover:scale-110" />
                              Chat
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-purple-500 hover:bg-purple-600 text-white border-purple-500 hover:border-purple-600 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
                              onClick={() => handleVideoCall(alert.patientId)}
                              title="Avvia videochiamata Google Meet"
                            >
                              <Video className="w-4 h-4 mr-2 transition-transform duration-200 hover:scale-110" />
                              Video
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Messaggi pazienti */}
              {messageAlerts.length > 0 && (
                <div id="message-alerts-section">
                  <h3 className="text-md font-medium text-orange-700 mb-3 flex items-center">
                    <MessageCircle className="w-4 h-4 mr-2 transition-transform duration-200 hover:scale-110" />
                    Messaggi importanti ({messageAlerts.length})
                  </h3>
                  <div className="space-y-3">
                    {messageAlerts.map((alert: any) => (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-lg border ${getAlertColor(alert.severity)} relative`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 pr-4">
                            <div className="mb-2">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                  Messaggio
                                </span>
                              </div>
                              <div className="bg-white p-3 rounded-md border-l-4 border-blue-400">
                                <p className="text-sm text-gray-800 leading-relaxed">{alert.message}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setLocation(`/doctor/patient-view/${alert.patientId}`)}
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                            >
                              {getPatientName(alert.patientId)} {getPatientBirthDate(alert.patientId) && `(nato il ${getPatientBirthDate(alert.patientId)})`}
                            </button>
                            <p className="text-xs opacity-75 mt-1">
                              {formatTimestamp(alert.createdAt)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {getPatientDoctor(alert.patientId)}
                            </p>
                            
                            {/* Pulsante Risolto in basso a sinistra */}
                            <div className="mt-3">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600 text-xs px-2 py-1 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
                                onClick={() => resolveAlertMutation.mutate(alert.id)}
                                disabled={resolveAlertMutation.isPending}
                                title="Contrassegna come risolto"
                              >
                                <CheckCircle className="w-3 h-3 mr-1 transition-transform duration-200 hover:scale-110" />
                                Risolto
                              </Button>
                            </div>
                          </div>
                          
                          {/* Pulsanti principali a destra */}
                          <div className="flex flex-col space-y-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-sage-500 hover:bg-sage-600 text-white border-sage-500 hover:border-sage-600 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
                              onClick={() => setLocation(`/doctor/patient-view/${alert.patientId}`)}
                              title="Visualizza profilo paziente"
                            >
                              <Eye className="w-4 h-4 mr-2 transition-transform duration-200 hover:scale-110" />
                              Profilo
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500 hover:border-blue-600 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
                              onClick={() => setLocation(`/doctor/chat/${alert.patientId}`)}
                              title="Chat con paziente"
                            >
                              <MessageCircle className="w-4 h-4 mr-2 transition-transform duration-200 hover:scale-110" />
                              Chat
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-purple-500 hover:bg-purple-600 text-white border-purple-500 hover:border-purple-600 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
                              onClick={() => handleVideoCall(alert.patientId)}
                              title="Avvia videochiamata Google Meet"
                            >
                              <Video className="w-4 h-4 mr-2 transition-transform duration-200 hover:scale-110" />
                              Video
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Notifications */}
              {filteredChatNotifications.length > 0 && (
                <div id="chat-notifications-section">
                  <h3 className="text-md font-medium text-blue-700 mb-3 flex items-center">
                    <MessageCircle className="w-4 h-4 mr-2 transition-transform duration-200 hover:scale-110" />
                    Messaggi chat ({filteredChatNotifications.length})
                  </h3>
                  <div className="space-y-2">
                    {filteredChatNotifications.map((notification: any) => (
                      <div
                        key={notification.id}
                        className="p-3 rounded-lg border bg-blue-50 border-blue-200 text-blue-800 relative"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                Chat
                              </span>
                            </div>
                            <div className="bg-white p-2 rounded-md border-l-4 border-blue-400 mb-2">
                              <p className="text-sm text-gray-800 leading-relaxed truncate">
                                {notification.content}
                              </p>
                            </div>
                            <button
                              onClick={() => setLocation(`/doctor/patient-view/${notification.patientId}`)}
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium block truncate"
                            >
                              {getPatientName(notification.patientId)} {getPatientBirthDate(notification.patientId) && `(nato il ${getPatientBirthDate(notification.patientId)})`}
                            </button>
                            <p className="text-xs opacity-75 mt-1">
                              {formatTimestamp(notification.createdAt)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {getPatientDoctor(notification.patientId)}
                            </p>
                          </div>
                          
                          {/* Pulsanti compatti */}
                          <div className="flex flex-col gap-1">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500 hover:border-blue-600 text-xs px-2 py-1 transition-all duration-200 hover:scale-105"
                              onClick={() => setLocation(`/doctor/chat/${notification.patientId}`)}
                              title="Apri chat"
                            >
                              <MessageCircle className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-gray-500 hover:bg-gray-600 text-white border-gray-500 hover:border-gray-600 text-xs px-2 py-1 transition-all duration-200 hover:scale-105"
                              onClick={() => dismissChatNotificationMutation.mutate(notification.patientId)}
                              disabled={dismissChatNotificationMutation.isPending}
                              title="Rimuovi notifica"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missed Medication Alerts */}
              {missedMedicationAlerts.length > 0 && (
                <div id="missed-medication-alerts-section">
                  <h3 className="text-md font-medium text-orange-700 mb-3 flex items-center">
                    <XCircle className="w-4 h-4 mr-2 transition-transform duration-200 hover:scale-110" />
                    Pazienti con più di 5 terapie mancate ({missedMedicationAlerts.length})
                  </h3>
                  <div className="space-y-3">
                    {missedMedicationAlerts.map((entry: any, index: number) => (
                      <div
                        key={`${entry.id}-${index}`}
                        className="p-4 rounded-lg border bg-orange-50 border-orange-200 text-orange-800 relative"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 pr-4">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="font-medium">
                                {entry.missedDates?.length || 0} {entry.missedDates?.length === 1 ? 'dose mancata' : 'dosi mancate'}
                              </p>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                Terapia
                              </span>
                            </div>
                            <button
                              onClick={() => setLocation(`/doctor/patient-view/${entry.patientId}`)}
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                            >
                              {getPatientName(entry.patientId)} {getPatientBirthDate(entry.patientId) && `(nato il ${getPatientBirthDate(entry.patientId)})`}
                            </button>
                            <p className="text-xs opacity-75 mt-1">
                              Ultima dose mancata: {entry.missedDates && entry.missedDates.length > 0 
                                ? new Date(entry.missedDates[entry.missedDates.length - 1]).toLocaleDateString('it-IT', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                  })
                                : 'Non disponibile'
                              }
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {getPatientDoctor(entry.patientId)}
                            </p>
                            {entry.notes && (
                              <p className="text-xs mt-1 italic">
                                "{entry.notes}"
                              </p>
                            )}
                          </div>
                          
                          {/* Pulsanti principali a destra */}
                          <div className="flex flex-col space-y-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-sage-500 hover:bg-sage-600 text-white border-sage-500 hover:border-sage-600 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
                              onClick={() => setLocation(`/doctor/patient-view/${entry.patientId}`)}
                              title="Visualizza profilo paziente"
                            >
                              <Eye className="w-4 h-4 mr-2 transition-transform duration-200 hover:scale-110" />
                              Profilo
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500 hover:border-blue-600 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
                              onClick={() => setLocation(`/doctor/chat/${entry.patientId}`)}
                              title="Chat con paziente"
                            >
                              <MessageCircle className="w-4 h-4 mr-2 transition-transform duration-200 hover:scale-110" />
                              Chat
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-purple-500 hover:bg-purple-600 text-white border-purple-500 hover:border-purple-600 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
                              onClick={() => handleVideoCall(entry.patientId)}
                              title="Avvia videochiamata Google Meet"
                            >
                              <Video className="w-4 h-4 mr-2 transition-transform duration-200 hover:scale-110" />
                              Video
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Cerca paziente</h3>
          <div className="space-y-3">
            {/* Campo nome */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                className="pl-10 focus:ring-sage-500 focus:border-sage-500"
                placeholder="Nome..."
                value={firstNameSearch}
                onChange={(e) => setFirstNameSearch(e.target.value)}
              />
            </div>
            
            {/* Campo cognome */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                className="pl-10 focus:ring-sage-500 focus:border-sage-500"
                placeholder="Cognome..."
                value={lastNameSearch}
                onChange={(e) => setLastNameSearch(e.target.value)}
              />
            </div>
            
            {/* Campo data di nascita */}
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                className="pl-10 focus:ring-sage-500 focus:border-sage-500"
                placeholder="Data di nascita (DD/MM/YYYY)..."
                value={birthDateSearch}
                onChange={(e) => setBirthDateSearch(e.target.value)}
              />
            </div>
            
            {/* Pulsante per pulire i filtri */}
            {(firstNameSearch || lastNameSearch || birthDateSearch) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFirstNameSearch("");
                  setLastNameSearch("");
                  setBirthDateSearch("");
                }}
                className="w-full"
              >
                <X className="w-4 h-4 mr-2" />
                Pulisci filtri
              </Button>
            )}
          </div>
        </div>

        {/* Patient List */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Pazienti {(firstNameSearch || lastNameSearch || birthDateSearch) && `(${filteredPatients.length} risultati)`}
          </h2>
          
          <div className="space-y-3">
            {filteredPatients.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {(firstNameSearch || lastNameSearch || birthDateSearch) ? "Nessun paziente trovato con i criteri di ricerca" : "Nessun paziente registrato"}
                </p>
              </div>
            ) : (
              filteredPatients.map((patient: any) => (
                <PatientCard key={patient.id} patient={patient} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
