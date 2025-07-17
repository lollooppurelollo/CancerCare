import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Video, Phone, MessageCircle, Send, HelpCircle, Paperclip, FileText, Image, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import BottomNavigation from "@/components/ui/bottom-navigation";

export default function PatientVideo() {
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patient } = useQuery({
    queryKey: ["/api/patients/me"],
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["/api/messages"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, isUrgent, fileUrl, fileName }: { content: string; isUrgent: boolean; fileUrl?: string; fileName?: string }) => {
      await apiRequest("POST", "/api/messages", {
        patientId: patient?.id,
        content,
        isUrgent,
        fileUrl,
        fileName,
      });
    },
    onSuccess: () => {
      toast({
        title: "Messaggio inviato",
        description: "Il tuo messaggio è stato inviato al medico.",
      });
      setNewMessage("");
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile inviare il messaggio. Riprova.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = async (isUrgent: boolean = false) => {
    if (!newMessage.trim() && !selectedFile) return;
    
    let fileUrl = "";
    let fileName = "";
    
    if (selectedFile) {
      // In a real app, you would upload to a cloud service
      // For demo purposes, we'll use a placeholder URL
      fileUrl = URL.createObjectURL(selectedFile);
      fileName = selectedFile.name;
    }
    
    sendMessageMutation.mutate({
      content: newMessage || (selectedFile ? `File allegato: ${selectedFile.name}` : ""),
      isUrgent,
      fileUrl,
      fileName,
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File troppo grande",
          description: "Il file deve essere inferiore a 10MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return <Image className="w-4 h-4 text-blue-500" />;
    }
    if (['pdf'].includes(extension || '')) {
      return <FileText className="w-4 h-4 text-red-500" />;
    }
    return <FileText className="w-4 h-4 text-gray-500" />;
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-16">
      <div className="p-4">
        <h1 className="text-xl font-bold text-sage-800 mb-4">Contatti</h1>
        
        {/* Video Call Status */}
        <div className="mb-6 p-4 bg-sage-50 rounded-lg border border-sage-200">
          <div className="flex items-center mb-3">
            <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
            <span className="text-sm font-medium text-gray-700">Stato videochiamata: Non attiva</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">Il medico può avviare una videochiamata quando necessario.</p>
          <Button 
            className="w-full bg-gray-300 text-gray-600 cursor-not-allowed" 
            disabled
          >
            <Video className="w-4 h-4 mr-2" />
            In attesa di chiamata
          </Button>
        </div>

        {/* Messages Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Messaggi</h2>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Nessun messaggio</p>
              </div>
            ) : (
              messages.map((message: any) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    message.senderId === patient?.userId
                      ? "bg-sage-50 ml-8"
                      : "bg-white shadow-sm border border-gray-200"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {message.senderId !== patient?.userId && (
                      <div className="w-8 h-8 bg-sage-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        Dr
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-800">
                          {message.senderId === patient?.userId ? "Tu" : "Dr. Medico"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(message.createdAt)}
                        </span>
                        {message.isUrgent && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            Urgente
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{message.content}</p>
                      {message.fileUrl && (
                        <div className="mt-2 p-2 bg-gray-50 rounded-lg flex items-center">
                          {getFileIcon(message.fileName || "")}
                          <span className="ml-2 text-sm text-blue-600 hover:underline cursor-pointer">
                            {message.fileName}
                          </span>
                        </div>
                      )}
                    </div>
                    {message.senderId === patient?.userId && (
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        Tu
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* File Preview */}
        {selectedFile && (
          <div className="mb-3 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              {getFileIcon(selectedFile.name)}
              <span className="ml-2 text-sm text-blue-800">{selectedFile.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFile(null)}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* New Message */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-800 mb-3">Invia messaggio</h3>
          <div className="space-y-3">
            <Textarea
              className="flex-1 resize-none focus:ring-sage-500 focus:border-sage-500"
              rows={3}
              placeholder="Scrivi un messaggio al medico..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <div className="flex items-center space-x-2">
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
                className="flex items-center"
              >
                <Paperclip className="w-4 h-4 mr-2" />
                Allega file
              </Button>
              <Button
                onClick={() => handleSendMessage(false)}
                disabled={sendMessageMutation.isPending || (!newMessage.trim() && !selectedFile)}
                className="flex-1 bg-sage-500 hover:bg-sage-600"
              >
                <Send className="w-4 h-4 mr-2" />
                {sendMessageMutation.isPending ? "Invio..." : "Invia"}
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => handleSendMessage(true)}
            disabled={sendMessageMutation.isPending || !newMessage.trim()}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Phone className="w-4 h-4 mr-2" />
            Richiedi di essere ricontattata
          </Button>
          <Button
            onClick={() => {
              setNewMessage("Ho dei dubbi sulla terapia. Potresti ricontattarmi?");
              handleSendMessage(false);
            }}
            disabled={sendMessageMutation.isPending}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Invia domanda o dubbio
          </Button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
