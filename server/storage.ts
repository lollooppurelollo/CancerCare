import { 
  users, patients, medicationSchedules, diaryEntries, symptoms, messages, alerts, adviceItems, missedMedication, dosageHistory,
  type User, type InsertUser, type Patient, type InsertPatient,
  type MedicationSchedule, type InsertMedicationSchedule,
  type DiaryEntry, type InsertDiaryEntry, type Symptom, type InsertSymptom,
  type Message, type InsertMessage, type Alert, type InsertAlert,
  type AdviceItem, type InsertAdviceItem, type MissedMedication, type InsertMissedMedication,
  type DosageHistory, type InsertDosageHistory
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, or, sql } from "drizzle-orm";
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
    if (!patient?.currentDosageStartDate) return 0;

    const startDate = new Date(patient.currentDosageStartDate);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7)); // Convert to weeks
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
}

export const storage = new DatabaseStorage();
