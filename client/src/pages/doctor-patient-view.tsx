import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Calendar, MessageCircle, Heart, Activity, Settings, Video, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MedicationCalendar from "@/components/ui/medication-calendar";

export default function DoctorPatientView() {
  const [match, params] = useRoute("/doctor/patient-view/:patientId");
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("home");
  const patientId = params?.patientId ? parseInt(params.patientId) : null;

  const { data: patient } = useQuery({
    queryKey: ["/api/patients", patientId],
    enabled: !!patientId,
  });

  const { data: diaryEntries = [] } = useQuery({
    queryKey: ["/api/diary-entries", patientId],
    enabled: !!patientId,
  });

  const { data: symptoms = [] } = useQuery({
    queryKey: ["/api/symptoms", patientId],
    enabled: !!patientId,
  });

  const { data: medicationSchedules = [] } = useQuery({
    queryKey: ["/api/medication-schedules", patientId],
    enabled: !!patientId,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["/api/messages", patientId],
    enabled: !!patientId,
  });

  if (!patient) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Caricamento interfaccia paziente...</p>
          <Button onClick={() => setLocation("/doctor")}>
            Torna al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const todayDate = new Date().toISOString().split('T')[0];
  const todayEntry = diaryEntries.find((entry: any) => entry.date === todayDate);
  const todaySymptoms = symptoms.filter((symptom: any) => symptom.date === todayDate);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSymptomValue = (symptom: any) => {
    switch (symptom.type) {
      case 'scale':
        return `${symptom.value}/10`;
      case 'boolean':
        return symptom.value ? 'Sì' : 'No';
      case 'text':
        return symptom.value || 'Non specificato';
      default:
        return symptom.value?.toString() || 'Non specificato';
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/doctor")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-sage-800">
              Vista Paziente
            </h1>
            <p className="text-sm text-gray-600">
              {patient.firstName} {patient.lastName}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setLocation(`/doctor/chat/${patientId}`)}
            className="bg-sage-500 hover:bg-sage-600"
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex justify-center space-x-2 mb-4">
            <Button 
              onClick={() => setActiveTab("home")}
              variant={activeTab === "home" ? "default" : "outline"}
              size="sm"
              className="flex flex-col items-center py-2 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Calendar className={`w-4 h-4 mb-1 transition-all duration-200 ${
                activeTab === "home" ? "scale-110" : "hover:scale-110"
              }`} />
              <span className="text-xs">Home</span>
            </Button>
            <Button 
              onClick={() => setActiveTab("symptoms")}
              variant={activeTab === "symptoms" ? "default" : "outline"}
              size="sm"
              className="flex flex-col items-center py-2 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Heart className={`w-4 h-4 mb-1 transition-all duration-200 ${
                activeTab === "symptoms" ? "scale-110" : "hover:scale-110"
              }`} />
              <span className="text-xs">Sintomi</span>
            </Button>
            <Button 
              onClick={() => setActiveTab("history")}
              variant={activeTab === "history" ? "default" : "outline"}
              size="sm"
              className="flex flex-col items-center py-2 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Activity className={`w-4 h-4 mb-1 transition-all duration-200 ${
                activeTab === "history" ? "scale-110" : "hover:scale-110"
              }`} />
              <span className="text-xs">Storico</span>
            </Button>
            <Button 
              onClick={() => setActiveTab("video")}
              variant={activeTab === "video" ? "default" : "outline"}
              size="sm"
              className="flex flex-col items-center py-2 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Video className={`w-4 h-4 mb-1 transition-all duration-200 ${
                activeTab === "video" ? "scale-110" : "hover:scale-110"
              }`} />
              <span className="text-xs">Video</span>
            </Button>
            <Button 
              onClick={() => setActiveTab("profile")}
              variant={activeTab === "profile" ? "default" : "outline"}
              size="sm"
              className="flex flex-col items-center py-2 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <User className={`w-4 h-4 mb-1 transition-all duration-200 ${
                activeTab === "profile" ? "scale-110" : "hover:scale-110"
              }`} />
              <span className="text-xs">Profilo</span>
            </Button>
          </div>
        </div>

          {/* Home Tab */}
          {activeTab === "home" && (
            <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-sage-800 mb-2">
                Ciao {patient.firstName}!
              </h2>
              <p className="text-sm text-gray-600">
                Oggi, {new Date().toLocaleDateString('it-IT', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            {/* Medication Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sage-800">Calendario Terapia</CardTitle>
              </CardHeader>
              <CardContent>
                <MedicationCalendar 
                  medication={patient.medication}
                />
              </CardContent>
            </Card>

            {/* Today's Entry */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sage-800">Diario di Oggi</CardTitle>
              </CardHeader>
              <CardContent>
                {todayEntry ? (
                  <div className="space-y-2">
                    <p className="text-sm">{todayEntry.content}</p>
                    <p className="text-xs text-gray-500">
                      Aggiornato alle {formatTimestamp(todayEntry.updatedAt)}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nessuna voce per oggi</p>
                )}
              </CardContent>
            </Card>
            </div>
          )}

          {/* Symptoms Tab */}
          {activeTab === "symptoms" && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-sage-800">
                  Monitoraggio Sintomi
                </h2>
                <p className="text-sm text-gray-600">
                  Sintomi registrati oggi
                </p>
              </div>

              {todaySymptoms.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">Nessun sintomo registrato oggi</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {todaySymptoms.map((symptom: any) => (
                    <Card key={symptom.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sage-800">
                            {symptom.name}
                          </span>
                          <Badge variant="secondary">
                            {getSymptomValue(symptom)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimestamp(symptom.createdAt)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-sage-800">
                  Storico Registrazioni
                </h2>
              </div>

              <div className="space-y-3">
                {diaryEntries.slice(0, 10).map((entry: any) => (
                  <Card key={entry.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sage-800">
                          {new Date(entry.date).toLocaleDateString('it-IT')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(entry.updatedAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{entry.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Video Tab */}
          {activeTab === "video" && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-sage-800">
                  Teleconsulto
                </h2>
                <p className="text-sm text-gray-600">
                  Comunicazione con il medico
                </p>
              </div>

              <Card>
                <CardContent className="p-6 text-center">
                  <Video className="w-16 h-16 mx-auto mb-4 text-sage-600" />
                  <h3 className="font-semibold text-sage-800 mb-2">
                    Videoconsulto
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Prenota una videoconsulenza con il tuo medico
                  </p>
                  <Button className="bg-sage-500 hover:bg-sage-600">
                    Prenota Consulto
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Messages */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sage-800">Messaggi Recenti</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {messages.slice(0, 3).map((message: any) => (
                      <div key={message.id} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimestamp(message.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-sage-800">
                  Profilo Paziente
                </h2>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sage-800">Informazioni Personali</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Nome</p>
                      <p className="text-sm">{patient.firstName} {patient.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Età</p>
                      <p className="text-sm">{patient.age} anni</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Peso</p>
                      <p className="text-sm">{patient.weight} kg</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Altezza</p>
                      <p className="text-sm">{patient.height} cm</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sage-800">Trattamento Attuale</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Farmaco:</span> {patient.medication}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Dosaggio:</span> {patient.dosage}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
      </div>
    </div>
  );
}