import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, date, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'patient' or 'doctor'
  createdAt: timestamp("created_at").defaultNow(),
});

// Patients table with detailed information
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  weight: integer("weight").notNull(),
  height: integer("height").notNull(),
  phone: text("phone").notNull(),
  medication: text("medication").notNull(), // 'abemaciclib', 'ribociclib', 'palbociclib'
  dosage: text("dosage").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Medication schedules
export const medicationSchedules = pgTable("medication_schedules", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  date: date("date").notNull(),
  shouldTake: boolean("should_take").notNull(),
  taken: boolean("taken").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Daily diary entries
export const diaryEntries = pgTable("diary_entries", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  date: date("date").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Symptom tracking
export const symptoms = pgTable("symptoms", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  date: date("date").notNull(),
  symptomType: text("symptom_type").notNull(),
  present: boolean("present").notNull(),
  intensity: integer("intensity"), // 0-10 scale
  diarrheaCount: integer("diarrhea_count"), // for diarrhea specifically
  feverTemperature: real("fever_temperature"), // temperature in Celsius
  feverChills: boolean("fever_chills"), // chills with fever
  additionalNotes: text("additional_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages between patients and doctors
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isUrgent: boolean("is_urgent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Alerts for doctors
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  type: text("type").notNull(), // 'symptom', 'message', 'manual'
  message: text("message").notNull(),
  severity: text("severity").notNull(), // 'low', 'medium', 'high'
  resolved: boolean("resolved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  patient: one(patients, {
    fields: [users.id],
    references: [patients.userId],
  }),
  sentMessages: many(messages),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  user: one(users, {
    fields: [patients.userId],
    references: [users.id],
  }),
  medicationSchedules: many(medicationSchedules),
  diaryEntries: many(diaryEntries),
  symptoms: many(symptoms),
  messages: many(messages),
  alerts: many(alerts),
}));

export const medicationSchedulesRelations = relations(medicationSchedules, ({ one }) => ({
  patient: one(patients, {
    fields: [medicationSchedules.patientId],
    references: [patients.id],
  }),
}));

export const diaryEntriesRelations = relations(diaryEntries, ({ one }) => ({
  patient: one(patients, {
    fields: [diaryEntries.patientId],
    references: [patients.id],
  }),
}));

export const symptomsRelations = relations(symptoms, ({ one }) => ({
  patient: one(patients, {
    fields: [symptoms.patientId],
    references: [patients.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  patient: one(patients, {
    fields: [messages.patientId],
    references: [patients.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  patient: one(patients, {
    fields: [alerts.patientId],
    references: [patients.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertPatientSchema = createInsertSchema(patients).omit({ id: true, createdAt: true });
export const insertMedicationScheduleSchema = createInsertSchema(medicationSchedules).omit({ id: true, createdAt: true });
export const insertDiaryEntrySchema = createInsertSchema(diaryEntries).omit({ id: true, createdAt: true });
export const insertSymptomSchema = createInsertSchema(symptoms).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type MedicationSchedule = typeof medicationSchedules.$inferSelect;
export type InsertMedicationSchedule = z.infer<typeof insertMedicationScheduleSchema>;
export type DiaryEntry = typeof diaryEntries.$inferSelect;
export type InsertDiaryEntry = z.infer<typeof insertDiaryEntrySchema>;
export type Symptom = typeof symptoms.$inferSelect;
export type InsertSymptom = z.infer<typeof insertSymptomSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
