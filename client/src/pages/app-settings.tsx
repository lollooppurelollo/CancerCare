import { useState } from "react";
import { ArrowLeft, Bell, Clock, Save } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AppSettings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [medicationReminderTime, setMedicationReminderTime] = useState("08:00");
  const [symptomReminderTime, setSymptomReminderTime] = useState("20:00");
  const [diaryReminderTime, setDiaryReminderTime] = useState("21:00");

  const handleSaveSettings = () => {
    // Here you would typically save to localStorage or send to API
    localStorage.setItem("app_settings", JSON.stringify({
      notificationsEnabled,
      medicationReminderTime,
      symptomReminderTime,
      diaryReminderTime,
    }));

    toast({
      title: "Impostazioni salvate",
      description: "Le tue preferenze sono state aggiornate con successo.",
    });
  };

  const timeOptions = [
    { value: "06:00", label: "6:00" },
    { value: "07:00", label: "7:00" },
    { value: "08:00", label: "8:00" },
    { value: "09:00", label: "9:00" },
    { value: "10:00", label: "10:00" },
    { value: "11:00", label: "11:00" },
    { value: "12:00", label: "12:00" },
    { value: "13:00", label: "13:00" },
    { value: "14:00", label: "14:00" },
    { value: "15:00", label: "15:00" },
    { value: "16:00", label: "16:00" },
    { value: "17:00", label: "17:00" },
    { value: "18:00", label: "18:00" },
    { value: "19:00", label: "19:00" },
    { value: "20:00", label: "20:00" },
    { value: "21:00", label: "21:00" },
    { value: "22:00", label: "22:00" },
  ];

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="text-sage-600 mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-sage-800">Impostazioni App</h1>
        </div>

        <div className="space-y-6">
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-sage-800 flex items-center">
                <Bell className="mr-2 w-5 h-5" />
                Notifiche
              </CardTitle>
              <CardDescription>
                Configura i promemoria per assumere i farmaci e compilare il diario
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications" className="text-sm font-medium">
                  Abilita notifiche
                </Label>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>

              {notificationsEnabled && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Promemoria farmaco</Label>
                      <p className="text-xs text-gray-500">Ricordati di assumere la terapia</p>
                    </div>
                    <Select value={medicationReminderTime} onValueChange={setMedicationReminderTime}>
                      <SelectTrigger className="w-24 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time.value} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Promemoria sintomi</Label>
                      <p className="text-xs text-gray-500">Registra i sintomi della giornata</p>
                    </div>
                    <Select value={symptomReminderTime} onValueChange={setSymptomReminderTime}>
                      <SelectTrigger className="w-24 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time.value} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Promemoria diario</Label>
                      <p className="text-xs text-gray-500">Scrivi le note del giorno</p>
                    </div>
                    <Select value={diaryReminderTime} onValueChange={setDiaryReminderTime}>
                      <SelectTrigger className="w-24 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time.value} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* App Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-sage-800">Informazioni App</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Versione:</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ultimo aggiornamento:</span>
                <span className="font-medium">15 Luglio 2025</span>
              </div>
              <div className="text-xs text-gray-500 mt-4">
                App per il monitoraggio dei pazienti in trattamento con inibitori CDK 4/6
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button 
            onClick={handleSaveSettings}
            className="w-full bg-sage-500 hover:bg-sage-600 text-white"
          >
            <Save className="mr-2 w-4 h-4" />
            Salva impostazioni
          </Button>
        </div>
      </div>
    </div>
  );
}