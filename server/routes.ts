import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertPatientSchema, insertDiaryEntrySchema, 
  insertSymptomSchema, insertMessageSchema, insertAlertSchema 
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup multer for file uploads
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage_config = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({ 
    storage: storage_config,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.txt'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedTypes.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type'));
      }
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser(userData);
      
      // Auto-login after registration
      (req as any).session.userId = user.id;
      (req as any).session.userRole = user.role;
      
      res.json({ id: user.id, username: user.username, role: user.role });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await storage.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Store user in session
      (req as any).session.userId = user.id;
      (req as any).session.userRole = user.role;

      res.json({ id: user.id, username: user.username, role: user.role });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    (req as any).session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      res.json({ id: user.id, username: user.username, role: user.role });
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(500).json({ message: "Authentication check failed" });
    }
  });

  // Patient routes
  app.post("/api/patients", async (req, res) => {
    try {
      const patientData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(patientData);
      res.json(patient);
    } catch (error) {
      console.error("Create patient error:", error);
      res.status(500).json({ message: "Failed to create patient" });
    }
  });

  app.get("/api/patients/me", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const patient = await storage.getPatientByUserId(userId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      res.json(patient);
    } catch (error) {
      console.error("Get patient error:", error);
      res.status(500).json({ message: "Failed to get patient" });
    }
  });

  app.get("/api/patients", async (req, res) => {
    try {
      const userRole = (req as any).session?.userRole;
      if (userRole !== "doctor") {
        return res.status(403).json({ message: "Access denied" });
      }

      const patients = await storage.getAllPatients();
      res.json(patients);
    } catch (error) {
      console.error("Get patients error:", error);
      res.status(500).json({ message: "Failed to get patients" });
    }
  });

  // Update patient assigned doctor
  app.patch("/api/patients/:id", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      const userRole = (req as any).session?.userRole;
      const patientId = parseInt(req.params.id);
      const { assignedDoctorId } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Check if user is patient updating their own data or doctor
      const patient = await storage.getPatientById(patientId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      if (userRole === "patient" && patient.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedPatient = await storage.updatePatient(patientId, req.body);
      res.json(updatedPatient);
    } catch (error) {
      console.error("Update patient error:", error);
      res.status(500).json({ message: "Failed to update patient" });
    }
  });

  app.get("/api/doctors", async (req, res) => {
    try {
      const userRole = (req as any).session?.userRole;
      if (userRole !== "doctor") {
        return res.status(403).json({ message: "Access denied" });
      }

      const doctors = await storage.getDoctors();
      res.json(doctors);
    } catch (error) {
      console.error("Get doctors error:", error);
      res.status(500).json({ message: "Failed to get doctors" });
    }
  });

  // Public endpoint for patient registration
  app.get("/api/doctors/public", async (req, res) => {
    try {
      const doctors = await storage.getDoctors();
      // Return only id, firstName, lastName for public use
      const publicDoctors = doctors.map(doctor => ({
        id: doctor.id,
        firstName: doctor.firstName,
        lastName: doctor.lastName
      }));
      res.json(publicDoctors);
    } catch (error) {
      console.error("Get public doctors error:", error);
      res.status(500).json({ message: "Failed to get doctors" });
    }
  });

  // Admin-only routes for doctor management
  app.post("/api/admin/doctors", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      const userRole = (req as any).session?.userRole;
      
      if (userRole !== "doctor" || userId !== 4) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { role, firstName, lastName, username, password } = req.body;
      
      // Combine role with firstName for the display name
      const fullFirstName = `${role} ${firstName}`;
      
      const doctorData = insertUserSchema.parse({
        username,
        password,
        role: "doctor",
        firstName: fullFirstName,
        lastName
      });
      
      const doctor = await storage.createUser(doctorData);
      res.json(doctor);
    } catch (error) {
      console.error("Create doctor error:", error);
      res.status(500).json({ message: "Failed to create doctor" });
    }
  });

  app.delete("/api/admin/doctors/:id", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      const userRole = (req as any).session?.userRole;
      
      if (userRole !== "doctor" || userId !== 4) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const doctorId = parseInt(req.params.id);
      if (doctorId === 4) {
        return res.status(400).json({ message: "Cannot delete admin user" });
      }

      await storage.deleteUser(doctorId);
      res.json({ message: "Doctor deleted successfully" });
    } catch (error) {
      console.error("Delete doctor error:", error);
      res.status(500).json({ message: "Failed to delete doctor" });
    }
  });

  app.get("/api/patients/:id", async (req, res) => {
    try {
      const userRole = (req as any).session?.userRole;
      if (userRole !== "doctor") {
        return res.status(403).json({ message: "Access denied" });
      }

      const patientId = parseInt(req.params.id);
      const patient = await storage.getPatientById(patientId);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      res.json(patient);
    } catch (error) {
      console.error("Get patient error:", error);
      res.status(500).json({ message: "Failed to get patient" });
    }
  });

  app.put("/api/patients/:id", async (req, res) => {
    try {
      const userRole = (req as any).session?.userRole;
      if (userRole !== "doctor") {
        return res.status(403).json({ message: "Access denied" });
      }

      const patientId = parseInt(req.params.id);
      const updates = req.body;
      
      const patient = await storage.updatePatient(patientId, updates);
      res.json(patient);
    } catch (error) {
      console.error("Update patient error:", error);
      res.status(500).json({ message: "Failed to update patient" });
    }
  });

  app.get("/api/patients/search", async (req, res) => {
    try {
      const userRole = (req as any).session?.userRole;
      if (userRole !== "doctor") {
        return res.status(403).json({ message: "Access denied" });
      }

      const { query } = req.query;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const patients = await storage.searchPatients(query as string);
      res.json(patients);
    } catch (error) {
      console.error("Search patients error:", error);
      res.status(500).json({ message: "Failed to search patients" });
    }
  });

  // Medication schedule routes
  app.get("/api/medication-schedules", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const patient = await storage.getPatientByUserId(userId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const { startDate, endDate } = req.query;
      const schedules = await storage.getMedicationScheduleByPatientAndDateRange(
        patient.id,
        startDate as string,
        endDate as string
      );

      res.json(schedules);
    } catch (error) {
      console.error("Get medication schedules error:", error);
      res.status(500).json({ message: "Failed to get medication schedules" });
    }
  });

  app.post("/api/medication-schedules/bulk", async (req, res) => {
    try {
      const userRole = (req as any).session?.userRole;
      if (userRole !== "doctor") {
        return res.status(403).json({ message: "Access denied" });
      }

      const { schedules } = req.body;
      await storage.bulkCreateMedicationSchedules(schedules);
      res.json({ message: "Schedules created successfully" });
    } catch (error) {
      console.error("Bulk create schedules error:", error);
      res.status(500).json({ message: "Failed to create schedules" });
    }
  });

  app.get("/api/medication-schedules/:patientId", async (req, res) => {
    try {
      const userRole = (req as any).session?.userRole;
      if (userRole !== "doctor") {
        return res.status(403).json({ message: "Access denied" });
      }

      const patientId = parseInt(req.params.patientId);
      const { startDate, endDate } = req.query;
      
      const schedules = await storage.getMedicationScheduleByPatientAndDateRange(
        patientId,
        startDate as string || "2024-01-01",
        endDate as string || "2024-12-31"
      );

      res.json(schedules);
    } catch (error) {
      console.error("Get patient medication schedules error:", error);
      res.status(500).json({ message: "Failed to get medication schedules" });
    }
  });

  app.post("/api/medication-schedules/:patientId/toggle", async (req, res) => {
    try {
      const userRole = (req as any).session?.userRole;
      if (userRole !== "doctor") {
        return res.status(403).json({ message: "Access denied" });
      }

      const patientId = parseInt(req.params.patientId);
      const { date, shouldTake } = req.body;
      
      // Check if schedule exists for this date
      const existingSchedule = await storage.getMedicationScheduleByPatientAndDate(patientId, date);
      
      if (existingSchedule) {
        const updatedSchedule = await storage.updateMedicationSchedule(existingSchedule.id, {
          shouldTake
        });
        res.json(updatedSchedule);
      } else {
        const newSchedule = await storage.createMedicationSchedule({
          patientId,
          date,
          shouldTake
        });
        res.json(newSchedule);
      }
    } catch (error) {
      console.error("Toggle medication schedule error:", error);
      res.status(500).json({ message: "Failed to toggle medication schedule" });
    }
  });

  // Diary routes
  app.post("/api/diary-entries", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const patient = await storage.getPatientByUserId(userId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const entryData = insertDiaryEntrySchema.parse({
        ...req.body,
        patientId: patient.id
      });

      // Check if entry already exists for this date
      const existingEntry = await storage.getDiaryEntryByPatientAndDate(
        patient.id,
        entryData.date
      );

      if (existingEntry) {
        const updatedEntry = await storage.updateDiaryEntry(existingEntry.id, {
          content: entryData.content
        });
        res.json(updatedEntry);
      } else {
        const entry = await storage.createDiaryEntry(entryData);
        res.json(entry);
      }
    } catch (error) {
      console.error("Create diary entry error:", error);
      res.status(500).json({ message: "Failed to create diary entry" });
    }
  });

  app.get("/api/diary-entries", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const patient = await storage.getPatientByUserId(userId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const entries = await storage.getDiaryEntriesByPatient(patient.id);
      res.json(entries);
    } catch (error) {
      console.error("Get diary entries error:", error);
      res.status(500).json({ message: "Failed to get diary entries" });
    }
  });

  app.get("/api/diary-entries/:patientId", async (req, res) => {
    try {
      const userRole = (req as any).session?.userRole;
      if (userRole !== "doctor") {
        return res.status(403).json({ message: "Access denied" });
      }

      const patientId = parseInt(req.params.patientId);
      const entries = await storage.getDiaryEntriesByPatient(patientId);
      res.json(entries);
    } catch (error) {
      console.error("Get patient diary entries error:", error);
      res.status(500).json({ message: "Failed to get diary entries" });
    }
  });

  // Symptom routes
  app.post("/api/symptoms", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const patient = await storage.getPatientByUserId(userId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const { symptoms: symptomsData } = req.body;
      const symptomsToCreate = symptomsData.map((symptom: any) => ({
        ...symptom,
        patientId: patient.id
      }));

      await storage.bulkCreateSymptoms(symptomsToCreate);

      // Check for alerts
      for (const symptom of symptomsData) {
        if (symptom.present) {
          let shouldAlert = false;
          let alertMessage = "";
          let severity = "low";

          if (symptom.intensity && symptom.intensity > 7) {
            shouldAlert = true;
            alertMessage = `Sintomo severo: ${symptom.symptomType} con intensità ${symptom.intensity}/10`;
            severity = "high";
          }

          if (symptom.symptomType === "diarrea" && symptom.diarrheaCount && symptom.diarrheaCount >= 3) {
            shouldAlert = true;
            alertMessage = `Diarrea frequente: ${symptom.diarrheaCount} scariche al giorno`;
            severity = "high";
          }

          if (shouldAlert) {
            await storage.createAlert({
              patientId: patient.id,
              type: "symptom",
              message: alertMessage,
              severity,
              resolved: false
            });
          }
        }
      }

      res.json({ message: "Symptoms recorded successfully" });
    } catch (error) {
      console.error("Create symptoms error:", error);
      res.status(500).json({ message: "Failed to create symptoms" });
    }
  });

  app.get("/api/symptoms", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const patient = await storage.getPatientByUserId(userId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const symptoms = await storage.getSymptomsByPatient(patient.id);
      res.json(symptoms);
    } catch (error) {
      console.error("Get symptoms error:", error);
      res.status(500).json({ message: "Failed to get symptoms" });
    }
  });

  app.get("/api/symptoms/:patientId", async (req, res) => {
    try {
      const userRole = (req as any).session?.userRole;
      if (userRole !== "doctor") {
        return res.status(403).json({ message: "Access denied" });
      }

      const patientId = parseInt(req.params.patientId);
      const symptoms = await storage.getSymptomsByPatient(patientId);
      res.json(symptoms);
    } catch (error) {
      console.error("Get patient symptoms error:", error);
      res.status(500).json({ message: "Failed to get symptoms" });
    }
  });

  app.get("/api/symptoms/:patientId", async (req, res) => {
    try {
      const userRole = (req as any).session?.userRole;
      if (userRole !== "doctor") {
        return res.status(403).json({ message: "Access denied" });
      }

      const patientId = parseInt(req.params.patientId);
      const symptoms = await storage.getSymptomsByPatient(patientId);
      res.json(symptoms);
    } catch (error) {
      console.error("Get patient symptoms error:", error);
      res.status(500).json({ message: "Failed to get symptoms" });
    }
  });

  // Message routes
  app.post("/api/messages", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Ensure patientId is parsed as number
      const patientId = req.body.patientId ? parseInt(req.body.patientId) : null;
      if (!patientId) {
        return res.status(400).json({ message: "PatientId is required" });
      }

      const messageData = insertMessageSchema.parse({
        ...req.body,
        patientId: patientId,
        senderId: userId
      });

      const message = await storage.createMessage(messageData);

      // Create alert for urgent messages
      if (messageData.isUrgent) {
        await storage.createAlert({
          patientId: messageData.patientId,
          type: "message",
          message: "Messaggio urgente ricevuto dal paziente",
          severity: "medium",
          resolved: false
        });
      }

      res.json(message);
    } catch (error) {
      console.error("Create message error:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // File upload endpoint for messages
  app.post("/api/messages/upload", upload.single('file'), async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const patientId = req.body.patientId ? parseInt(req.body.patientId) : null;
      if (!patientId) {
        return res.status(400).json({ message: "PatientId is required" });
      }

      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const messageData = insertMessageSchema.parse({
        patientId: patientId,
        senderId: userId,
        content: req.body.content || `File condiviso: ${file.originalname}`,
        isUrgent: req.body.isUrgent === 'true',
        fileUrl: `/uploads/${file.filename}`,
        fileName: file.originalname
      });

      const message = await storage.createMessage(messageData);
      
      // Create alert for urgent messages
      if (messageData.isUrgent) {
        await storage.createAlert({
          patientId: messageData.patientId,
          type: "message",
          message: "Messaggio urgente con file allegato",
          severity: "medium",
          resolved: false
        });
      }

      res.json(message);
    } catch (error) {
      console.error("Upload message error:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  app.get("/api/messages", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      const userRole = (req as any).session?.userRole;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      let messages;
      if (userRole === "doctor") {
        messages = await storage.getAllMessages();
      } else {
        const patient = await storage.getPatientByUserId(userId);
        if (!patient) {
          return res.status(404).json({ message: "Patient not found" });
        }
        messages = await storage.getMessagesByPatient(patient.id);
      }

      res.json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ message: "Failed to get messages" });
    }
  });

  app.get("/api/messages/:patientId", async (req, res) => {
    try {
      const userRole = (req as any).session?.userRole;
      if (userRole !== "doctor") {
        return res.status(403).json({ message: "Access denied" });
      }

      const patientId = parseInt(req.params.patientId);
      const messages = await storage.getMessagesByPatient(patientId);
      res.json(messages);
    } catch (error) {
      console.error("Get patient messages error:", error);
      res.status(500).json({ message: "Failed to get messages" });
    }
  });

  app.get("/api/alerts/:patientId", async (req, res) => {
    try {
      const userRole = (req as any).session?.userRole;
      if (userRole !== "doctor") {
        return res.status(403).json({ message: "Access denied" });
      }

      const patientId = parseInt(req.params.patientId);
      const alerts = await storage.getAlertsByPatient(patientId);
      res.json(alerts);
    } catch (error) {
      console.error("Get patient alerts error:", error);
      res.status(500).json({ message: "Failed to get alerts" });
    }
  });

  // Alert routes
  app.get("/api/alerts", async (req, res) => {
    try {
      const userRole = (req as any).session?.userRole;
      if (userRole !== "doctor") {
        return res.status(403).json({ message: "Access denied" });
      }

      const alerts = await storage.getActiveAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Get alerts error:", error);
      res.status(500).json({ message: "Failed to get alerts" });
    }
  });

  app.post("/api/alerts/:id/resolve", async (req, res) => {
    try {
      const userRole = (req as any).session?.userRole;
      if (userRole !== "doctor") {
        return res.status(403).json({ message: "Access denied" });
      }

      const alertId = parseInt(req.params.id);
      const alert = await storage.resolveAlert(alertId);
      res.json(alert);
    } catch (error) {
      console.error("Resolve alert error:", error);
      res.status(500).json({ message: "Failed to resolve alert" });
    }
  });

  // Advice routes
  app.get("/api/advice", async (req, res) => {
    try {
      const advice = await storage.getAdviceItems();
      res.json(advice);
    } catch (error) {
      console.error("Get advice error:", error);
      res.status(500).json({ message: "Failed to get advice items" });
    }
  });

  app.post("/api/advice", async (req, res) => {
    try {
      const userRole = (req as any).session?.userRole;
      if (userRole !== "doctor") {
        return res.status(403).json({ message: "Access denied: Only doctors can create advice items" });
      }

      const userId = (req as any).session?.userId;
      const adviceData = {
        ...req.body,
        uploadedBy: userId
      };

      const advice = await storage.createAdviceItem(adviceData);
      res.json(advice);
    } catch (error) {
      console.error("Create advice error:", error);
      res.status(500).json({ message: "Failed to create advice item" });
    }
  });

  app.delete("/api/advice/:id", async (req, res) => {
    try {
      const userRole = (req as any).session?.userRole;
      if (userRole !== "doctor") {
        return res.status(403).json({ message: "Access denied: Only doctors can delete advice items" });
      }

      const adviceId = parseInt(req.params.id);
      await storage.deleteAdviceItem(adviceId);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete advice error:", error);
      res.status(500).json({ message: "Failed to delete advice item" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
