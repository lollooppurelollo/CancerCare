import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Send, Video, AlertTriangle, User, MessageSquare, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useKeyboardVisibility } from "@/hooks/use-keyboard-visibility";
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
  
  // Keyboard visibility hook for text input
  const messageInputRef = useKeyboardVisibility();

  const resolveAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      await apiRequest("POST", `/api/alerts/${alertId}/resolve`, {});
    },
    onSuccess: () => {
      toast({
        title: "Avviso risolto",
        description: "L'avviso è stato rimosso dalla lista degli avvisi attivi.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts", patientId] });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile risolvere l'avviso.",
        variant: "destructive",
      });
    },
  });

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
        content: newMessage.trim() || "File inviato",
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
  const urgentMessages = filteredMessages.filter((msg: any) => msg.isUrgent);
  const recentUrgentMessages = urgentMessages.filter((msg: any) => {
    const messageTime = new Date(msg.createdAt).getTime();
    const now = new Date().getTime();
    return now - messageTime < 24 * 60 * 60 * 1000; // Last 24 hours
  });

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen">
      <div className="p-6">
        {/* Header */}
        <div className="bg-sage-50 p-6 rounded-xl mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setLocation("/doctor")}
                className="flex items-center space-x-2 hover:bg-sage-100"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Dashboard</span>
              </Button>
              <div className="border-l border-sage-200 pl-4">
                <h1 className="text-2xl font-bold text-sage-800 mb-1">
                  <MessageSquare className="w-6 h-6 inline mr-2" />
                  Chat con {patient?.firstName} {patient?.lastName}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Farmaco: {patient?.medication}</span>
                  {patient?.birthDate && (
                    <span>Nato il {new Date(patient.birthDate).toLocaleDateString('it-IT')}</span>
                  )}
                  {recentUrgentMessages.length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {recentUrgentMessages.length} messaggi urgenti
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant="outline"
                className="bg-sage-500 hover:bg-sage-600 text-white border-sage-500"
                onClick={() => setLocation(`/doctor/patient-view/${patientId}`)}
                title="Visualizza interfaccia paziente"
              >
                <User className="w-4 h-4 mr-2" />
                Profilo
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="bg-green-500 hover:bg-green-600 text-white border-green-500"
                onClick={() => {
                  const meetingTitle = `Consulto con ${patient?.firstName} ${patient?.lastName}`;
                  const meetUrl = `https://meet.google.com/new?title=${encodeURIComponent(meetingTitle)}`;
                  window.open(meetUrl, '_blank');
                }}
                title="Avvia videochiamata Google Meet"
              >
                <Video className="w-4 h-4 mr-2" />
                Video
              </Button>
            </div>
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
                  <div key={alert.id} className="p-3 bg-white rounded-lg relative">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-orange-800">{alert.message}</p>
                        <p className="text-sm text-gray-600">
                          {formatTimestamp(alert.createdAt)}
                        </p>
                        
                        {/* Pulsante Risolto in basso a sinistra */}
                        <div className="mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600 text-xs px-2 py-1"
                            onClick={() => resolveAlertMutation.mutate(alert.id)}
                            disabled={resolveAlertMutation.isPending}
                            title="Contrassegna come risolto"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Risolto
                          </Button>
                        </div>
                      </div>
                      
                      {/* Badge severità in alto a destra */}
                      <div className="absolute top-3 right-3">
                        <Badge variant={alert.severity === "high" ? "destructive" : "secondary"}>
                          {alert.severity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Messages */}
        <Card className="mb-6 shadow-sm">
          <CardHeader className="bg-sage-50 rounded-t-lg">
            <CardTitle className="text-sage-800 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Conversazione
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-3 max-h-96 overflow-y-auto p-4">
              {filteredMessages.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Nessun messaggio ancora</p>
                  <p className="text-sm">Inizia la conversazione con il paziente!</p>
                </div>
              ) : (
                filteredMessages.map((message: any) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === patient?.userId
                        ? "justify-start"
                        : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                        message.senderId === patient?.userId
                          ? "bg-gray-100 text-gray-900"
                          : "bg-sage-500 text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-xs">
                          {message.senderId === patient?.userId
                            ? `${patient?.firstName} ${patient?.lastName}`
                            : "Medico"
                          }
                        </span>
                        <div className="flex items-center space-x-1">
                          {message.isUrgent && (
                            <Badge variant="destructive" className="text-xs px-1 py-0">
                              ⚠️
                            </Badge>
                          )}
                          <span className={`text-xs ${
                            message.senderId === patient?.userId
                              ? "text-gray-500"
                              : "text-sage-200"
                          }`}>
                            {formatTimestamp(message.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm">{message.content}</p>
                      {message.fileUrl && (
                        <div className="mt-2 p-2 bg-white/20 rounded-lg">
                          <a
                            href={message.fileUrl}
                            download={message.fileName}
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                          >
                            <span>📎</span>
                            <span className="text-xs underline">
                              {message.fileName || "File allegato"}
                            </span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Send Message Form */}
        <Card className="shadow-sm">
          <CardHeader className="bg-sage-50 rounded-t-lg">
            <CardTitle className="text-sage-800 flex items-center">
              <Send className="w-5 h-5 mr-2" />
              Invia Messaggio
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSendMessage} className="space-y-4">
              <Textarea
                ref={messageInputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Scrivi il tuo messaggio al paziente..."
                rows={3}
                className="w-full border-sage-200 focus:border-sage-400 focus:ring-sage-400"
              />
              {selectedFile && (
                <div className="p-3 bg-sage-50 rounded-lg mb-3 border border-sage-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-sage-700">
                      📎 {selectedFile.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <label htmlFor="urgent" className="text-sm text-gray-700 cursor-pointer">
                      ⚠️ Messaggio urgente
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
                      className="flex items-center space-x-2 border-sage-200 hover:bg-sage-50 hover:border-sage-300"
                    >
                      <span>📎</span>
                      <span>Allega File</span>
                    </Button>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={(!newMessage.trim() && !selectedFile) || sendMessageMutation.isPending}
                  className="flex items-center space-x-2 bg-sage-600 hover:bg-sage-700 text-white"
                >
                  {sendMessageMutation.isPending ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Invio...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Invia</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}