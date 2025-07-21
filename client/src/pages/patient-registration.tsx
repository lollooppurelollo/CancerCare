import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { ArrowLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const medications = {
  abemaciclib: ["150mg BID", "100mg BID", "50mg BID"],
  ribociclib: ["600mg", "400mg", "200mg"],
  palbociclib: ["125mg", "100mg", "75mg"],
};

const registrationSchema = z.object({
  username: z.string().min(3, "Username deve avere almeno 3 caratteri"),
  password: z.string().min(6, "Password deve avere almeno 6 caratteri"),
  firstName: z.string().min(1, "Nome è richiesto"),
  lastName: z.string().min(1, "Cognome è richiesto"),
  age: z.number().min(18, "Età deve essere almeno 18").max(100, "Età non valida"),
  gender: z.enum(["F", "M"], { required_error: "Sesso è richiesto" }),
  weight: z.number().min(30, "Peso deve essere almeno 30kg").max(200, "Peso non valido"),
  height: z.number().min(100, "Altezza deve essere almeno 100cm").max(250, "Altezza non valida"),
  phone: z.string().min(10, "Numero di telefono non valido"),
  medication: z.enum(["abemaciclib", "ribociclib", "palbociclib"], { required_error: "Farmaco è richiesto" }),
  dosage: z.string().min(1, "Dosaggio è richiesto"),
  assignedDoctorId: z.string().min(1, "Medico di riferimento è richiesto"),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function PatientRegistration() {
  const [, setLocation] = useLocation();
  const { register, isRegisterLoading, registerError } = useAuth();
  const { toast } = useToast();
  const [selectedMedication, setSelectedMedication] = useState<string>("");

  // Get all doctors for the dropdown
  const { data: doctors } = useQuery({
    queryKey: ["/api/doctors/public"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      age: 0,
      gender: undefined,
      weight: 0,
      height: 0,
      phone: "",
      medication: undefined,
      dosage: "",
      assignedDoctorId: "",
    },
  });

  const onSubmit = async (data: RegistrationForm) => {
    try {
      // Register user
      register(
        {
          username: data.username,
          password: data.password,
          role: "patient",
        },
        {
          onSuccess: async (userData) => {
            try {
              // Create patient profile
              await apiRequest("POST", "/api/patients", {
                userId: userData.id,
                firstName: data.firstName,
                lastName: data.lastName,
                age: data.age,
                gender: data.gender,
                weight: data.weight,
                height: data.height,
                phone: data.phone,
                medication: data.medication,
                dosage: data.dosage,
                assignedDoctorId: parseInt(data.assignedDoctorId),
              });

              toast({
                title: "Registrazione completata",
                description: "Il tuo account è stato creato con successo!",
              });

              // Redirect to patient home
              setLocation("/");
            } catch (error) {
              toast({
                title: "Errore",
                description: "Errore durante la creazione del profilo paziente.",
                variant: "destructive",
              });
            }
          },
          onError: (error) => {
            toast({
              title: "Errore",
              description: "Registrazione fallita. Riprova.",
              variant: "destructive",
            });
          },
        }
      );
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore durante la registrazione.",
        variant: "destructive",
      });
    }
  };

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
          <h1 className="text-xl font-bold text-sage-800">Registrazione Paziente</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} className="focus:ring-sage-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" className="focus:ring-sage-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              name="medication"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farmaco</FormLabel>
                  <Select onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedMedication(value);
                    form.setValue("dosage", "");
                  }} defaultValue={field.value}>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            <FormField
              control={form.control}
              name="assignedDoctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medico di riferimento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="focus:ring-sage-500">
                        <SelectValue placeholder="Seleziona il tuo medico" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {doctors?.map((doctor: any) => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          {doctor.firstName} {doctor.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <Button 
              type="submit" 
              className="w-full bg-sage-500 hover:bg-sage-600 text-white mt-6"
              disabled={isRegisterLoading}
            >
              {isRegisterLoading ? "Registrazione..." : "Registrati"}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-sage-600">
            Hai già un account?{" "}
            <button
              onClick={() => setLocation("/patient/login")}
              className="text-sage-600 hover:text-sage-700 underline font-medium"
            >
              Accedi qui
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
