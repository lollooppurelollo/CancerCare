import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Send, Phone, Video, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function DoctorChat() {
  const [match, params] = useRoute("/doctor/chat/:patientId");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const patientId = params?.patientId ? parseInt(params.patientId) : null;
  
  const [newMessage, setNewMessage] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: patient } = useQuery({
    queryKey: ["/api/patients", patientId],
    enabled: !!patientId,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["/api/messages", patientId],
    enabled: !!patientId,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["/api/alerts", patientId],
    enabled: !!patientId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { content: string; isUrgent: boolean; file?: File }) => {
      if (!patientId) {
        throw new Error("PatientId is null or undefined");
      }
      
      if (data.file) {
        // Upload file first
        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('patientId', patientId.toString());
        formData.append('content', data.content);
        formData.append('isUrgent', data.isUrgent.toString());
        
        const response = await fetch('/api/messages/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload file');
        }
      } else {
        await apiRequest("POST", "/api/messages", {
          ...data,
          patientId,
        });
      }
    },
    onSuccess: () => {
      setNewMessage("");
      setIsUrgent(false);
      setSelectedFile(null);
      toast({
        title: "Messaggio inviato",
        description: "Il messaggio è stato inviato al paziente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/messages", patientId] });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile inviare il messaggio.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() || selectedFile) {
      sendMessageMutation.mutate({
        content: newMessage,
        isUrgent,
        file: selectedFile || undefined
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredMessages = messages.filter((msg: any) => msg.patientId === patientId);
  const patientAlerts = alerts.filter((alert: any) => alert.patientId === patientId && !alert.resolved);

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/doctor")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Torna al Dashboard</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-sage-800">
                Chat con {patient?.firstName} {patient?.lastName}
              </h1>
              {patient?.birthDate && (
                <p className="text-sm text-gray-500">
                  Nato il {new Date(patient.birthDate).toLocaleDateString('it-IT')}
                </p>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline">
              <Phone className="w-4 h-4 mr-2" />
              Chiama
            </Button>
            <Button size="sm" variant="outline">
              <Video className="w-4 h-4 mr-2" />
              Video
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setLocation(`/doctor/patient/${patientId}`)}
            >
              Profilo Paziente
            </Button>
          </div>
        </div>

        {/* Active Alerts */}
        {patientAlerts.length > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Avvisi Attivi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {patientAlerts.map((alert: any) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div>
                      <p className="font-medium text-orange-800">{alert.message}</p>
                      <p className="text-sm text-gray-600">
                        {formatTimestamp(alert.createdAt)}
                      </p>
                    </div>
                    <Badge variant={alert.severity === "high" ? "destructive" : "secondary"}>
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Messages */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cronologia Messaggi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredMessages.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Nessun messaggio ancora. Inizia la conversazione!
                </p>
              ) : (
                filteredMessages.map((message: any) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg ${
                      message.senderId === patient?.userId
                        ? "bg-gray-100 ml-8"
                        : "bg-sage-100 mr-8"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        {message.senderId === patient?.userId
                          ? `${patient?.firstName} ${patient?.lastName}`
                          : "Medico"
                        }
                      </span>
                      <div className="flex items-center space-x-2">
                        {message.isUrgent && (
                          <Badge variant="destructive" className="text-xs">
                            Urgente
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(message.createdAt)}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-800">{message.content}</p>
                    {message.fileUrl && (
                      <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                        <a
                          href={message.fileUrl}
                          download={message.fileName}
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                        >
                          <span>📎</span>
                          <span className="text-sm underline">
                            {message.fileName || "File allegato"}
                          </span>
                        </a>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Send Message Form */}
        <Card>
          <CardHeader>
            <CardTitle>Invia Messaggio</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Scrivi il tuo messaggio..."
                rows={3}
                className="w-full"
              />
              {selectedFile && (
                <div className="p-3 bg-gray-50 rounded-lg mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      📎 {selectedFile.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="urgent"
                      checked={isUrgent}
                      onChange={(e) => setIsUrgent(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="urgent" className="text-sm text-gray-700">
                      Messaggio urgente
                    </label>
                  </div>
                  <div>
                    <input
                      type="file"
                      id="fileInput"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                      onChange={handleFileSelect}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('fileInput')?.click()}
                      className="flex items-center space-x-2"
                    >
                      <span>📎</span>
                      <span>Allega</span>
                    </Button>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={(!newMessage.trim() && !selectedFile) || sendMessageMutation.isPending}
                  className="flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{sendMessageMutation.isPending ? "Invio..." : "Invia"}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}