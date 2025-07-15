import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { ArrowLeft, Heart, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  username: z.string().min(1, "Username è richiesto"),
  password: z.string().min(1, "Password è richiesta"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function PatientLogin() {
  const [, setLocation] = useLocation();
  const { login, isLoginLoading } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginForm) => {
    login(data, {
      onSuccess: () => {
        toast({
          title: "Accesso effettuato",
          description: "Benvenuto!",
        });
        setLocation("/");
      },
      onError: (error) => {
        toast({
          title: "Errore",
          description: "Credenziali non valide",
          variant: "destructive",
        });
      },
    });
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
          <h1 className="text-xl font-bold text-sage-800">Login Paziente</h1>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-sage-500 rounded-full flex items-center justify-center mb-4">
            <Heart className="text-white w-8 h-8" />
          </div>
          <p className="text-sage-600 text-center">Accedi al tuo account paziente</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sage-700">Username</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Inserisci il tuo username"
                      className="border-sage-300 focus:border-sage-500"
                    />
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
                  <FormLabel className="text-sage-700">Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Inserisci la tua password"
                      className="border-sage-300 focus:border-sage-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoginLoading}
              className="w-full bg-sage-500 hover:bg-sage-600 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center"
            >
              {isLoginLoading ? (
                "Accesso in corso..."
              ) : (
                <>
                  <LogIn className="mr-2 w-5 h-5" />
                  Accedi
                </>
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-sage-600">
            Non hai un account?{" "}
            <button
              onClick={() => setLocation("/patient/register")}
              className="text-sage-600 hover:text-sage-700 underline font-medium"
            >
              Registrati qui
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}