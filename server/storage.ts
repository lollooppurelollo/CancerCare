import { 
  users, patients, medicationSchedules, diaryEntries, symptoms, messages, alerts, adviceItems, missedMedication, dosageHistory, calendarEvents,
  type User, type InsertUser, type Patient, type InsertPatient,
  type MedicationSchedule, type InsertMedicationSchedule,
  type DiaryEntry, type InsertDiaryEntry, type Symptom, type InsertSymptom,
  type Message, type InsertMessage, type Alert, type InsertAlert,
  type AdviceItem, type InsertAdviceItem, type MissedMedication, type InsertMissedMedication,
  type DosageHistory, type InsertDosageHistory, type CalendarEvent, type InsertCalendarEvent
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, or, sql, isNull } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
  deleteUser(id: number): Promise<void>;

  // Patient operations
  createPatient(patient: InsertPatient): Promise<Patient>;
  getPatientByUserId(userId: number): Promise<Patient | undefined>;
  getPatientById(id: number): Promise<Patient | undefined>;
  getAllPatients(): Promise<Patient[]>;
  updatePatient(id: number, updates: Partial<InsertPatient>): Promise<Patient>;
  searchPatients(query: string): Promise<Patient[]>;
  getDoctors(): Promise<User[]>;

  // Medication schedule operations
  createMedicationSchedule(schedule: InsertMedicationSchedule): Promise<MedicationSchedule>;
  getMedicationScheduleByPatientAndDate(patientId: number, date: string): Promise<MedicationSchedule | undefined>;
  getMedicationScheduleByPatientAndDateRange(patientId: number, startDate: string, endDate: string): Promise<MedicationSchedule[]>;
  updateMedicationSchedule(id: number, updates: Partial<InsertMedicationSchedule>): Promise<MedicationSchedule>;
  bulkCreateMedicationSchedules(schedules: InsertMedicationSchedule[]): Promise<void>;

  // Diary operations
  createDiaryEntry(entry: InsertDiaryEntry): Promise<DiaryEntry>;
  getDiaryEntryByPatientAndDate(patientId: number, date: string): Promise<DiaryEntry | undefined>;
  getDiaryEntriesByPatient(patientId: number): Promise<DiaryEntry[]>;
  updateDiaryEntry(id: number, updates: Partial<InsertDiaryEntry>): Promise<DiaryEntry>;

  // Symptom operations
  createSymptom(symptom: InsertSymptom): Promise<Symptom>;
  getSymptomsByPatientAndDate(patientId: number, date: string): Promise<Symptom[]>;
  getSymptomsByPatient(patientId: number): Promise<Symptom[]>;
  updateSymptom(id: number, updates: Partial<InsertSymptom>): Promise<Symptom>;
  bulkCreateSymptoms(symptoms: InsertSymptom[]): Promise<void>;

  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByPatient(patientId: number): Promise<Message[]>;
  getAllMessages(): Promise<Message[]>;
  deleteMessage(id: number): Promise<void>;

  // Alert operations
  createAlert(alert: InsertAlert): Promise<Alert>;
  getActiveAlerts(): Promise<Alert[]>;
  getAlertsByPatient(patientId: number): Promise<Alert[]>;
  resolveAlert(id: number): Promise<Alert>;

  // Advice items operations
  getAdviceItems(): Promise<AdviceItem[]>;
  createAdviceItem(advice: InsertAdviceItem): Promise<AdviceItem>;
  deleteAdviceItem(id: number): Promise<void>;

  // Missed medication operations
  createMissedMedication(missedMed: InsertMissedMedication): Promise<MissedMedication>;
  getMissedMedicationByPatient(patientId: number): Promise<MissedMedication[]>;
  getMissedMedicationInLastMonth(patientId: number): Promise<MissedMedication[]>;

  // Advanced analytics operations
  getAdvancedPatientAnalytics(): Promise<any[]>;
  getSymptomAnalyticsByDosage(symptomType: string, treatmentSetting?: string): Promise<any>;
  getDosageReductionAnalytics(medication?: string, treatmentSetting?: string): Promise<any>;

  // Calendar events operations
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  getCalendarEventsByPatient(patientId: number): Promise<CalendarEvent[]>;
  getCalendarEventsByPatientAndDateRange(patientId: number, startDate: string, endDate: string): Promise<CalendarEvent[]>;
  getCalendarEventByPatientAndDate(patientId: number, date: string): Promise<CalendarEvent | null>;
  updateCalendarEvent(id: number, updates: Partial<InsertCalendarEvent>): Promise<CalendarEvent>;
  deleteCalendarEvent(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async createUser(userData: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [user] = await db
      .insert(users)
      .values({ ...userData, password: hashedPassword })
      .returning();
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Patient operations
  async createPatient(patientData: InsertPatient): Promise<Patient> {
    const [patient] = await db
      .insert(patients)
      .values(patientData)
      .returning();
    return patient;
  }

  async getPatientByUserId(userId: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.userId, userId));
    return patient;
  }

  async getPatientById(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient;
  }

  async getAllPatients(): Promise<Patient[]> {
    return await db.select().from(patients).where(eq(patients.isActive, true));
  }

  async updatePatient(id: number, updates: Partial<InsertPatient>): Promise<Patient> {
    const [patient] = await db
      .update(patients)
      .set(updates)
      .where(eq(patients.id, id))
      .returning();
    return patient;
  }

  async searchPatients(query: string): Promise<Patient[]> {
    return await db
      .select()
      .from(patients)
      .where(
        and(
          eq(patients.isActive, true),
          or(
            eq(patients.firstName, query),
            eq(patients.lastName, query)
          )
        )
      );
  }

  async getDoctors(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.role, "doctor"));
  }

  // Medication schedule operations
  async createMedicationSchedule(scheduleData: InsertMedicationSchedule): Promise<MedicationSchedule> {
    const [schedule] = await db
      .insert(medicationSchedules)
      .values(scheduleData)
      .returning();
    return schedule;
  }

  async getMedicationScheduleByPatientAndDate(patientId: number, date: string): Promise<MedicationSchedule | undefined> {
    const [schedule] = await db
      .select()
      .from(medicationSchedules)
      .where(
        and(
          eq(medicationSchedules.patientId, patientId),
          eq(medicationSchedules.date, date)
        )
      );
    return schedule;
  }

  async getMedicationScheduleByPatientAndDateRange(patientId: number, startDate: string, endDate: string): Promise<MedicationSchedule[]> {
    return await db
      .select()
      .from(medicationSchedules)
      .where(
        and(
          eq(medicationSchedules.patientId, patientId),
          gte(medicationSchedules.date, startDate),
          lte(medicationSchedules.date, endDate)
        )
      );
  }

  async updateMedicationSchedule(id: number, updates: Partial<InsertMedicationSchedule>): Promise<MedicationSchedule> {
    const [schedule] = await db
      .update(medicationSchedules)
      .set(updates)
      .where(eq(medicationSchedules.id, id))
      .returning();
    return schedule;
  }

  async bulkCreateMedicationSchedules(schedules: InsertMedicationSchedule[]): Promise<void> {
    await db.insert(medicationSchedules).values(schedules);
  }

  // Diary operations
  async createDiaryEntry(entryData: InsertDiaryEntry): Promise<DiaryEntry> {
    const [entry] = await db
      .insert(diaryEntries)
      .values(entryData)
      .returning();
    return entry;
  }

  async getDiaryEntryByPatientAndDate(patientId: number, date: string): Promise<DiaryEntry | undefined> {
    const [entry] = await db
      .select()
      .from(diaryEntries)
      .where(
        and(
          eq(diaryEntries.patientId, patientId),
          eq(diaryEntries.date, date)
        )
      );
    return entry;
  }

  async getDiaryEntriesByPatient(patientId: number): Promise<DiaryEntry[]> {
    return await db
      .select()
      .from(diaryEntries)
      .where(eq(diaryEntries.patientId, patientId))
      .orderBy(desc(diaryEntries.date));
  }

  async updateDiaryEntry(id: number, updates: Partial<InsertDiaryEntry>): Promise<DiaryEntry> {
    const [entry] = await db
      .update(diaryEntries)
      .set(updates)
      .where(eq(diaryEntries.id, id))
      .returning();
    return entry;
  }

  // Symptom operations
  async createSymptom(symptomData: InsertSymptom): Promise<Symptom> {
    const [symptom] = await db
      .insert(symptoms)
      .values(symptomData)
      .returning();
    return symptom;
  }

  async getSymptomsByPatientAndDate(patientId: number, date: string): Promise<Symptom[]> {
    return await db
      .select()
      .from(symptoms)
      .where(
        and(
          eq(symptoms.patientId, patientId),
          eq(symptoms.date, date)
        )
      );
  }

  async getSymptomsByPatient(patientId: number): Promise<Symptom[]> {
    return await db
      .select()
      .from(symptoms)
      .where(eq(symptoms.patientId, patientId))
      .orderBy(desc(symptoms.date));
  }

  async updateSymptom(id: number, updates: Partial<InsertSymptom>): Promise<Symptom> {
    const [symptom] = await db
      .update(symptoms)
      .set(updates)
      .where(eq(symptoms.id, id))
      .returning();
    return symptom;
  }

  async bulkCreateSymptoms(symptomsData: InsertSymptom[]): Promise<void> {
    await db.insert(symptoms).values(symptomsData);
  }

  // Message operations
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(messageData)
      .returning();
    return message;
  }

  async getMessagesByPatient(patientId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.patientId, patientId))
      .orderBy(desc(messages.createdAt));
  }

  async getAllMessages(): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .orderBy(desc(messages.createdAt));
  }

  async deleteMessage(id: number): Promise<void> {
    // Get the message first to check if it was urgent
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    
    await db.delete(messages).where(eq(messages.id, id));
    
    // If it was an urgent message, also delete related alerts
    if (message && message.isUrgent) {
      await db.delete(alerts).where(
        and(
          eq(alerts.patientId, message.patientId),
          eq(alerts.type, "message"),
          eq(alerts.resolved, false)
        )
      );
    }
  }

  // Alert operations
  async createAlert(alertData: InsertAlert): Promise<Alert> {
    const [alert] = await db
      .insert(alerts)
      .values(alertData)
      .returning();
    return alert;
  }

  async getActiveAlerts(): Promise<Alert[]> {
    return await db
      .select()
      .from(alerts)
      .where(eq(alerts.resolved, false))
      .orderBy(desc(alerts.createdAt));
  }

  async getAlertsByPatient(patientId: number): Promise<Alert[]> {
    return await db
      .select()
      .from(alerts)
      .where(eq(alerts.patientId, patientId))
      .orderBy(desc(alerts.createdAt));
  }

  async resolveAlert(id: number): Promise<Alert> {
    const [alert] = await db
      .update(alerts)
      .set({ resolved: true })
      .where(eq(alerts.id, id))
      .returning();
    return alert;
  }

  // Advice items operations
  async getAdviceItems(): Promise<AdviceItem[]> {
    return await db.select().from(adviceItems).orderBy(desc(adviceItems.createdAt));
  }

  async createAdviceItem(adviceData: InsertAdviceItem): Promise<AdviceItem> {
    const [advice] = await db
      .insert(adviceItems)
      .values(adviceData)
      .returning();
    return advice;
  }

  async deleteAdviceItem(id: number): Promise<void> {
    await db.delete(adviceItems).where(eq(adviceItems.id, id));
  }

  // Missed medication operations
  async createMissedMedication(missedMedData: InsertMissedMedication): Promise<MissedMedication> {
    const [missedMed] = await db
      .insert(missedMedication)
      .values(missedMedData)
      .returning();
    return missedMed;
  }

  async getMissedMedicationByPatient(patientId: number): Promise<MissedMedication[]> {
    return await db
      .select()
      .from(missedMedication)
      .where(eq(missedMedication.patientId, patientId))
      .orderBy(desc(missedMedication.createdAt));
  }

  async getMissedMedicationInLastMonth(patientId: number): Promise<MissedMedication[]> {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    return await db
      .select()
      .from(missedMedication)
      .where(and(
        eq(missedMedication.patientId, patientId),
        gte(missedMedication.createdAt, oneMonthAgo)
      ))
      .orderBy(desc(missedMedication.createdAt));
  }

  async removeMissedMedication(patientId: number, dateToRemove: string): Promise<void> {
    // Find all missed medication entries for this patient
    const entries = await db
      .select()
      .from(missedMedication)
      .where(eq(missedMedication.patientId, patientId));

    // Process each entry to remove the specific date
    for (const entry of entries) {
      if (entry.missedDates && Array.isArray(entry.missedDates)) {
        const updatedDates = entry.missedDates.filter(date => date !== dateToRemove);
        
        if (updatedDates.length === 0) {
          // If no dates left, delete the entire entry
          await db.delete(missedMedication).where(eq(missedMedication.id, entry.id));
        } else {
          // Update the entry with the filtered dates
          await db
            .update(missedMedication)
            .set({ missedDates: updatedDates })
            .where(eq(missedMedication.id, entry.id));
        }
      }
    }
  }

  // Dosage history operations
  async createDosageHistory(data: InsertDosageHistory): Promise<DosageHistory> {
    const [result] = await db
      .insert(dosageHistory)
      .values(data)
      .returning();
    return result;
  }

  async getDosageHistoryByPatientId(patientId: number): Promise<DosageHistory[]> {
    return await db
      .select()
      .from(dosageHistory)
      .where(eq(dosageHistory.patientId, patientId))
      .orderBy(desc(dosageHistory.startDate));
  }

  async updateDosageHistory(id: number, data: Partial<InsertDosageHistory>): Promise<DosageHistory> {
    const [result] = await db
      .update(dosageHistory)
      .set(data)
      .where(eq(dosageHistory.id, id))
      .returning();
    return result;
  }

  // Treatment analytics
  async calculateWeeksOnTreatment(patientId: number): Promise<number> {
    const patient = await this.getPatientById(patientId);
    if (!patient?.treatmentStartDate) return 0;

    const startDate = new Date(patient.treatmentStartDate);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7)); // Convert to weeks
  }

  async calculateWeeksOnCurrentDosage(patientId: number): Promise<number> {
    const patient = await this.getPatientById(patientId);
    if (!patient) return 0;

    // Get the maximum dosage for this medication/treatment setting
    const maxDosageMap = {
      metastatic: {
        abemaciclib: '150mg',
        ribociclib: '600mg',
        palbociclib: '125mg'
      },
      adjuvant: {
        abemaciclib: '150mg',
        ribociclib: '400mg',
        palbociclib: '' // Not used in adjuvant
      }
    };

    const maxDosage = maxDosageMap[patient.treatmentSetting]?.[patient.medication];
    
    // If patient is still on maximum dosage, weeks on current dosage = total treatment weeks
    if (patient.dosage === maxDosage) {
      return await this.calculateWeeksOnTreatment(patientId);
    }

    // If patient has reduced dosage, calculate from when the reduction happened
    // Check dosage history for when the current dosage started
    const currentDosageHistory = await db
      .select()
      .from(dosageHistory)
      .where(
        and(
          eq(dosageHistory.patientId, patientId),
          eq(dosageHistory.dosage, patient.dosage),
          isNull(dosageHistory.endDate) // Current dosage has no end date
        )
      )
      .limit(1);

    if (currentDosageHistory.length > 0) {
      const startDate = new Date(currentDosageHistory[0].startDate);
      const currentDate = new Date();
      const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    }

    // Fallback to current_dosage_start_date if history is missing
    if (patient.currentDosageStartDate) {
      const startDate = new Date(patient.currentDosageStartDate);
      const currentDate = new Date();
      const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    }

    return 0;
  }

  async getDosageStatsByMedication(medication: string, treatmentSetting: string): Promise<any> {
    const histories = await db
      .select()
      .from(dosageHistory)
      .where(
        and(
          eq(dosageHistory.medication, medication),
          eq(dosageHistory.treatmentSetting, treatmentSetting)
        )
      );

    const dosageStats = {};
    histories.forEach(history => {
      if (!dosageStats[history.dosage]) {
        dosageStats[history.dosage] = {
          totalWeeks: 0,
          patientCount: 0,
          patients: new Set()
        };
      }
      dosageStats[history.dosage].totalWeeks += history.weeksOnDosage || 0;
      dosageStats[history.dosage].patients.add(history.patientId);
    });

    // Calculate averages
    Object.keys(dosageStats).forEach(dosage => {
      const stat = dosageStats[dosage];
      stat.patientCount = stat.patients.size;
      stat.averageWeeks = stat.patientCount > 0 ? stat.totalWeeks / stat.patientCount : 0;
      delete stat.patients; // Remove Set for JSON serialization
    });

    return dosageStats;
  }

  async getValidDosagesForTreatment(medication: string, treatmentSetting: string): Promise<string[]> {
    const dosageRules = {
      metastatic: {
        abemaciclib: ['150mg', '100mg', '50mg'],
        ribociclib: ['600mg', '400mg', '200mg'],
        palbociclib: ['125mg', '100mg', '75mg']
      },
      adjuvant: {
        abemaciclib: ['150mg', '100mg', '50mg'],
        ribociclib: ['400mg', '200mg'], // No 600mg in adjuvant
        palbociclib: [] // Palbociclib not allowed in adjuvant
      }
    };

    return dosageRules[treatmentSetting]?.[medication] || [];
  }

  async getTreatmentAnalytics(medication?: string, treatmentSetting?: string): Promise<any> {
    let query = db.select().from(dosageHistory);
    
    const conditions = [];
    if (medication) conditions.push(eq(dosageHistory.medication, medication));
    if (treatmentSetting) conditions.push(eq(dosageHistory.treatmentSetting, treatmentSetting));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const histories = await query;

    const analytics = {
      totalPatients: new Set(histories.map(h => h.patientId)).size,
      medicationBreakdown: {},
      settingBreakdown: {
        metastatic: { patients: 0, averageWeeksOnTreatment: 0 },
        adjuvant: { patients: 0, averageWeeksOnTreatment: 0 }
      }
    };

    // Group by medication and treatment setting
    const medicationGroups = {};
    const settingGroups = { metastatic: [], adjuvant: [] };

    histories.forEach(history => {
      // Medication breakdown
      if (!medicationGroups[history.medication]) {
        medicationGroups[history.medication] = {
          [history.treatmentSetting]: []
        };
      }
      if (!medicationGroups[history.medication][history.treatmentSetting]) {
        medicationGroups[history.medication][history.treatmentSetting] = [];
      }
      medicationGroups[history.medication][history.treatmentSetting].push(history);

      // Setting groups
      settingGroups[history.treatmentSetting].push(history);
    });

    // Process medication breakdown
    Object.keys(medicationGroups).forEach(med => {
      analytics.medicationBreakdown[med] = {};
      
      Object.keys(medicationGroups[med]).forEach(setting => {
        const group = medicationGroups[med][setting];
        const dosageStats = {};
        
        group.forEach(h => {
          if (!dosageStats[h.dosage]) {
            dosageStats[h.dosage] = { weeks: [], patients: new Set() };
          }
          dosageStats[h.dosage].weeks.push(h.weeksOnDosage || 0);
          dosageStats[h.dosage].patients.add(h.patientId);
        });

        // Calculate averages for each dosage
        Object.keys(dosageStats).forEach(dosage => {
          const stat = dosageStats[dosage];
          stat.averageWeeks = stat.weeks.length > 0 
            ? stat.weeks.reduce((a, b) => a + b, 0) / stat.weeks.length 
            : 0;
          stat.patientCount = stat.patients.size;
          delete stat.weeks;
          delete stat.patients;
        });

        analytics.medicationBreakdown[med][setting] = dosageStats;
      });
    });

    // Process setting breakdown
    ['metastatic', 'adjuvant'].forEach(setting => {
      const group = settingGroups[setting];
      const uniquePatients = new Set(group.map(h => h.patientId));
      
      analytics.settingBreakdown[setting].patients = uniquePatients.size;
      
      if (group.length > 0) {
        const totalWeeks = group.reduce((sum, h) => sum + (h.weeksOnDosage || 0), 0);
        analytics.settingBreakdown[setting].averageWeeksOnTreatment = totalWeeks / group.length;
      }
    });

    return analytics;
  }

  async getAdvancedPatientAnalytics(): Promise<any[]> {
    const patients = await this.getAllPatients();
    const results = [];

    for (const patient of patients) {
      // Calculate adherence percentage
      const missedMedications = await this.getMissedMedicationByPatient(patient.id);
      const totalMissedDays = missedMedications.reduce((sum, missed) => 
        sum + (missed.missedDates as string[]).length, 0
      );
      
      const weeksOnTreatment = await this.calculateWeeksOnTreatment(patient.id);
      const totalTreatmentDays = weeksOnTreatment * 7;
      const adherencePercentage = totalTreatmentDays > 0 ? 
        ((totalTreatmentDays - totalMissedDays) / totalTreatmentDays) * 100 : 100;

      // Get symptoms data
      const patientSymptoms = await db
        .select()
        .from(symptoms)
        .where(eq(symptoms.patientId, patient.id));

      const totalSymptoms = patientSymptoms.length;
      const highSeveritySymptoms = patientSymptoms.filter(s => 
        s.intensity && s.intensity >= 7
      ).length;

      const lastSymptomReport = patientSymptoms.length > 0 ? 
        patientSymptoms.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())[0].date : 'Mai';

      // Get dosage reductions
      const dosageHistory = await this.getDosageHistoryByPatientId(patient.id);
      const dosageReductions = dosageHistory.length - 1; // First entry is initial dosage

      const weeksOnCurrentDosage = await this.calculateWeeksOnCurrentDosage(patient.id);

      results.push({
        id: patient.id,
        name: `${patient.firstName} ${patient.lastName}`,
        age: patient.age,
        medication: patient.medication,
        dosage: patient.dosage,
        treatmentSetting: patient.treatmentSetting,
        treatmentStartDate: patient.treatmentStartDate,
        weeksOnTreatment,
        weeksOnCurrentDosage,
        adherencePercentage,
        totalSymptoms,
        highSeveritySymptoms,
        lastSymptomReport,
        dosageReductions,
        missedDays: totalMissedDays,
        totalTreatmentDays
      });
    }

    return results;
  }

  async getSymptomAnalyticsByDosage(symptomType: string, treatmentSetting?: string): Promise<any> {
    // Get all patients with their symptoms, with optional treatment setting filter
    let query = db
      .select()
      .from(patients)
      .leftJoin(symptoms, eq(symptoms.patientId, patients.id));

    if (treatmentSetting && treatmentSetting !== "all") {
      query = query.where(eq(patients.treatmentSetting, treatmentSetting));
    }

    const patientsData = await query;

    const result = {
      abemaciclib: { "150mg": 0, "100mg": 0, "50mg": 0 },
      ribociclib: { "600mg": 0, "400mg": 0, "200mg": 0 },
      palbociclib: { "125mg": 0, "100mg": 0, "75mg": 0 }
    };

    // Group by medication and dosage
    const medicationDosageGroups: any = {};

    for (const row of patientsData) {
      const patient = row.patients;
      const symptom = row.symptoms;
      
      if (!patient || !patient.medication || !patient.dosage) continue;

      const key = `${patient.medication}-${patient.dosage}`;
      if (!medicationDosageGroups[key]) {
        medicationDosageGroups[key] = {
          patientIds: new Set(),
          symptomCounts: 0,
          severeSymptomCounts: 0
        };
      }

      medicationDosageGroups[key].patientIds.add(patient.id);

      // Count symptoms for this patient
      if (symptom && symptom.symptomType === symptomType) {
        medicationDosageGroups[key].symptomCounts++;
        // Consider severe if intensity >= 5 (as requested)
        if (symptom.intensity && symptom.intensity >= 5) {
          medicationDosageGroups[key].severeSymptomCounts++;
        }
      }
    }

    // Calculate percentages
    Object.keys(medicationDosageGroups).forEach(key => {
      const [medication, dosage] = key.split('-');
      const group = medicationDosageGroups[key];
      const totalPatients = group.patientIds.size;
      
      if (totalPatients > 0) {
        // Calculate percentage of patients with severe symptoms
        const severePercentage = (group.severeSymptomCounts / totalPatients) * 100;
        
        if (result[medication as keyof typeof result] && dosage in result[medication as keyof typeof result]) {
          result[medication as keyof typeof result][dosage as keyof typeof result[keyof typeof result]] = Math.round(severePercentage);
        }
      }
    });

    return result;
  }

  async getDosageReductionAnalytics(medication?: string, treatmentSetting?: string): Promise<any> {
    // Get all dosage history records
    let query = db
      .select({
        patientId: dosageHistory.patientId,
        medication: dosageHistory.medication,
        treatmentSetting: dosageHistory.treatmentSetting,
        startDate: dosageHistory.startDate,
        dosage: dosageHistory.dosage,
        weeksOnDosage: dosageHistory.weeksOnDosage
      })
      .from(dosageHistory)
      .orderBy(dosageHistory.patientId, dosageHistory.startDate);

    const conditions = [];
    if (medication && medication !== "all") conditions.push(eq(dosageHistory.medication, medication));
    if (treatmentSetting && treatmentSetting !== "all") conditions.push(eq(dosageHistory.treatmentSetting, treatmentSetting));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const histories = await query;
    
    // Group by patient to track their dosage progression
    const patientProgressions: any = {};
    
    histories.forEach(record => {
      if (!patientProgressions[record.patientId]) {
        patientProgressions[record.patientId] = {
          medication: record.medication,
          treatmentSetting: record.treatmentSetting,
          dosageHistory: []
        };
      }
      patientProgressions[record.patientId].dosageHistory.push(record);
    });

    // Calculate reduction timings for each medication
    const result = {
      abemaciclib: { patientCount: 0, firstReduction: [], secondReduction: [] },
      ribociclib: { patientCount: 0, firstReduction: [], secondReduction: [] },
      palbociclib: { patientCount: 0, firstReduction: [], secondReduction: [] }
    };

    Object.values(patientProgressions).forEach((patient: any) => {
      const med = patient.medication;
      if (!result[med]) return;

      result[med].patientCount++;
      
      // Sort by start date to get chronological order
      const sortedHistory = patient.dosageHistory.sort((a: any, b: any) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );

      if (sortedHistory.length >= 2) {
        // First reduction: weeks from start to first dosage change
        const weeksToFirstReduction = sortedHistory[0].weeksOnDosage || 0;
        result[med].firstReduction.push(weeksToFirstReduction);
      }

      if (sortedHistory.length >= 3) {
        // Second reduction: cumulative weeks to second dosage change
        const weeksToSecondReduction = (sortedHistory[0].weeksOnDosage || 0) + (sortedHistory[1].weeksOnDosage || 0);
        result[med].secondReduction.push(weeksToSecondReduction);
      }
    });

    // Calculate averages
    ["abemaciclib", "ribociclib", "palbociclib"].forEach(med => {
      const medData = result[med];
      medData.avgFirstReduction = medData.firstReduction.length > 0 
        ? medData.firstReduction.reduce((sum: number, weeks: number) => sum + weeks, 0) / medData.firstReduction.length
        : null;
      medData.avgSecondReduction = medData.secondReduction.length > 0
        ? medData.secondReduction.reduce((sum: number, weeks: number) => sum + weeks, 0) / medData.secondReduction.length
        : null;
    });

    return result;
  }

  async getDosageWeeksAnalytics(medication?: string, treatmentSetting?: string): Promise<any[]> {
    let query = db.select().from(dosageHistory);
    
    const conditions = [];
    if (medication && medication !== "all") conditions.push(eq(dosageHistory.medication, medication));
    if (treatmentSetting && treatmentSetting !== "all") conditions.push(eq(dosageHistory.treatmentSetting, treatmentSetting));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const histories = await query;
    
    // Group by medication, dosage, and treatment setting
    const grouped = histories.reduce((acc, history) => {
      const key = `${history.medication}-${history.dosage}-${history.treatmentSetting}`;
      if (!acc[key]) {
        acc[key] = {
          medication: history.medication,
          dosage: history.dosage,
          treatmentSetting: history.treatmentSetting,
          weeks: [],
          patientIds: new Set()
        };
      }
      if (history.weeksOnDosage) {
        acc[key].weeks.push(history.weeksOnDosage);
        acc[key].patientIds.add(history.patientId);
      }
      return acc;
    }, {});

    return Object.values(grouped).map((group: any) => ({
      medication: group.medication,
      dosage: group.dosage,
      treatmentSetting: group.treatmentSetting,
      averageWeeks: group.weeks.length > 0 ? 
        group.weeks.reduce((sum, w) => sum + w, 0) / group.weeks.length : 0,
      patientCount: group.patientIds.size
    }));
  }

  async getToxicityAnalytics(medication?: string, treatmentSetting?: string): Promise<any[]> {
    // Get all patients matching criteria
    let patientsQuery = db.select().from(patients);
    const patientConditions = [];
    
    if (medication && medication !== "all") patientConditions.push(eq(patients.medication, medication));
    if (treatmentSetting && treatmentSetting !== "all") patientConditions.push(eq(patients.treatmentSetting, treatmentSetting));
    
    if (patientConditions.length > 0) {
      patientsQuery = patientsQuery.where(and(...patientConditions));
    }

    const matchingPatients = await patientsQuery;
    const patientIds = matchingPatients.map(p => p.id);

    if (patientIds.length === 0) return [];

    // Get symptoms for these patients
    const symptomsData = await db
      .select()
      .from(symptoms)
      .where(or(...patientIds.map(id => eq(symptoms.patientId, id))));

    // Group by symptom type
    const grouped = symptomsData.reduce((acc, symptom) => {
      if (!symptom.present) return acc;
      
      if (!acc[symptom.symptomType]) {
        acc[symptom.symptomType] = {
          count: 0,
          totalSeverity: 0,
          severityCount: 0
        };
      }
      
      acc[symptom.symptomType].count++;
      
      if (symptom.intensity) {
        acc[symptom.symptomType].totalSeverity += symptom.intensity;
        acc[symptom.symptomType].severityCount++;
      }
      
      return acc;
    }, {});

    return Object.entries(grouped).map(([symptom, data]: [string, any]) => ({
      symptom,
      count: data.count,
      severity: data.severityCount > 0 ? data.totalSeverity / data.severityCount : 0,
      medication: medication || "all",
      treatmentSetting: treatmentSetting || "all"
    }));
  }

  async getMedicationComparisonData(): Promise<any[]> {
    const medications = ['abemaciclib', 'ribociclib', 'palbociclib'];
    const results = [];

    for (const medication of medications) {
      const medicationPatients = await db
        .select()
        .from(patients)
        .where(eq(patients.medication, medication));

      if (medicationPatients.length === 0) continue;

      const patientIds = medicationPatients.map(p => p.id);

      // Get toxicities
      const symptomsData = await db
        .select()
        .from(symptoms)
        .where(and(
          or(...patientIds.map(id => eq(symptoms.patientId, id))),
          eq(symptoms.present, true)
        ));

      const totalToxicities = symptomsData.length;
      const averageSeverity = symptomsData.length > 0 ? 
        symptomsData.reduce((sum, s) => sum + (s.intensity || 0), 0) / symptomsData.length : 0;

      // Get dosage reductions
      const dosageHistories = await db
        .select()
        .from(dosageHistory)
        .where(eq(dosageHistory.medication, medication));

      const dosageReductions = dosageHistories.filter(h => h.endDate !== null).length;
      const averageWeeksBeforeReduction = dosageReductions > 0 ?
        dosageHistories.filter(h => h.endDate !== null)
          .reduce((sum, h) => sum + (h.weeksOnDosage || 0), 0) / dosageReductions : 0;

      results.push({
        medication,
        totalToxicities,
        averageSeverity,
        dosageReductions,
        averageWeeksBeforeReduction
      });
    }

    return results;
  }

  // Calendar events operations
  async createCalendarEvent(eventData: InsertCalendarEvent): Promise<CalendarEvent> {
    const [event] = await db
      .insert(calendarEvents)
      .values(eventData)
      .returning();
    return event;
  }

  async getCalendarEventsByPatient(patientId: number): Promise<CalendarEvent[]> {
    return await db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.patientId, patientId))
      .orderBy(calendarEvents.date);
  }

  async getCalendarEventsByPatientAndDateRange(patientId: number, startDate: string, endDate: string): Promise<CalendarEvent[]> {
    return await db
      .select()
      .from(calendarEvents)
      .where(
        and(
          eq(calendarEvents.patientId, patientId),
          gte(calendarEvents.date, startDate),
          lte(calendarEvents.date, endDate)
        )
      )
      .orderBy(calendarEvents.date);
  }

  async getCalendarEventByPatientAndDate(patientId: number, date: string): Promise<CalendarEvent | null> {
    const events = await db
      .select()
      .from(calendarEvents)
      .where(
        and(
          eq(calendarEvents.patientId, patientId),
          eq(calendarEvents.date, date)
        )
      )
      .limit(1);
    
    return events[0] || null;
  }

  async updateCalendarEvent(id: number, updates: Partial<InsertCalendarEvent>): Promise<CalendarEvent> {
    const [event] = await db
      .update(calendarEvents)
      .set(updates)
      .where(eq(calendarEvents.id, id))
      .returning();
    return event;
  }

  async deleteCalendarEvent(id: number): Promise<void> {
    await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
  }
}

export const storage = new DatabaseStorage();
