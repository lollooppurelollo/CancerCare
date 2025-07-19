import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "./button";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "./alert-dialog";
import { apiRequest } from "@/lib/queryClient";

interface MedicationCalendarProps {
  medication: string;
  patientId?: number;
}

export default function MedicationCalendar({ medication, patientId }: MedicationCalendarProps) {
  const weekDays = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
  const months = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [viewMode, setViewMode] = useState<"week" | "month">("month"); // "week" for single week, "month" for 4 weeks
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Get missed medication data if patientId is provided
  const { data: missedMedications = [] } = useQuery({
    queryKey: patientId ? ["/api/missed-medication", patientId] : ["/api/missed-medication"],
    enabled: !!patientId,
  });

  // Mutation to remove missed medication
  const removeMissedMedication = useMutation({
    mutationFn: async (dateToRemove: string) => {
      console.log(`Attempting to remove missed medication for patient ${patientId} on date ${dateToRemove}`);
      const response = await apiRequest("DELETE", `/api/missed-medication/${patientId}/${dateToRemove}`);
      console.log('Remove missed medication response:', response);
      return response;
    },
    onSuccess: () => {
      console.log('Successfully removed missed medication, invalidating queries');
      // Invalidate the missed medication query to refresh the data
      queryClient.invalidateQueries({ 
        queryKey: patientId ? ["/api/missed-medication", patientId] : ["/api/missed-medication"]
      });
    },
    onError: (error) => {
      console.error('Error removing missed medication:', error);
    },
  });

  // Create a set of missed dates for quick lookup
  const missedDatesSet = useMemo(() => {
    const dates = new Set<string>();
    missedMedications.forEach((entry: any) => {
      if (entry.missedDates && Array.isArray(entry.missedDates)) {
        entry.missedDates.forEach((date: string) => dates.add(date));
      }
    });
    return dates;
  }, [missedMedications]);
  
  const weeks = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
    startOfWeek.setDate(startOfWeek.getDate() + (currentWeekOffset * 7));
    
    const weeksToShow = viewMode === "week" ? 1 : 4;
    
    return Array.from({ length: weeksToShow }, (_, weekIndex) => {
      return Array.from({ length: 7 }, (_, dayIndex) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + (weekIndex * 7) + dayIndex);
        const dateString = date.toISOString().split('T')[0];
        return {
          date: date.getDate(),
          month: date.getMonth(),
          monthName: months[date.getMonth()],
          dayName: weekDays[dayIndex],
          shouldTake: getShouldTake(medication, date),
          isToday: date.toDateString() === today.toDateString(),
          isMissed: missedDatesSet.has(dateString),
          fullDate: date,
        };
      });
    });
  }, [medication, currentWeekOffset, viewMode, missedDatesSet]);

  // Logic for medication schedules
  function getShouldTake(medication: string, date: Date): boolean {
    const cycleStart = new Date('2024-01-01'); // Reference start date
    const daysSinceStart = Math.floor((date.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24));
    
    if (medication === "abemaciclib") {
      // Continuous daily therapy for abemaciclib (no pause days unless set by doctor)
      return true;
    } else if (medication === "ribociclib" || medication === "palbociclib") {
      // 21 days on, 7 days off cycle
      const cycleDay = daysSinceStart % 28;
      return cycleDay < 21;
    }
    
    return false;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentWeekOffset(currentWeekOffset - 1)}
          className="p-1"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-sage-700">
            {viewMode === "week" ? "Settimana" : "Mese"} - {weeks[0]?.[0]?.monthName}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode(viewMode === "week" ? "month" : "week")}
            className="p-1"
          >
            <Calendar className="w-4 h-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
          className="p-1"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs text-gray-500 font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar weeks */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((day, dayIndex) => (
              <div key={`${weekIndex}-${dayIndex}`} className="text-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    day.isMissed 
                      ? "bg-red-100 text-red-700 border-2 border-red-200 cursor-pointer hover:bg-red-200 transition-colors" 
                      : day.shouldTake 
                        ? "bg-sage-500 text-white" 
                        : "bg-gray-300 text-gray-600"
                  } ${
                    day.isToday 
                      ? "ring-2 ring-sage-600" 
                      : ""
                  }`}
                  onClick={() => {
                    // If the day is marked as missed and we have a patientId, show confirmation dialog
                    if (day.isMissed && patientId) {
                      const dateString = day.fullDate.toISOString().split('T')[0];
                      setSelectedDate(dateString);
                      setShowConfirmDialog(true);
                    }
                  }}
                >
                  {day.date}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      
      <div className="flex items-center mt-3 text-xs">
        <div className="w-3 h-3 bg-sage-500 rounded-full mr-2"></div>
        <span className="text-gray-600 mr-4">Giorni di trattamento</span>
        <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
        <span className="text-gray-600 mr-4">Giorni di pausa dalla terapia</span>
        <div className="w-3 h-3 bg-red-100 border border-red-200 rounded-full mr-2"></div>
        <span className="text-gray-600">Terapia non assunta</span>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma Ripristino</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler ripristinare questo giorno come "terapia assunta"? 
              Il giorno tornerà verde e non sarà più contrassegnato come mancato.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (selectedDate) {
                  removeMissedMedication.mutate(selectedDate);
                  setShowConfirmDialog(false);
                  setSelectedDate(null);
                }
              }}
            >
              Ripristina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
