import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { ArrowLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  username: z.string().min(1, "Username è richiesto"),
  password: z.string().min(1, "Password è richiesta"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function DoctorLogin() {
  const [, setLocation] = useLocation();
  const { login, isLoginLoading, loginError } = useAuth();
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
      onSuccess: (userData) => {
        if (userData.role === "doctor") {
          toast({
            title: "Accesso effettuato",
            description: "Benvenuto nella dashboard medico.",
          });
          setLocation("/");
        } else {
          toast({
            title: "Errore",
            description: "Credenziali non valide per l'accesso medico.",
            variant: "destructive",
          });
        }
      },
      onError: () => {
        toast({
          title: "Errore",
          description: "Username o password non corretti.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-sage-100 to-sage-200">
        <div className="w-full max-w-sm">
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="text-sage-600 mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-sage-800">Accesso Medico</h1>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-sage-200">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-sage-500 rounded-full flex items-center justify-center">
                <Heart className="text-white w-8 h-8" />
              </div>
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

                <Button 
                  type="submit" 
                  className="w-full bg-sage-500 hover:bg-sage-600 text-white mt-6"
                  disabled={isLoginLoading}
                >
                  {isLoginLoading ? "Accesso..." : "Accedi"}
                </Button>
              </form>
            </Form>

            {loginError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  Errore di accesso. Verifica le credenziali.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
