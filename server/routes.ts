import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertPatientSchema, insertDiaryEntrySchema, 
  insertSymptomSchema, insertMessageSchema, insertAlertSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser(userData);
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

  // Message routes
  app.post("/api/messages", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const messageData = insertMessageSchema.parse({
        ...req.body,
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

  const httpServer = createServer(app);
  return httpServer;
}
