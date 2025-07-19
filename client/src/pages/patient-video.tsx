import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Video, Phone, MessageCircle, Send, HelpCircle, Paperclip, FileText, Image, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useKeyboardVisibility } from "@/hooks/use-keyboard-visibility";
import { apiRequest } from "@/lib/queryClient";
import BottomNavigation from "@/components/ui/bottom-navigation";

export default function PatientVideo() {
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showUrgentDialog, setShowUrgentDialog] = useState(false);
  const [urgentMessage, setUrgentMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Keyboard visibility hooks for text inputs
  const messageTextareaRef = useKeyboardVisibility();
  const urgentTextareaRef = useKeyboardVisibility();

  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: ["/api/patients/me"],
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/messages"],
    enabled: !!patient?.id, // Solo carica messaggi quando patient è disponibile
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, isUrgent, fileUrl, fileName }: { content: string; isUrgent: boolean; fileUrl?: string; fileName?: string }) => {
      if (!patient?.id) {
        throw new Error("Dati paziente non disponibili");
      }
      await apiRequest("POST", "/api/messages", {
        patientId: patient.id,
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

  const sendUrgentAlert = useMutation({
    mutationFn: async (message: string) => {
      if (!patient?.id) {
        throw new Error("Dati paziente non disponibili");
      }
      await apiRequest("POST", "/api/messages", {
        patientId: patient.id,
        content: message || "Segnalazione medica urgente: La paziente richiede assistenza immediata dal medico.",
        isUrgent: true,
      });
    },
    onSuccess: () => {
      toast({
        title: "Segnalazione inviata",
        description: "Il medico è stato avvisato della tua richiesta urgente.",
      });
      setShowUrgentDialog(false);
      setUrgentMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile inviare la segnalazione. Riprova.",
        variant: "destructive",
      });
    },
  });

  const deleteMessage = useMutation({
    mutationFn: async (messageId: number) => {
      await apiRequest("DELETE", `/api/messages/${messageId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Messaggio eliminato",
        description: "Il messaggio è stato eliminato con successo.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile eliminare il messaggio. Riprova.",
        variant: "destructive",
      });
    },
  });

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

  // Loading state
  if (patientLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600 mx-auto mb-4"></div>
          <p className="text-sage-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
      <div className="p-4">
        <h1 className="text-xl font-bold text-sage-800 mb-4">Contatti</h1>
        
        {/* Messages Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Messaggi</h2>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-3">
                <p className="text-gray-500 text-sm">Nessun messaggio</p>
              </div>
            ) : (
              messages.map((message: any) => (
                <div
                  key={message.id}
                  className={`p-2 rounded-lg ${
                    message.senderId === patient?.userId
                      ? "bg-sage-50 ml-6"
                      : "bg-white shadow-sm border border-gray-200"
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.senderId !== patient?.userId && (
                      <div className="w-6 h-6 bg-sage-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
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
                          <span className="text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded">
                            Urgente
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{message.content}</p>
                      {message.fileUrl && (
                        <div className="mt-1 p-1.5 bg-gray-50 rounded flex items-center">
                          {getFileIcon(message.fileName || "")}
                          <span className="ml-1 text-sm text-blue-600 hover:underline cursor-pointer">
                            {message.fileName}
                          </span>
                        </div>
                      )}
                    </div>
                    {message.senderId === patient?.userId && (
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMessage.mutate(message.id)}
                          disabled={deleteMessage.isPending}
                          className="h-5 w-5 p-0 text-red-600 hover:text-red-800"
                        >
                          <X className="w-2.5 h-2.5" />
                        </Button>
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          Tu
                        </div>
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
              ref={messageTextareaRef}
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



        {/* Medical Alert Section */}
        <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
          <h3 className="text-md font-semibold text-red-800 mb-3">Segnalazione Medica Urgente</h3>
          <p className="text-sm text-red-700 mb-3">
            Utilizza questa funzione solo per emergenze mediche che richiedono attenzione immediata.
          </p>
          <Button
            onClick={() => setShowUrgentDialog(true)}
            disabled={sendUrgentAlert.isPending}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            Invia Segnalazione Medica Urgente
          </Button>

          {/* Recent Urgent Messages - Today Only */}
          {messages.filter((msg: any) => {
            const today = new Date().toISOString().split('T')[0];
            const messageDate = new Date(msg.createdAt).toISOString().split('T')[0];
            return msg.isUrgent && msg.senderId === patient?.userId && messageDate === today;
          }).length > 0 && (
            <div className="mt-4 p-3 bg-red-100 rounded-lg border border-red-300">
              <h4 className="text-sm font-medium text-red-800 mb-2">Segnalazioni urgenti di oggi:</h4>
              <div className="space-y-2">
                {messages
                  .filter((msg: any) => {
                    const today = new Date().toISOString().split('T')[0];
                    const messageDate = new Date(msg.createdAt).toISOString().split('T')[0];
                    return msg.isUrgent && msg.senderId === patient?.userId && messageDate === today;
                  })
                  .slice(0, 3)
                  .map((msg: any) => (
                    <div key={msg.id} className="flex items-start justify-between bg-white p-2 rounded border">
                      <div className="flex-1">
                        <p className="text-xs text-gray-600">{msg.content}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(msg.createdAt).toLocaleString('it-IT')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMessage.mutate(msg.id)}
                        disabled={deleteMessage.isPending}
                        className="ml-2 h-6 w-6 p-0 text-red-600 hover:text-red-800"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Video Call Status - Moved to bottom */}
        <div className="mt-6 p-4 bg-sage-50 rounded-lg border border-sage-200">
          <div className="flex items-center mb-3">
            <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
            <span className="text-sm font-medium text-gray-700">Stato videochiamata: Non attiva</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">Il medico può avviare una videochiamata quando necessario.</p>
          <Button 
            className="w-full h-10 bg-gray-300 text-gray-600 cursor-not-allowed text-sm" 
            disabled
          >
            <Video className="w-4 h-4 mr-2" />
            In attesa di chiamata
          </Button>
        </div>

      </div>

      <BottomNavigation />

      {/* Urgent Message Dialog */}
      <Dialog open={showUrgentDialog} onOpenChange={setShowUrgentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Segnalazione Medica Urgente</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 mb-4">
            Invia una segnalazione medica urgente al tuo medico per richiedere assistenza immediata.
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Descrizione della situazione urgente (opzionale):
              </label>
              <Textarea
                ref={urgentTextareaRef}
                placeholder="Descrivi brevemente i sintomi o la situazione che richiede attenzione medica urgente..."
                value={urgentMessage}
                onChange={(e) => setUrgentMessage(e.target.value)}
                className="w-full h-24 resize-none focus:ring-red-500 focus:border-red-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Se non scrivi nulla, verrà inviato un messaggio di allerta standard.
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowUrgentDialog(false);
                setUrgentMessage("");
              }}
            >
              Annulla
            </Button>
            <Button
              onClick={() => sendUrgentAlert.mutate(urgentMessage)}
              disabled={sendUrgentAlert.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {sendUrgentAlert.isPending ? "Invio..." : "Invia Segnalazione Urgente"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
