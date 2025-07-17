import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import PatientLogin from "@/pages/patient-login";
import PatientRegistration from "@/pages/patient-registration";
import PatientHome from "@/pages/patient-home";
import PatientHistory from "@/pages/patient-history";
import PatientVideo from "@/pages/patient-video";
import PatientProfile from "@/pages/patient-profile";
import PatientAdvice from "@/pages/patient-advice";
import AppSettings from "@/pages/app-settings";
import DoctorDashboard from "@/pages/doctor-dashboard";
import DoctorPatientDetail from "@/pages/doctor-patient-detail";
import DoctorChat from "@/pages/doctor-chat";
import DoctorLogin from "@/pages/doctor-login";
import DoctorRegistration from "@/pages/doctor-registration";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-sage-500 rounded-full flex items-center justify-center mb-4">
            <i className="fas fa-heartbeat text-white text-2xl"></i>
          </div>
          <p className="text-sage-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/patient/login" component={PatientLogin} />
        <Route path="/patient/register" component={PatientRegistration} />
        <Route path="/doctor/login" component={DoctorLogin} />
        <Route path="/doctor/register" component={DoctorRegistration} />
        <Route path="/" component={Landing} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  if (user.role === "doctor") {
    return (
      <Switch>
        <Route path="/" component={DoctorDashboard} />
        <Route path="/doctor" component={DoctorDashboard} />
        <Route path="/doctor/patient/:id" component={DoctorPatientDetail} />
        <Route path="/doctor/chat/:patientId" component={DoctorChat} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={PatientHome} />
      <Route path="/history" component={PatientHistory} />
      <Route path="/advice" component={PatientAdvice} />
      <Route path="/video" component={PatientVideo} />
      <Route path="/profile" component={PatientProfile} />
      <Route path="/settings" component={AppSettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
