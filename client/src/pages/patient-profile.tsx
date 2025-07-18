import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const medications = {
  abemaciclib: ["150mg", "100mg", "50mg"],
  ribociclib: ["600mg", "400mg", "200mg"],
  palbociclib: ["125mg", "100mg", "75mg"],
};

const profileSchema = z.object({
  firstName: z.string().min(1, "Nome è richiesto"),
  lastName: z.string().min(1, "Cognome è richiesto"),
  age: z.number().min(18, "Età deve essere almeno 18").max(100, "Età non valida"),
  gender: z.enum(["F", "M"], { required_error: "Sesso è richiesto" }),
  weight: z.number().min(30, "Peso deve essere almeno 30kg").max(200, "Peso non valido"),
  height: z.number().min(100, "Altezza deve essere almeno 100cm").max(250, "Altezza non valida"),
  phone: z.string().min(10, "Numero di telefono non valido"),
  medication: z.enum(["abemaciclib", "ribociclib", "palbociclib"], { required_error: "Farmaco è richiesto" }),
  dosage: z.string().min(1, "Dosaggio è richiesto"),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function PatientProfile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMedication, setSelectedMedication] = useState<string>("");

  const { data: patient, isLoading } = useQuery({
    queryKey: ["/api/patients/me"],
  });

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      age: 0,
      gender: undefined,
      weight: 0,
      height: 0,
      phone: "",
      medication: undefined,
      dosage: "",
    },
  });

  // Update form when patient data is loaded
  React.useEffect(() => {
    if (patient) {
      form.reset({
        firstName: patient.firstName || "",
        lastName: patient.lastName || "",
        age: patient.age || 0,
        gender: patient.gender || undefined,
        weight: patient.weight || 0,
        height: patient.height || 0,
        phone: patient.phone || "",
        medication: patient.medication || undefined,
        dosage: patient.dosage || "",
      });
      setSelectedMedication(patient.medication || "");
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