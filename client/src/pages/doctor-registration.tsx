import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const registrationSchema = z.object({
  username: z.string().min(3, "Username deve avere almeno 3 caratteri"),
  password: z.string().min(6, "Password deve avere almeno 6 caratteri"),
  confirmPassword: z.string().min(6, "Conferma password è richiesta"),
  firstName: z.string().min(1, "Nome è richiesto"),
  lastName: z.string().min(1, "Cognome è richiesto"),
  specialization: z.string().min(1, "Specializzazione è richiesta"),
  medicalId: z.string().min(1, "Numero di registrazione è richiesto"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non corrispondono",
  path: ["confirmPassword"],
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function DoctorRegistration() {
  const [, setLocation] = useLocation();
  const { register, isRegisterLoading, registerError } = useAuth();
  const { toast } = useToast();

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      specialization: "",
      medicalId: "",
    },
  });

  const onSubmit = async (data: RegistrationForm) => {
    try {
      await register(
        {
          username: data.username,
          password: data.password,
          role: "doctor",
        },
        {
          onSuccess: () => {
            toast({
              title: "Registrazione completata",
              description: "Il tuo account medico è stato creato con successo!",
            });
            setLocation("/");
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
          <h1 className="text-xl font-bold text-sage-800">Registrazione Medico</h1>
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

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conferma Password</FormLabel>
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

            <FormField
              control={form.control}
              name="specialization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specializzazione</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="es: Oncologia" className="focus:ring-sage-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="medicalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numero di registrazione</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Codice identificativo medico" className="focus:ring-sage-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {registerError && (
              <div className="text-red-600 text-sm">{registerError}</div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-sage-500 hover:bg-sage-600 text-white mt-6"
              disabled={isRegisterLoading}
            >
              <UserPlus className="mr-2 w-4 h-4" />
              {isRegisterLoading ? "Registrazione..." : "Registrati"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}