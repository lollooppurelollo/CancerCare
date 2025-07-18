import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, UserPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

export default function AdminDoctorManagement() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [newDoctor, setNewDoctor] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const { data: doctors } = useQuery({
    queryKey: ["/api/doctors"],
    enabled: true,
  });

  const createDoctorMutation = useMutation({
    mutationFn: async (doctorData: any) => {
      await apiRequest("POST", "/api/admin/doctors", {
        ...doctorData,
        role: "doctor",
      });
    },
    onSuccess: () => {
      toast({
        title: "Medico creato",
        description: "Il nuovo medico è stato aggiunto con successo.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/doctors"] });
      setNewDoctor({ username: "", password: "", firstName: "", lastName: "" });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile creare il medico. Riprova.",
        variant: "destructive",
      });
    },
  });

  const deleteDoctorMutation = useMutation({
    mutationFn: async (doctorId: number) => {
      await apiRequest("DELETE", `/api/admin/doctors/${doctorId}`);
    },
    onSuccess: () => {
      toast({
        title: "Medico eliminato",
        description: "Il medico è stato rimosso dal sistema.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/doctors"] });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile eliminare il medico. Riprova.",
        variant: "destructive",
      });
    },
  });

  const handleCreateDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDoctor.username && newDoctor.password && newDoctor.firstName && newDoctor.lastName) {
      createDoctorMutation.mutate(newDoctor);
    }
  };

  const handleDeleteDoctor = (doctorId: number) => {
    if (confirm("Sei sicuro di voler eliminare questo medico?")) {
      deleteDoctorMutation.mutate(doctorId);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/settings")}
            className="text-sage-600 hover:text-sage-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Indietro
          </Button>
          <h1 className="text-xl font-bold text-sage-800">Gestione Medici</h1>
          <div className="w-20"></div>
        </div>

        {/* Add New Doctor */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-sage-700">
              <UserPlus className="w-5 h-5 mr-2" />
              Aggiungi Nuovo Medico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateDoctor} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newDoctor.username}
                  onChange={(e) => setNewDoctor({ ...newDoctor, username: e.target.value })}
                  className="focus:ring-sage-500"
                  placeholder="es. dr_rossi"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newDoctor.password}
                  onChange={(e) => setNewDoctor({ ...newDoctor, password: e.target.value })}
                  className="focus:ring-sage-500"
                  placeholder="Password sicura"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome</Label>
                <Input
                  id="firstName"
                  value={newDoctor.firstName}
                  onChange={(e) => setNewDoctor({ ...newDoctor, firstName: e.target.value })}
                  className="focus:ring-sage-500"
                  placeholder="es. Dr. Mario"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Cognome</Label>
                <Input
                  id="lastName"
                  value={newDoctor.lastName}
                  onChange={(e) => setNewDoctor({ ...newDoctor, lastName: e.target.value })}
                  className="focus:ring-sage-500"
                  placeholder="es. Rossi"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-sage-500 hover:bg-sage-600"
                disabled={createDoctorMutation.isPending}
              >
                <Plus className="w-4 h-4 mr-2" />
                {createDoctorMutation.isPending ? "Creando..." : "Crea Medico"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Doctors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sage-700">Medici Esistenti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {doctors?.map((doctor: any) => (
                <div key={doctor.id} className="flex items-center justify-between p-3 bg-sage-50 rounded-lg border">
                  <div>
                    <p className="font-medium">{doctor.firstName} {doctor.lastName}</p>
                    <p className="text-sm text-gray-600">@{doctor.username}</p>
                  </div>
                  {doctor.username !== "medico" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDoctor(doctor.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}