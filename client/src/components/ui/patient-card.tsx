import { Eye, Video, MessageCircle, Calendar } from "lucide-react";
import { Button } from "./button";
import { useLocation } from "wouter";

interface PatientCardProps {
  patient: {
    id: number;
    firstName: string;
    lastName: string;
    medication: string;
    dosage: string;
    phone: string;
    birthDate: string;
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
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:scale-[1.02] hover:border-sage-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">
            {patient.firstName} {patient.lastName}
          </h3>
          <p className="text-sm text-gray-500 mb-2">
            {patient.birthDate ? `Nato il ${formatDate(patient.birthDate)}` : ''}
          </p>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Farmaco:</span> {patient.medication} - {patient.dosage}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Telefono:</span> {patient.phone}
            </p>
          </div>
        </div>
        <div className="ml-4 flex flex-col space-y-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-sage-500 hover:bg-sage-600 text-white border-sage-500 hover:border-sage-600 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
            onClick={() => setLocation(`/doctor/patient-view/${patient.id}`)}
            title="Visualizza profilo paziente"
          >
            <Eye className="w-4 h-4 mr-2 transition-transform duration-200 hover:scale-110" />
            Profilo
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500 hover:border-blue-600 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
            onClick={() => setLocation(`/doctor/chat/${patient.id}`)}
            title="Apri chat con paziente"
          >
            <MessageCircle className="w-4 h-4 mr-2 transition-transform duration-200 hover:scale-110" />
            Chat
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-purple-500 hover:bg-purple-600 text-white border-purple-500 hover:border-purple-600 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
            onClick={() => handleVideoCall(patient.id)}
            title="Avvia videochiamata Google Meet"
          >
            <Video className="w-4 h-4 mr-2 transition-transform duration-200 hover:scale-110" />
            Video
          </Button>
        </div>
      </div>
    </div>
  );
}
