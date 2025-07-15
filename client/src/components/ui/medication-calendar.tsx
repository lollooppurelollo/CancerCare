import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

interface MedicationCalendarProps {
  medication: string;
}

export default function MedicationCalendar({ medication }: MedicationCalendarProps) {
  const weekDays = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  
  const weeks = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
    startOfWeek.setDate(startOfWeek.getDate() + (currentWeekOffset * 7));
    
    return Array.from({ length: 4 }, (_, weekIndex) => {
      return Array.from({ length: 7 }, (_, dayIndex) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + (weekIndex * 7) + dayIndex);
        return {
          date: date.getDate(),
          month: date.getMonth(),
          dayName: weekDays[dayIndex],
          shouldTake: getShouldTake(medication, date),
          isToday: date.toDateString() === today.toDateString(),
        };
      });
    });
  }, [medication, currentWeekOffset]);

  // Logic for medication schedules
  function getShouldTake(medication: string, date: Date): boolean {
    const cycleStart = new Date('2024-01-01'); // Reference start date
    const daysSinceStart = Math.floor((date.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24));
    
    if (medication === "abemaciclib") {
      // Continuous daily for abemaciclib
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
        <h3 className="text-sm font-medium text-sage-700">Calendario terapia (4 settimane)</h3>
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
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium cursor-pointer ${
                    day.shouldTake 
                      ? "bg-sage-500 text-white" 
                      : "bg-gray-300 text-gray-600"
                  } ${
                    day.isToday 
                      ? "ring-2 ring-sage-600" 
                      : ""
                  }`}
                  onClick={() => {
                    // TODO: Toggle day functionality
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
        <span className="text-gray-600 mr-4">Giorno di assunzione</span>
        <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
        <span className="text-gray-600">Giorno di pausa</span>
      </div>
    </div>
  );
}
