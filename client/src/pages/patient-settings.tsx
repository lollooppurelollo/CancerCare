import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Bell, Clock, Pill, BookOpen, Heart, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import BottomNavigation from "@/components/ui/bottom-navigation";

interface NotificationSettings {
  medicationReminder: boolean;
  medicationTime: string;
  diaryReminder: boolean;
  diaryTime: string;
  symptomReminder: boolean;
  symptomTime: string;
}

export default function PatientSettings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: patient } = useQuery({
    queryKey: ["/api/patients/me"],
  });

  const [settings, setSettings] = useState<NotificationSettings>({
    medicationReminder: true,
    medicationTime: "09:00",
    diaryReminder: true,
    diaryTime: "20:00",
    symptomReminder: true,
    symptomTime: "18:00",
  });

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("notificationSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSettingsChange = (key: keyof NotificationSettings, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = () => {
    localStorage.setItem("notificationSettings", JSON.stringify(settings));
    toast({
      title: "Impostazioni salvate",
      description: "Le tue preferenze di notifica sono state aggiornate.",
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="text-sage-600 hover:text-sage-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Indietro
          </Button>
          <h1 className="text-xl font-bold text-sage-800">Impostazioni</h1>
          <div className="w-20"></div>
        </div>

        {/* Medication Reminder Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-sage-700">
              <Pill className="w-5 h-5 mr-2" />
              Promemoria Farmaco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="medication-reminder" className="text-sm font-medium">
                  Attiva promemoria farmaco
                </Label>
                <Switch
                  id="medication-reminder"
                  checked={settings.medicationReminder}
                  onCheckedChange={(checked) => handleSettingsChange("medicationReminder", checked)}
                />
              </div>
              
              {settings.medicationReminder && (
                <div className="space-y-2">
                  <Label htmlFor="medication-time" className="text-sm font-medium">
                    Orario promemoria
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-sage-600" />
                    <input
                      type="time"
                      id="medication-time"
                      value={settings.medicationTime}
                      onChange={(e) => handleSettingsChange("medicationTime", e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md focus:ring-sage-500 focus:border-sage-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Diary Reminder Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-sage-700">
              <BookOpen className="w-5 h-5 mr-2" />
              Promemoria Diario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="diary-reminder" className="text-sm font-medium">
                  Attiva promemoria diario
                </Label>
                <Switch
                  id="diary-reminder"
                  checked={settings.diaryReminder}
                  onCheckedChange={(checked) => handleSettingsChange("diaryReminder", checked)}
                />
              </div>
              
              {settings.diaryReminder && (
                <div className="space-y-2">
                  <Label htmlFor="diary-time" className="text-sm font-medium">
                    Orario promemoria
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-sage-600" />
                    <input
                      type="time"
                      id="diary-time"
                      value={settings.diaryTime}
                      onChange={(e) => handleSettingsChange("diaryTime", e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md focus:ring-sage-500 focus:border-sage-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Symptom Reminder Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-sage-700">
              <Heart className="w-5 h-5 mr-2" />
              Promemoria Sintomi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="symptom-reminder" className="text-sm font-medium">
                  Attiva promemoria sintomi
                </Label>
                <Switch
                  id="symptom-reminder"
                  checked={settings.symptomReminder}
                  onCheckedChange={(checked) => handleSettingsChange("symptomReminder", checked)}
                />
              </div>
              
              {settings.symptomReminder && (
                <div className="space-y-2">
                  <Label htmlFor="symptom-time" className="text-sm font-medium">
                    Orario promemoria
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-sage-600" />
                    <input
                      type="time"
                      id="symptom-time"
                      value={settings.symptomTime}
                      onChange={(e) => handleSettingsChange("symptomTime", e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md focus:ring-sage-500 focus:border-sage-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button 
          onClick={handleSaveSettings}
          className="w-full bg-sage-500 hover:bg-sage-600 transition-all duration-200 transform hover:scale-105"
        >
          <Save className="w-4 h-4 mr-2" />
          Salva Impostazioni
        </Button>

        <div className="text-sm text-gray-600 mt-4 p-4 bg-sage-50 rounded-lg border border-sage-200">
          <p className="font-medium mb-2 flex items-center text-sage-700">
            <Bell className="w-4 h-4 mr-2" />
            Notifiche
          </p>
          <p className="leading-relaxed">
            Le notifiche ti aiuteranno a ricordare di assumere il farmaco, compilare il diario e registrare i sintomi negli orari impostati.
          </p>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}