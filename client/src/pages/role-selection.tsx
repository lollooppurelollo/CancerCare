import { useLocation } from "wouter";
import { Heart } from "lucide-react";

export default function RoleSelection() {
  const [, setLocation] = useLocation();

  const handleRoleSelect = (role: "patient" | "doctor") => {
    if (role === "patient") {
      setLocation("/register");
    } else {
      setLocation("/doctor/login");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-sage-100 to-sage-200">
        <div className="w-24 h-24 bg-sage-500 rounded-full flex items-center justify-center mb-8">
          <Heart className="text-white w-12 h-12" />
        </div>
        <h1 className="text-2xl font-bold text-sage-800 mb-2 text-center">CDK 4/6 Inhibitors</h1>
        <p className="text-sage-600 mb-8 text-center">Seleziona il tuo ruolo per accedere</p>
        
        <div className="w-full space-y-4">
          <button 
            onClick={() => handleRoleSelect("patient")}
            className="w-full bg-sage-500 hover:bg-sage-600 text-white py-4 px-6 rounded-xl font-medium transition-colors flex items-center justify-center"
          >
            <Heart className="mr-3 w-5 h-5" />
            Paziente
          </button>
          <button 
            onClick={() => handleRoleSelect("doctor")}
            className="w-full bg-sage-600 hover:bg-sage-700 text-white py-4 px-6 rounded-xl font-medium transition-colors flex items-center justify-center"
          >
            <Heart className="mr-3 w-5 h-5" />
            Medico
          </button>
        </div>
      </div>
    </div>
  );
}
