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
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-gray-800">
            {patient.firstName} {patient.lastName}
          </h3>
          <p className="text-sm text-gray-600">
            {patient.medication} - In trattamento
          </p>
          <p className="text-xs text-gray-500">
            Registrato: {formatDate(patient.createdAt)}
          </p>
          <p className="text-xs text-sage-600">
            Tel: {patient.phone}
          </p>
        </div>
        <div className="ml-4 flex space-x-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-sage-500 hover:bg-sage-600 text-white"
            onClick={() => setLocation(`/doctor/patient-view/${patient.id}`)}
            title="Vedi interfaccia paziente"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => setLocation(`/doctor/chat/${patient.id}`)}
            title="Chat con paziente"
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={() => handleVideoCall(patient.id)}
            title="Videochiamata Google Meet"
          >
            <Video className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
