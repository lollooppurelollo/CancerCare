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

  const getSymptomName = (symptomType: string) => {
    const symptomNames: { [key: string]: string } = {
      'stanchezza': 'Stanchezza',
      'malessere': 'Malessere',
      'rash': 'Rash cutaneo',
      'diarrea': 'Diarrea',
      'dolore_addominale': 'Dolore addominale',
      'dolori_articolari': 'Dolori articolari',
      'febbre': 'Febbre',
      'sintomi_influenzali': 'Sintomi influenzali',
    };
    return symptomNames[symptomType] || symptomType;
  };

  const getSymptomValue = (symptom: any) => {
    if (symptom.symptomType === 'diarrea' && symptom.diarrheaCount) {
      return `${symptom.diarrheaCount} scariche`;
    }
    if (symptom.intensity) {
      return `${symptom.intensity}/10`;
    }
    if (symptom.present === false) {
      return 'Assente';
    }
    if (symptom.present === true) {
      return 'Presente';
    }
    return 'Non specificato';
  };

  // Funzione per determinare se un sintomo è riferito (ha un valore significativo)
  const hasSymptomValue = (symptom: any) => {
    if (symptom.symptomType === 'diarrea' && symptom.diarrheaCount && symptom.diarrheaCount > 0) {
      return true;
    }
    if (symptom.intensity && symptom.intensity > 0) {
      return true;
    }
    if (symptom.present === true) {
      return true;
    }
    return false;
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
                  patientId={patient.id}
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

          {/* History Tab - Unisce sintomi e diario */}
          {activeTab === "history" && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-sage-800">
                  Storico Sintomi e Diario
                </h2>
                <p className="text-sm text-gray-600">
                  Cronologia completa con sintomi riferiti e note del diario
                </p>
              </div>

              {/* Storico sintomi e diario per data */}
              <div className="space-y-4">
                {diaryEntries.slice().reverse().map((entry: any) => {
                  const entryDate = entry.date;
                  const daySymptoms = symptoms.filter((symptom: any) => 
                    symptom.date === entryDate && hasSymptomValue(symptom)
                  );
                  
                  // Mostra solo giorni con sintomi riferiti o con voce diario
                  if (daySymptoms.length === 0 && !entry.content.trim()) {
                    return null;
                  }

                  return (
                    <Card key={entry.id} className="border-l-4 border-sage-300">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-semibold text-sage-800">
                            {new Date(entryDate).toLocaleDateString('it-IT', { 
                              weekday: 'long', 
                              day: '2-digit', 
                              month: 'long',
                              year: 'numeric'
                            })}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(entry.updatedAt)}
                          </span>
                        </div>

                        {/* Sintomi riferiti per questo giorno */}
                        {daySymptoms.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-red-700 mb-2">Sintomi riferiti:</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {daySymptoms.map((symptom: any) => (
                                <div key={symptom.id} className="bg-red-50 p-2 rounded-lg">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-red-800">
                                      {getSymptomName(symptom.symptomType)}
                                    </span>
                                    <Badge variant="destructive" className="text-xs">
                                      {getSymptomValue(symptom)}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Voce diario */}
                        {entry.content.trim() && (
                          <div className="bg-sage-50 p-3 rounded-lg">
                            <h4 className="text-sm font-medium text-sage-700 mb-1">Diario:</h4>
                            <p className="text-sm text-gray-700">{entry.content}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Messaggio se nessun sintomo riferito */}
              {symptoms.filter((symptom: any) => hasSymptomValue(symptom)).length === 0 && 
               diaryEntries.filter((entry: any) => entry.content.trim()).length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">Nessun sintomo riferito o voce del diario</p>
                  </CardContent>
                </Card>
              )}
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
                  <div className="mt-4">
                    <Button
                      onClick={() => setLocation(`/doctor/patient-treatment-profile/${patientId}`)}
                      className="w-full bg-blue-500 hover:bg-blue-600"
                      size="sm"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Gestisci Trattamento
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
      </div>
    </div>
  );
}