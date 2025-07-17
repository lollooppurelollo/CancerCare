import { useQuery } from "@tanstack/react-query";
import { Download, FileText, Play, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BottomNavigation from "@/components/ui/bottom-navigation";

interface AdviceItem {
  id: number;
  title: string;
  description: string;
  type: "file" | "video" | "link";
  url: string;
  category: string;
  uploadedBy: string;
  uploadedAt: string;
}

export default function PatientAdvice() {
  const { data: adviceItems, isLoading } = useQuery({
    queryKey: ["/api/advice"],
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="w-5 h-5 text-blue-500" />;
      case "file":
        return <FileText className="w-5 h-5 text-green-500" />;
      case "link":
        return <ExternalLink className="w-5 h-5 text-purple-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "alimentazione":
        return "bg-green-100 text-green-800";
      case "esercizio":
        return "bg-blue-100 text-blue-800";
      case "farmaci":
        return "bg-orange-100 text-orange-800";
      case "benessere":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleItemClick = (item: AdviceItem) => {
    if (item.type === "video") {
      // Open video in a modal or new page
      window.open(item.url, "_blank");
    } else if (item.type === "file") {
      // Download file
      window.open(item.url, "_blank");
    } else if (item.type === "link") {
      // Open external link
      window.open(item.url, "_blank");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-sage-500 rounded-full flex items-center justify-center mb-4">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-sage-600">Caricamento consigli...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-16">
      {/* Header */}
      <div className="bg-sage-500 text-white p-4">
        <h1 className="text-lg font-bold">Consigli</h1>
        <p className="text-sage-100 text-sm">Risorse e consigli dal tuo medico</p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {!adviceItems || adviceItems.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nessun consiglio disponibile</p>
            <p className="text-gray-400 text-sm mt-2">
              Il tuo medico non ha ancora caricato consigli o risorse
            </p>
          </div>
        ) : (
          adviceItems.map((item: AdviceItem) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {getIcon(item.type)}
                    <div>
                      <CardTitle className="text-sm font-medium text-gray-900">
                        {item.title}
                      </CardTitle>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <Badge className={`text-xs ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    <p>Caricato da: {item.uploadedBy}</p>
                    <p>{new Date(item.uploadedAt).toLocaleDateString("it-IT")}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleItemClick(item)}
                    className="bg-sage-500 hover:bg-sage-600 text-white"
                  >
                    {item.type === "video" && (
                      <>
                        <Play className="w-4 h-4 mr-1" />
                        Guarda
                      </>
                    )}
                    {item.type === "file" && (
                      <>
                        <Download className="w-4 h-4 mr-1" />
                        Scarica
                      </>
                    )}
                    {item.type === "link" && (
                      <>
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Apri
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}