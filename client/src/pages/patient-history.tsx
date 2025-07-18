import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import BottomNavigation from "@/components/ui/bottom-navigation";

export default function PatientHistory() {
  const { data: diaryEntries = [] } = useQuery({
    queryKey: ["/api/diary-entries"],
  });

  const { data: symptoms = [] } = useQuery({
    queryKey: ["/api/symptoms"],
  });

  // Group symptoms by date
  const symptomsByDate = symptoms.reduce((acc: any, symptom: any) => {
    if (!acc[symptom.date]) {
      acc[symptom.date] = [];
    }
    acc[symptom.date].push(symptom);
    return acc;
  }, {});

  // Group diary entries by date
  const diaryByDate = diaryEntries.reduce((acc: any, entry: any) => {
    acc[entry.date] = entry;
    return acc;
  }, {});

  // Get all unique dates and sort them
  const allDates = Array.from(new Set([
    ...diaryEntries.map((entry: any) => entry.date),
    ...symptoms.map((symptom: any) => symptom.date)
  ])).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d MMMM yyyy", { locale: it });
    } catch {
      return dateString;
    }
  };

  const getSymptomBadgeColor = (symptom: any) => {
    if (!symptom.present) return "bg-green-100 text-green-800";
    
    if (symptom.symptomType === "diarrea" && symptom.diarrheaCount) {
      return symptom.diarrheaCount >= 3 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800";
    }
    
    if (symptom.intensity && symptom.intensity > 7) {
      return "bg-red-100 text-red-800";
    }
    
    if (symptom.intensity && symptom.intensity > 4) {
      return "bg-yellow-100 text-yellow-800";
    }
    
    return "bg-blue-100 text-blue-800";
  };

  const getSymptomText = (symptom: any) => {
    if (!symptom.present) return "Assente";
    
    if (symptom.symptomType === "diarrea" && symptom.diarrheaCount) {
      return `${symptom.diarrheaCount} scariche`;
    }
    
    if (symptom.intensity) {
      return `${symptom.intensity}/10`;
    }
    
    return "Presente";
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
      <div className="p-4">
        <h1 className="text-xl font-bold text-sage-800 mb-4">Storico Sintomi e Diario</h1>
        
        {allDates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nessun dato disponibile</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allDates.map((date) => (
              <div key={date} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-800">{formatDate(date)}</h3>
                  <span className="text-sm text-sage-600">
                    {/* Add medication status here if needed */}
                  </span>
                </div>
                
                {diaryByDate[date] && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Diario:</h4>
                    <p className="text-sm text-gray-600">{diaryByDate[date].content}</p>
                  </div>
                )}
                
                {symptomsByDate[date] && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Sintomi riportati:</h4>
                    <div className="flex flex-wrap gap-2">
                      {symptomsByDate[date].map((symptom: any) => (
                        <span
                          key={symptom.id}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getSymptomBadgeColor(symptom)}`}
                        >
                          {symptom.symptomType === "stanchezza" && "Stanchezza"}
                          {symptom.symptomType === "malessere" && "Malessere"}
                          {symptom.symptomType === "rash" && "Rash cutaneo"}
                          {symptom.symptomType === "diarrea" && "Diarrea"}
                          {symptom.symptomType === "dolore_addominale" && "Dolore addominale"}
                          {symptom.symptomType === "febbre" && "Febbre"}
                          {symptom.symptomType === "sintomi_influenzali" && "Sintomi influenzali"}
                          : {getSymptomText(symptom)}
                        </span>
                      ))}
                      {symptomsByDate[date].length === 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          Nessun sintomo
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {!diaryByDate[date] && !symptomsByDate[date] && (
                  <p className="text-sm text-gray-500 italic">Nessun dato per questa data</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
