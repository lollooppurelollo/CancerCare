import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Calendar, Save } from "lucide-react";
import { Button } from "./button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Input } from "./input";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { apiRequest } from "@/lib/queryClient";

interface MedicationCalendarProps {
  medication: string;
  patientId?: number;
  isDoctorMode?: boolean;
}

export default function MedicationCalendar({ medication, patientId, isDoctorMode = false }: MedicationCalendarProps) {
  const weekDays = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
  const months = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [viewMode, setViewMode] = useState<"week" | "month">("month"); // "week" for single week, "month" for 4 weeks
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Doctor-specific state for dropdown popup
  const [showDropdownDialog, setShowDropdownDialog] = useState(false);
  const [dropdownSelectedDate, setDropdownSelectedDate] = useState<string | null>(null);
  const [selectedEventType, setSelectedEventType] = useState("taken");
  
  // State for therapy week pause dialog
  const [showTherapyPauseDialog, setShowTherapyPauseDialog] = useState(false);
  const [startDate, setStartDate] = useState("");
  
  const queryClient = useQueryClient();

  // Get missed medication data if patientId is provided
  const { data: missedMedications = [] } = useQuery({
    queryKey: patientId ? ["/api/missed-medication", patientId] : ["/api/missed-medication"],
    enabled: !!patientId,
  });

  // Get calendar events for doctor mode
  const { data: calendarEvents = [] } = useQuery({
    queryKey: ["/api/calendar-events", patientId],
    enabled: !!(patientId && isDoctorMode),
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

  // Doctor mutation to update calendar events
  const updateCalendarEvent = useMutation({
    mutationFn: async ({ date, eventType }: { date: string; eventType: string }) => {
      if (!patientId) throw new Error("Patient ID required");
      return await apiRequest("POST", `/api/calendar-events`, {
        patientId,
        date,
        eventType,
      });
    },
    onSuccess: () => {
      // Invalidate calendar events to refresh colors
      queryClient.invalidateQueries({ 
        queryKey: ["/api/calendar-events", patientId]
      });
      // Also invalidate missed medication in case we set a day as missed
      queryClient.invalidateQueries({ 
        queryKey: patientId ? ["/api/missed-medication", patientId] : ["/api/missed-medication"]
      });
    },
  });

  // Mutation to add a therapy pause week
  const addTherapyPauseWeek = useMutation({
    mutationFn: async ({ startDate }: { startDate: string }) => {
      if (!patientId) throw new Error("Patient ID required");
      
      // Create pause events for 7 consecutive days starting from startDate
      const promises = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        
        promises.push(
          apiRequest("POST", `/api/calendar-events`, {
            patientId,
            date: dateString,
            eventType: 'pause',
          })
        );
      }
      
      // For ribociclib and palbociclib, we need to recalculate the 3-on-1-off cycle
      // after the added pause week. For abemaciclib, only add the pause week.
      if (medication === 'ribociclib' || medication === 'palbociclib') {
        // Add logic to recalculate the cycle starting from the end of the pause week
        const endOfPauseDate = new Date(startDate);
        endOfPauseDate.setDate(endOfPauseDate.getDate() + 7);
        
        // Calculate next cycles: 3 weeks treatment, 1 week pause
        for (let cycle = 0; cycle < 8; cycle++) { // Add 8 more cycles (32 weeks)
          for (let week = 0; week < 4; week++) {
            const isTherapyWeek = week < 3; // First 3 weeks are therapy, 4th week is pause
            
            for (let day = 0; day < 7; day++) {
              const cycleDate = new Date(endOfPauseDate);
              cycleDate.setDate(endOfPauseDate.getDate() + (cycle * 28) + (week * 7) + day);
              const cycleDateString = cycleDate.toISOString().split('T')[0];
              
              promises.push(
                apiRequest("POST", `/api/calendar-events`, {
                  patientId,
                  date: cycleDateString,
                  eventType: isTherapyWeek ? 'taken' : 'pause',
                })
              );
            }
          }
        }
      }
      
      return await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/calendar-events", patientId]
      });
    },
  });

  // Create a set of missed dates for quick lookup
  const missedDatesSet = useMemo(() => {
    const dates = new Set<string>();
    if (Array.isArray(missedMedications)) {
      (missedMedications as any[]).forEach((entry: any) => {
        if (entry.missedDates && Array.isArray(entry.missedDates)) {
          entry.missedDates.forEach((date: string) => dates.add(date));
        }
      });
    }
    return dates;
  }, [missedMedications]);

  // Helper function to get calendar event type for a date
  const getCalendarEventType = (dateString: string) => {
    if (Array.isArray(calendarEvents)) {
      const event = (calendarEvents as any[]).find((event: any) => event.date === dateString);
      return event?.eventType ?? null;
    }
    return null;
  };
  
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
        const calendarEventType = isDoctorMode ? getCalendarEventType(dateString) : null;
        
        return {
          date: date.getDate(),
          month: date.getMonth(),
          monthName: months[date.getMonth()],
          dayName: weekDays[dayIndex],
          shouldTake: getShouldTake(medication, date),
          isToday: date.toDateString() === today.toDateString(),
          isMissed: missedDatesSet.has(dateString),
          fullDate: date,
          dateString,
          calendarEventType,
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
            {week.map((day, dayIndex) => {
              // Determine day color based on mode and status
              let dayColor = "";
              let cursorClass = "";
              
              if (isDoctorMode && day.calendarEventType) {
                // Doctor mode with calendar event override
                switch (day.calendarEventType) {
                  case 'taken': // Giorno di terapia (green sage)
                    dayColor = "bg-sage-500 text-white";
                    break;
                  case 'pause': // Giorno di pausa (gray)
                    dayColor = "bg-gray-300 text-gray-600";
                    break;
                  case 'missed': // Terapia non assunta erroneamente (light red)
                    dayColor = "bg-red-100 text-red-700 border-2 border-red-200";
                    break;
                  default: // Fallback to normal schedule
                    dayColor = day.shouldTake ? "bg-sage-500 text-white" : "bg-gray-300 text-gray-600";
                    break;
                }
                cursorClass = "cursor-pointer hover:scale-105 transition-all duration-200";
              } else {
                // Patient mode or no doctor override
                if (day.isMissed) {
                  dayColor = "bg-red-100 text-red-700 border-2 border-red-200 cursor-pointer hover:bg-red-200 transition-colors";
                } else if (day.shouldTake) {
                  dayColor = "bg-sage-500 text-white";
                  if (isDoctorMode) cursorClass = "cursor-pointer hover:scale-105 transition-all duration-200";
                } else {
                  dayColor = "bg-gray-300 text-gray-600";
                  if (isDoctorMode) cursorClass = "cursor-pointer hover:scale-105 transition-all duration-200";
                }
              }

              return (
                <div key={`${weekIndex}-${dayIndex}`} className="text-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${dayColor} ${cursorClass} ${
                      day.isToday ? "ring-2 ring-sage-600" : ""
                    }`}
                    onClick={() => {
                      if (isDoctorMode && patientId) {
                        // Doctor mode: show dropdown dialog
                        setDropdownSelectedDate(day.dateString);
                        // Set current eventType or default based on schedule
                        const currentEventType = day.calendarEventType || (day.shouldTake ? 'taken' : 'pause');
                        setSelectedEventType(currentEventType);
                        setShowDropdownDialog(true);
                      } else if (day.isMissed && patientId) {
                        // Patient mode: show confirmation dialog for missed days
                        setSelectedDate(day.dateString);
                        setShowConfirmDialog(true);
                      }
                    }}
                  >
                    {day.date}
                  </div>
                </div>
              );
            })}
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

      {/* Doctor Dropdown Dialog */}
      <Dialog open={showDropdownDialog} onOpenChange={setShowDropdownDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifica Status Giorno</DialogTitle>
            <DialogDescription>
              Seleziona lo status per questo giorno dal menu a tendina.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status del giorno:</label>
              <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="taken">Giorno di terapia</SelectItem>
                  <SelectItem value="pause">Giorno di pausa</SelectItem>
                  <SelectItem value="missed">Terapia non assunta erroneamente</SelectItem>
                  <SelectItem value="therapy_week_pause">Imposta settimana di pausa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDropdownDialog(false)}>
              Annulla
            </Button>
            <Button 
              onClick={() => {
                if (dropdownSelectedDate && patientId) {
                  if (selectedEventType === "therapy_week_pause") {
                    // Open therapy pause dialog
                    setShowDropdownDialog(false);
                    setShowTherapyPauseDialog(true);
                    // Set the selected date as start date for therapy pause
                    setStartDate(dropdownSelectedDate);
                  } else {
                    // Normal single day update
                    updateCalendarEvent.mutate({
                      date: dropdownSelectedDate,
                      eventType: selectedEventType,
                    });
                    setShowDropdownDialog(false);
                    setDropdownSelectedDate(null);
                  }
                }
              }}
              disabled={updateCalendarEvent.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {selectedEventType === "therapy_week_pause" ? "Continua" : "Salva"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Therapy Pause Week Dialog */}
      <Dialog open={showTherapyPauseDialog} onOpenChange={setShowTherapyPauseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Aggiungi Settimana Pausa Terapeutica</DialogTitle>
            <DialogDescription>
              Inserisci la data di inizio per aggiungere una settimana di pausa dalla terapia (7 giorni consecutivi).
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data di inizio pausa:</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Verrà aggiunta una settimana completa di pausa (7 giorni) a partire da questa data.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTherapyPauseDialog(false)}>
              Annulla
            </Button>
            <Button 
              onClick={() => {
                if (startDate && patientId) {
                  addTherapyPauseWeek.mutate({ startDate });
                  setShowTherapyPauseDialog(false);
                  setStartDate("");
                  setDropdownSelectedDate(null);
                }
              }}
              disabled={addTherapyPauseWeek.isPending || !startDate}
            >
              <Save className="w-4 h-4 mr-2" />
              Aggiungi Pausa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
