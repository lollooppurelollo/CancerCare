import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, Settings, TriangleAlert, Eye, Video, Phone, Calendar, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import PatientCard from "@/components/ui/patient-card";

export default function DoctorDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const { logout } = useAuth();

  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["/api/alerts"],
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["/api/messages"],
  });

  const filteredPatients = patients.filter((patient: any) =>
    patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const urgentAlerts = alerts.filter((alert: any) => alert.severity === "high");
  const todayUpdates = messages.filter((message: any) => {
    const today = new Date().toISOString().split('T')[0];
    return message.createdAt?.startsWith(today);
  });

  const getPatientName = (patientId: number) => {
    const patient = patients.find((p: any) => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : "Paziente sconosciuto";
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-50 border-red-200 text-red-800";
      case "medium":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  const formatTimestamp = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("it-IT", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-sage-800">Dashboard Medico</h1>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="text-sage-600">
              <Settings className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => logout()}
              className="text-sage-600"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              className="pl-10 focus:ring-sage-500 focus:border-sage-500"
              placeholder="Cerca paziente per nome o cognome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            <BarChart3 className="inline w-5 h-5 mr-2" />
            Statistiche
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-sage-50 p-4 rounded-lg border border-sage-200">
              <div className="text-2xl font-bold text-sage-600">{patients.length}</div>
              <div className="text-sm text-gray-600">Pazienti totali</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{urgentAlerts.length}</div>
              <div className="text-sm text-gray-600">Avvisi urgenti</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{todayUpdates.length}</div>
              <div className="text-sm text-gray-600">Aggiornamenti oggi</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">92%</div>
              <div className="text-sm text-gray-600">Aderenza terapia</div>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              <TriangleAlert className="inline w-5 h-5 mr-2 text-red-500" />
              Avvisi
            </h2>
            
            <div className="space-y-3">
              {alerts.map((alert: any) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${getAlertColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium">{alert.message}</p>
                      </div>
                      <button
                        onClick={() => setLocation(`/doctor/patient/${alert.patientId}`)}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        {getPatientName(alert.patientId)}
                      </button>
                      <p className="text-xs opacity-75 mt-1">
                        {formatTimestamp(alert.createdAt)}
                      </p>
                    </div>
                    <div className="ml-4 flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setLocation(`/doctor/patient/${alert.patientId}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Video className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Patient List */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Pazienti {searchQuery && `(${filteredPatients.length} risultati)`}
          </h2>
          
          <div className="space-y-3">
            {filteredPatients.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {searchQuery ? "Nessun paziente trovato" : "Nessun paziente registrato"}
                </p>
              </div>
            ) : (
              filteredPatients.map((patient: any) => (
                <PatientCard key={patient.id} patient={patient} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
