import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Calendar, Pill, ArrowLeft, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useKeyboardVisibility } from "@/hooks/use-keyboard-visibility";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import BottomNavigation from "@/components/ui/bottom-navigation";

export default function PatientProfile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Keyboard visibility hooks for text inputs
  const firstNameRef = useKeyboardVisibility();
  const lastNameRef = useKeyboardVisibility();
  const ageRef = useKeyboardVisibility();
  const phoneRef = useKeyboardVisibility();
  const addressRef = useKeyboardVisibility();

  const { data: patient } = useQuery({
    queryKey: ["/api/patients/me"],
  });

  const [firstName, setFirstName] = useState(patient?.firstName || "");
  const [lastName, setLastName] = useState(patient?.lastName || "");
  const [age, setAge] = useState(patient?.age?.toString() || "");
  const [phone, setPhone] = useState(patient?.phone || "");
  const [address, setAddress] = useState(patient?.address || "");

  React.useEffect(() => {
    if (patient) {
      setFirstName(patient.firstName || "");
      setLastName(patient.lastName || "");
      setAge(patient.age?.toString() || "");
      setPhone(patient.phone || "");
      setAddress(patient.address || "");
    }
  }, [patient]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/patients/${patient?.id}`, {
        firstName,
        lastName,
        age: parseInt(age),
        phone,
        address,
      });
    },
    onSuccess: () => {
      toast({
        title: "Profilo aggiornato",
        description: "Le tue informazioni sono state salvate con successo.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/patients/me"] });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il profilo. Riprova.",
        variant: "destructive",
      });
    },
  });

  const birthDate = patient?.birthDate 
    ? new Date(patient.birthDate).toLocaleDateString("it-IT")
    : "Non specificato";

  if (!patient) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
        <p className="text-sage-600">Caricamento profilo...</p>
      </div>
    );
  }

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
          <h1 className="text-xl font-bold text-sage-800">Profilo Paziente</h1>
          <div className="w-20"></div>
        </div>

        {/* Personal Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-sage-700">
              <User className="w-5 h-5 mr-2" />
              Informazioni Personali
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Nome</Label>
                <Input
                  ref={firstNameRef}
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="focus:ring-sage-500"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Cognome</Label>
                <Input
                  ref={lastNameRef}
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="focus:ring-sage-500"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="age">Età</Label>
              <Input
                ref={ageRef}
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="focus:ring-sage-500"
              />
            </div>

            <div>
              <Label>Data di Nascita</Label>
              <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-medium flex items-center text-gray-700">
                  <Calendar className="w-4 h-4 mr-2" />
                  {birthDate}
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Telefono</Label>
              <Input
                ref={phoneRef}
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="focus:ring-sage-500"
                placeholder="Es. +39 123 456 7890"
              />
            </div>

            <div>
              <Label htmlFor="address">Indirizzo</Label>
              <Input
                ref={addressRef}
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="focus:ring-sage-500"
                placeholder="Es. Via Roma 123, Milano"
              />
            </div>
          </CardContent>
        </Card>

        {/* Medical Information (Read-only) */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-sage-700">
              <Pill className="w-5 h-5 mr-2" />
              Informazioni Mediche
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Farmaco</p>
              <p className="font-medium">{patient.medication}</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Dosaggio</p>
              <p className="font-medium">{patient.dosage}</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Medico di Riferimento</p>
              <p className="font-medium">
                {patient.doctorFirstName && patient.doctorLastName 
                  ? `${patient.doctorFirstName} ${patient.doctorLastName}`
                  : "Non assegnato"
                }
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-xs text-gray-500 mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="font-medium text-yellow-800 mb-1">Nota</p>
          <p className="text-yellow-700">
            Le informazioni mediche (farmaco, dosaggio, medico di riferimento) possono essere modificate solo dal tuo medico di riferimento.
          </p>
        </div>

        {/* Save Button */}
        <Button 
          onClick={updateProfileMutation.mutate}
          disabled={updateProfileMutation.isPending}
          className="w-full bg-sage-500 hover:bg-sage-600 transition-all duration-200 transform hover:scale-105"
        >
          <Save className="w-4 h-4 mr-2" />
          {updateProfileMutation.isPending ? "Salvando..." : "Salva Modifiche"}
        </Button>
      </div>

      <BottomNavigation />
    </div>
  );
}