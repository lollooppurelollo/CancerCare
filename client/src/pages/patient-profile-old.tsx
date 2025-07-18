import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Calendar, Pill, ArrowLeft, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import BottomNavigation from "@/components/ui/bottom-navigation";



export default function PatientProfile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
  }, [patient, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      await apiRequest("PUT", `/api/patients/${patient?.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Profilo aggiornato",
        description: "Le tue informazioni sono state salvate con successo.",
      });
      // Invalidate all related queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["/api/patients/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/medication-schedules"] });
      // Force refresh of all patient-related queries
      queryClient.refetchQueries({ queryKey: ["/api/patients/me"] });
      setTimeout(() => {
        setLocation("/");
      }, 100);
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il profilo. Riprova.",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      toast({
        title: "Logout effettuato",
        description: "Sei stato disconnesso con successo.",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile effettuare il logout. Riprova.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-sage-500 rounded-full flex items-center justify-center mb-4">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-sage-600">Caricamento profilo...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-xl font-bold text-sage-800">Profilo Paziente</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} className="focus:ring-sage-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cognome</FormLabel>
                    <FormControl>
                      <Input {...field} className="focus:ring-sage-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Età</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="focus:ring-sage-500" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sesso</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="focus:ring-sage-500">
                          <SelectValue placeholder="Seleziona" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="F">Femmina</SelectItem>
                        <SelectItem value="M">Maschio</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso (kg)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="focus:ring-sage-500" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Altezza (cm)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="focus:ring-sage-500" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numero di telefono</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" className="focus:ring-sage-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="medication"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farmaco</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedMedication(value);
                      form.setValue("dosage", "");
                    }} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="focus:ring-sage-500">
                        <SelectValue placeholder="Seleziona farmaco" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="abemaciclib">Abemaciclib</SelectItem>
                      <SelectItem value="ribociclib">Ribociclib</SelectItem>
                      <SelectItem value="palbociclib">Palbociclib</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dosage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dosaggio</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="focus:ring-sage-500">
                        <SelectValue placeholder="Seleziona dosaggio" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {selectedMedication && medications[selectedMedication as keyof typeof medications]?.map((dosage) => (
                        <SelectItem key={dosage} value={dosage}>{dosage}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 mt-6">
              <Button 
                type="submit" 
                className="w-full bg-sage-500 hover:bg-sage-600 text-white"
                disabled={updateProfileMutation.isPending}
              >
                <Save className="mr-2 w-4 h-4" />
                {updateProfileMutation.isPending ? "Salvando..." : "Salva modifiche"}
              </Button>
              
              <Button 
                type="button"
                variant="outline"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="w-full border-red-300 text-red-600 hover:bg-red-50"
              >
                {logoutMutation.isPending ? "Disconnessione..." : "Disconnetti account"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}