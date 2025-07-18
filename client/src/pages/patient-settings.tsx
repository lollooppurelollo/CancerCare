import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Settings, User, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import BottomNavigation from "@/components/ui/bottom-navigation";

export default function PatientSettings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patient } = useQuery({
    queryKey: ["/api/patients/me"],
  });

  const { data: doctors } = useQuery({
    queryKey: ["/api/doctors/public"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    patient?.assignedDoctorId?.toString() || ""
  );

  const updateDoctorMutation = useMutation({
    mutationFn: async (doctorId: number) => {
      await apiRequest("PATCH", `/api/patients/${patient?.id}`, {
        assignedDoctorId: doctorId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Medico aggiornato",
        description: "Il tuo medico di riferimento è stato modificato con successo.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/patients/me"] });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il medico. Riprova.",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = () => {
    if (selectedDoctorId && selectedDoctorId !== patient?.assignedDoctorId?.toString()) {
      updateDoctorMutation.mutate(parseInt(selectedDoctorId));
    } else {
      toast({
        title: "Nessuna modifica",
        description: "Non sono state apportate modifiche.",
      });
    }
  };

  const currentDoctor = doctors?.find((doctor: any) => 
    doctor.id === patient?.assignedDoctorId
  );

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
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

        {/* Patient Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-sage-700">
              <User className="w-5 h-5 mr-2" />
              Informazioni Personali
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><span className="font-medium">Nome:</span> {patient?.firstName} {patient?.lastName}</p>
              <p><span className="font-medium">Età:</span> {patient?.age} anni</p>
              <p><span className="font-medium">Farmaco:</span> {patient?.medication}</p>
              <p><span className="font-medium">Dosaggio:</span> {patient?.dosage}</p>
            </div>
          </CardContent>
        </Card>

        {/* Doctor Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-sage-700">
              <Settings className="w-5 h-5 mr-2" />
              Medico di Riferimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Medico attuale:</p>
                <p className="font-medium text-sage-800">
                  {currentDoctor ? 
                    `${currentDoctor.firstName} ${currentDoctor.lastName}` : 
                    "Nessun medico assegnato"
                  }
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctorSelect">Cambia medico di riferimento</Label>
                <Select 
                  value={selectedDoctorId} 
                  onValueChange={setSelectedDoctorId}
                >
                  <SelectTrigger className="focus:ring-sage-500">
                    <SelectValue placeholder="Seleziona un nuovo medico" />
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

              <Button 
                onClick={handleSaveSettings}
                className="w-full bg-sage-500 hover:bg-sage-600 transition-all duration-200 transform hover:scale-105"
                disabled={updateDoctorMutation.isPending || selectedDoctorId === patient?.assignedDoctorId?.toString()}
              >
                <Save className="w-4 h-4 mr-2" />
                {updateDoctorMutation.isPending ? "Salvando..." : "Salva Modifiche"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-sm text-gray-500 mt-4 p-3 bg-sage-50 rounded-lg">
          <p className="font-medium mb-1">Nota importante</p>
          <p>Cambiando il medico di riferimento, tutte le tue comunicazioni e dati verranno trasferiti al nuovo medico selezionato.</p>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}