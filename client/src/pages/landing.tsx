import { useLocation } from "wouter";
import { Heart, UserPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-sage-100 to-sage-200">
        <div className="w-24 h-24 bg-sage-500 rounded-full flex items-center justify-center mb-8">
          <Heart className="text-white w-12 h-12" />
        </div>
        
        <h1 className="text-2xl font-bold text-sage-800 mb-2 text-center">CDK 4/6 Inhibitors</h1>
        <p className="text-sage-600 mb-8 text-center">Monitoraggio per pazienti con inibitori CDK 4/6</p>
        
        <div className="w-full space-y-4">
          <h2 className="text-lg font-semibold text-sage-700 text-center mb-4">Accedi come:</h2>
          
          <div className="space-y-3">
            <Button 
              onClick={() => setLocation("/patient/login")}
              className="w-full bg-sage-500 hover:bg-sage-600 text-white py-4 px-6 rounded-xl font-medium transition-colors flex items-center justify-center"
            >
              <LogIn className="mr-3 w-5 h-5" />
              Login Paziente
            </Button>
            
            <Button 
              onClick={() => setLocation("/patient/register")}
              className="w-full bg-sage-400 hover:bg-sage-500 text-white py-4 px-6 rounded-xl font-medium transition-colors flex items-center justify-center"
            >
              <UserPlus className="mr-3 w-5 h-5" />
              Registrati come Paziente
            </Button>
            
            <Button 
              onClick={() => setLocation("/doctor/login")}
              className="w-full bg-sage-600 hover:bg-sage-700 text-white py-4 px-6 rounded-xl font-medium transition-colors flex items-center justify-center"
            >
              <LogIn className="mr-3 w-5 h-5" />
              Login Medico
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}