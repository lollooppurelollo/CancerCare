import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Settings, Users, User, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function AppSettings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const isAdmin = user?.id === 4;
  
  const [viewMode, setViewMode] = useState<string>(
    localStorage.getItem("patientViewMode") || "all"
  );
  const [selectedDoctor, setSelectedDoctor] = useState<string>(
    localStorage.getItem("selectedDoctorId") || ""
  );

  // Get all doctors for the dropdown
  const { data: doctors } = useQuery({
    queryKey: ["/api/doctors"],
    enabled: true,
  });

  const handleSaveSettings = () => {
    localStorage.setItem("patientViewMode", viewMode);
    localStorage.setItem("selectedDoctorId", selectedDoctor);
    
    // Invalidate patient queries to refresh the dashboard
    queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
    
    toast({
      title: "Impostazioni salvate",
      description: "Le preferenze di visualizzazione sono state aggiornate.",
    });
    
    setLocation("/doctor");
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/doctor")}
            className="text-sage-600 hover:text-sage-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Indietro
          </Button>
          <h1 className="text-xl font-bold text-sage-800">Impostazioni</h1>
          <div className="w-20"></div>
        </div>

        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-sage-700">
              <Settings className="w-5 h-5 mr-2" />
              Visualizzazione Pazienti
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* View Mode Selection */}
            <div className="space-y-2">
              <Label htmlFor="view-mode">Modalità di visualizzazione</Label>
              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger className="focus:ring-sage-500">
                  <SelectValue placeholder="Seleziona modalità" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Tutti i pazienti
                    </div>
                  </SelectItem>
                  <SelectItem value="doctor">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Pazienti di un medico specifico
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Doctor Selection (only shown when doctor mode is selected) */}
            {viewMode === "doctor" && (
              <div className="space-y-2">
                <Label htmlFor="doctor-select">Seleziona medico</Label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger className="focus:ring-sage-500">
                    <SelectValue placeholder="Seleziona medico" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors?.map((doctor: any) => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        Dr. {doctor.firstName} {doctor.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Info Text */}
            <div className="bg-sage-50 p-3 rounded-lg border border-sage-200">
              <p className="text-sm text-gray-600">
                {viewMode === "all" 
                  ? "Visualizzerai tutti i pazienti registrati nel sistema."
                  : "Visualizzerai solo i pazienti assegnati al medico selezionato."
                }
              </p>
            </div>

            {/* Save Button */}
            <Button 
              onClick={handleSaveSettings}
              className="w-full bg-sage-500 hover:bg-sage-600 transition-all duration-200 hover:scale-105"
              disabled={viewMode === "doctor" && !selectedDoctor}
            >
              Salva Impostazioni
            </Button>
          </CardContent>
        </Card>

        {/* Admin Section */}
        {isAdmin && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center text-sage-700">
                <UserCog className="w-5 h-5 mr-2" />
                Amministrazione
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-sage-50 rounded-lg border">
                  <div>
                    <p className="font-medium">Gestione Medici</p>
                    <p className="text-sm text-gray-600">
                      Aggiungi, modifica o elimina account medico
                    </p>
                  </div>
                  <Button
                    onClick={() => setLocation("/admin/doctors")}
                    className="bg-sage-500 hover:bg-sage-600 transition-all duration-200 transform hover:scale-105"
                  >
                    <UserCog className="w-4 h-4 mr-2" />
                    Gestisci
                  </Button>
                </div>
                
                <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium mb-1">Account Amministratore</p>
                  <p>Username: medico | Password: 123456</p>
                  <p>Solo l'amministratore può aggiungere nuovi medici al sistema.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}