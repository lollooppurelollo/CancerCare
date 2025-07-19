import { 
  users, patients, medicationSchedules, diaryEntries, symptoms, messages, alerts, adviceItems, missedMedication,
  type User, type InsertUser, type Patient, type InsertPatient,
  type MedicationSchedule, type InsertMedicationSchedule,
  type DiaryEntry, type InsertDiaryEntry, type Symptom, type InsertSymptom,
  type Message, type InsertMessage, type Alert, type InsertAlert,
  type AdviceItem, type InsertAdviceItem, type MissedMedication, type InsertMissedMedication
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, or } from "drizzle-orm";
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
}

export const storage = new DatabaseStorage();
