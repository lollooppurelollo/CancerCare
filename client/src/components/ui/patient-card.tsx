import { Eye, Video, MessageCircle, Calendar } from "lucide-react";
import { Button } from "./button";
import { useLocation } from "wouter";

interface PatientCardProps {
  patient: {
    id: number;
    firstName: string;
    lastName: string;
    medication: string;
    phone: string;
    createdAt: string;
  };
}

export default function PatientCard({ patient }: PatientCardProps) {
  const [, setLocation] = useLocation();

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("it-IT");
    } catch {
      return dateString;
    }
  };

  const handleVideoCall = (patientId: number) => {
    const meetingTitle = `Consulenza medica con ${patient.firstName} ${patient.lastName}`;
    const meetUrl = `https://meet.google.com/new?title=${encodeURIComponent(meetingTitle)}`;
    window.open(meetUrl, '_blank');
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg mb-2">
            Chat con {patient.firstName} {patient.lastName}
          </h3>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Farmaco:</span> {patient.medication}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Stato:</span> In trattamento
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Telefono:</span> {patient.phone}
            </p>
            <p className="text-xs text-gray-500">
              Registrato: {formatDate(patient.createdAt)}
            </p>
          </div>
        </div>
        <div className="ml-4 flex flex-col space-y-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500 hover:border-blue-600"
            onClick={() => setLocation(`/doctor/chat/${patient.id}`)}
            title="Apri chat con paziente"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-sage-500 hover:bg-sage-600 text-white border-sage-500 hover:border-sage-600"
            onClick={() => setLocation(`/doctor/patient-view/${patient.id}`)}
            title="Visualizza profilo paziente"
          >
            <Eye className="w-4 h-4 mr-2" />
            Profilo
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600"
            onClick={() => handleVideoCall(patient.id)}
            title="Avvia videochiamata Google Meet"
          >
            <Video className="w-4 h-4 mr-2" />
            Video
          </Button>
        </div>
      </div>
    </div>
  );
}
