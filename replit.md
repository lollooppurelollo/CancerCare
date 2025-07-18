# CDK 4/6 Inhibitors Medical Tracking Application

## Overview

This is a full-stack web application designed for tracking and managing patients taking CDK 4/6 inhibitor medications (abemaciclib, ribociclib, palbociclib). The application features a patient-facing mobile interface for symptom tracking and medication logging, and a doctor dashboard for monitoring patient data and managing alerts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom sage green theme
- **UI Components**: Radix UI primitives with shadcn/ui components
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and building

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Authentication**: Session-based authentication with bcrypt for password hashing
- **API Pattern**: RESTful API with structured error handling

### Mobile-First Design
- **Responsive**: Optimized for mobile devices with max-width container
- **Navigation**: Bottom navigation for patient interface
- **Touch-Friendly**: Large buttons and touch targets
- **Italian Language**: User interface primarily in Italian

## Key Components

### Authentication System
- **User Roles**: Patient and Doctor roles with separate interfaces
- **Registration**: Patient self-registration with medical information
- **Login**: Separate login flows for patients and doctors
- **Session Management**: Server-side session storage

### Patient Interface
- **Medication Calendar**: Visual representation of medication schedules based on drug type
- **Symptom Tracker**: Daily symptom logging with intensity scales and boolean flags
- **Diary Entries**: Free-text daily notes
- **Video Call Interface**: Communication with healthcare providers
- **History View**: Timeline of past entries and symptoms

### Doctor Dashboard
- **Patient Management**: View all registered patients
- **Alert System**: Urgent notifications and patient status monitoring
- **Search Functionality**: Find patients by name
- **Message Center**: Review patient communications and diary entries
- **Analytics**: Patient data visualization and reporting

### Database Schema
- **Users**: Authentication and role management
- **Patients**: Detailed patient information and medication details
- **Medication Schedules**: Drug-specific dosing calendars
- **Diary Entries**: Daily patient notes
- **Symptoms**: Tracked symptoms with various data types
- **Messages**: Patient-doctor communication
- **Alerts**: System-generated notifications

## Recent Changes (January 2025)

1. **Enhanced Doctor Dashboard**:
   - Added birth date display next to patient names in urgent alerts (formato "nato il DD/MM/YYYY")
   - Updated database schema to include birth_date field with sample data
   - Fixed birth date formatting to appear on same line as patient name

2. **Doctor-Patient Communication System**:
   - Created comprehensive chat system with dedicated doctor-patient chat page
   - Added chat buttons to doctor dashboard and patient detail pages
   - Implemented real-time messaging functionality for direct communication
   - Enhanced doctor permissions for patient communication and calendar modification

3. **Patient Interface View for Doctors**:
   - Created doctor-patient-view page showing complete patient interface
   - Includes all patient screens: Home, Symptoms, History, Video, Profile
   - Allows doctors to see exactly what patients see with navigation tabs
   - Provides comprehensive patient data visualization

4. **Enhanced Alert System**:
   - Removed phone icon from alert buttons as requested
   - Added MessageCircle icon for chat functionality
   - Implemented Google Meet integration for video calls
   - Updated button functionality: Eye = patient view, Chat = messaging, Video = Google Meet

5. **Video Call Integration**:
   - Added Google Meet integration for doctor-patient video consultations
   - Automatic meeting title generation with patient name
   - Opens in new tab for seamless video communication

6. **Messaging System with File Attachments (July 2025)**:
   - Fixed critical patientId null bug in messaging system
   - Added comprehensive file upload support (PDF, DOC, images, etc.)
   - Implemented multer for server-side file handling
   - Added file attachment visualization in chat interface
   - Enhanced messaging UI with file selection and preview

7. **Dashboard UI Improvements (July 2025)**:
   - Improved patient card layout with better "Chat con Lorenzo Casadei" formatting
   - Enhanced button styling with consistent colors and spacing
   - Added functional video call and profile buttons
   - Reorganized button priority: Chat first, then Profile, then Video
   - Improved visual hierarchy and user experience

8. **Navigation Icons and Button Standardization (July 2025)**:
   - Standardized navigation icon sizes to w-4 h-4 for proper proportions
   - Fixed bottom navigation in patient interface and doctor-patient-view
   - Unified button order across all interfaces: 1. Profilo (sage), 2. Chat (blue), 3. Video (purple)
   - Enhanced color scheme with three distinct, harmonized colors for better UX
   - Applied consistent styling to urgent alerts and patient list actions

9. **Micro-Interactions and Enhanced UX (July 2025)**:
   - Added smooth hover and selection state transitions (200ms duration)
   - Implemented scale effects on buttons (hover: 1.05, active: 0.95)
   - Enhanced icon animations with scale and transform effects
   - Added subtle shadow effects on hover for depth perception
   - Improved patient card hover states with border color changes
   - Enhanced statistics cards with interactive hover states
   - Added micro-animations to navigation tabs with selection states
   - Implemented smooth transitions for bottom navigation with background colors

10. **Medication Dosage Correction (July 2025)**:
    - Updated correct dosages for all CDK 4/6 inhibitors across application
    - Abemaciclib: 150mg, 100mg, 50mg (instead of previous incorrect values)
    - Ribociclib: 600mg, 400mg, 200mg (instead of previous cp-based values)
    - Palbociclib: 125mg, 100mg, 75mg (verified and standardized)
    - Updated database records with correct dosage values
    - Standardized medication dropdowns in all forms (registration, profile, doctor interface)
    - Ensured consistency between database and UI display throughout application

11. **Settings and Doctor Filtering System (July 2025)**:
    - Added settings page accessible via gear icon in doctor dashboard
    - Implemented patient view filtering with two modes: "All patients" and "Specific doctor"
    - Added doctor selection dropdown with all registered doctors
    - Created localStorage-based settings persistence
    - Added assignedDoctorId field to patients table for doctor-patient relationships
    - Enhanced users table with firstName and lastName fields for doctors
    - Integrated filtering logic into doctor dashboard patient display
    - Added /api/doctors endpoint for retrieving doctor information
    - Settings automatically refresh dashboard when saved

## Data Flow

1. **Patient Registration**: New patients create accounts with medical information
2. **Daily Tracking**: Patients log symptoms and medication adherence
3. **Data Aggregation**: System processes patient data for alerts and analytics
4. **Doctor Review**: Healthcare providers monitor patient status and respond to alerts
5. **Communication**: Bidirectional messaging between patients and doctors
6. **Video Consultations**: Google Meet integration for face-to-face consultations

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle Kit**: Database migrations and schema management
- **Connection Pooling**: Efficient database connection management

### UI Libraries
- **Radix UI**: Headless UI components for accessibility
- **Lucide React**: Icon library
- **Date-fns**: Date manipulation and formatting
- **Tailwind CSS**: Utility-first CSS framework

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and developer experience
- **ESBuild**: Fast JavaScript bundling
- **Replit Integration**: Development environment support

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Assets**: Static assets served from build directory

### Environment Configuration
- **Development**: `npm run dev` - starts both frontend and backend
- **Production**: `npm run build` then `npm start`
- **Database**: Requires `DATABASE_URL` environment variable

### Key Features
- **Mobile Optimization**: Responsive design with mobile-first approach
- **Real-time Updates**: TanStack Query for efficient data synchronization
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Italian Localization**: User interface adapted for Italian healthcare context
- **Medication-Specific Logic**: Different dosing schedules for each CDK 4/6 inhibitor

The application is designed to be deployed on platforms like Replit with minimal configuration, requiring only a PostgreSQL database connection string.