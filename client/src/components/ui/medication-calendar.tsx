import { useMemo } from "react";

interface MedicationCalendarProps {
  medication: string;
}

export default function MedicationCalendar({ medication }: MedicationCalendarProps) {
  const weekDays = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
  
  const currentWeek = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return {
        date: date.getDate(),
        dayName: weekDays[i],
        shouldTake: getShouldTake(medication, date),
      };
    });
  }, [medication]);

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
      <div className="grid grid-cols-7 gap-1">
        {currentWeek.map((day) => (
          <div key={day.dayName} className="text-center">
            <div className="text-xs text-gray-500 mb-1">{day.dayName}</div>
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                day.shouldTake 
                  ? "bg-sage-500 text-white" 
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              {day.date}
            </div>
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
