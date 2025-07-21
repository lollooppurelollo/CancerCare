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
    - Abemaciclib: 150mg BID, 100mg BID, 50mg BID (BID = bis in die, twice daily)
    - Ribociclib: 600mg, 400mg, 200mg (once daily dosing)
    - Palbociclib: 125mg, 100mg, 75mg (once daily dosing)
    - Updated database records with correct dosage values including BID notation
    - Standardized medication dropdowns in all forms (registration, profile, doctor interface)
    - Updated analytics and storage functions to reflect BID dosing for abemaciclib
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

12. **Admin Doctor Management System (July 2025)**:
    - Created admin-only doctor management interface at /admin/doctors
    - Admin credentials: username "medico", password "123456" (user ID 4)
    - Added specific doctor list: Prof. Federico Piacentini, Prof.ssa Angela Toss, Dr.ssa Claudia O Marini, Dr.ssa Monica Barbolini, Dr. Fabio Canino, Dr.ssa Elena Barbieri, Dr.ssa Emma Zattarin, Dr. Luca Moscetti
    - Implemented admin-only API endpoints for creating and deleting doctors
    - Added proper password hashing for new doctor accounts
    - Created admin section in settings page for doctor management access
    - Only admin user can add new doctors to the system
    - Prevents deletion of admin account for security

13. **Enhanced Admin Interface in Settings (July 2025)**:
    - Added inline doctor creation form in settings page
    - Role selection dropdown: Dr., Dr.ssa, Prof., Prof.ssa
    - Automatic username generation from first and last names
    - Role + Name combination for proper display formatting
    - Streamlined doctor creation process directly from settings
    - Automatic doctor list refresh after new doctor creation
    - Maintains both quick creation and full management interfaces

14. **Separated Settings and Profile Functionality (July 2025)**:
    - Completely redesigned patient settings page to focus on notification preferences
    - Added notification settings for medication reminders (default 09:00)
    - Added notification settings for diary reminders (default 20:00)
    - Added notification settings for symptom tracking reminders (default 18:00)
    - Separated personal data editing to dedicated profile page
    - Medical information (medication, dosage, assigned doctor) now only editable by doctors
    - Enhanced doctor patient detail page with assigned doctor modification capability
    - Patients can only edit personal information: name, age, phone, address
    - Medical data displayed as read-only for patients with explanatory note
    - **Birth date moved from medical section to personal information section** in patient profile
    - Improved layout organization with birth date displayed after age field in personal info

15. **Advanced Treatment Analytics System (July 2025)**:
    - **Database enhancements**: Added treatment_start_date, current_dosage_start_date, treatment_setting columns to patients table
    - **Dosage history tracking**: New dosage_history table with comprehensive medication timeline data
    - **Analytics API endpoints**: 7 new routes for treatment analytics including weeks calculations, dosage statistics, and aggregate data
    - **Patient treatment analytics page**: Mobile-optimized interface showing treatment duration, current dosage weeks, milestones, and progress visualization
    - **Doctor analytics dashboard**: Comprehensive analytics with interactive charts, medication/setting filters, and detailed statistics
    - **Metastatic vs Adjuvant classification**: Treatment setting distinction with appropriate medication restrictions
    - **Treatment counters**: Real-time calculation of total treatment weeks and current dosage duration
    - **Progress milestones**: Visual tracking of treatment achievements and goals
    - **Interactive data visualization**: Charts and graphs for treatment patterns and patient distribution
    - **Dosage-specific statistics**: Detailed breakdown of medication usage by dosage and treatment setting
    - **Valid dosage validation**: Setting-specific medication availability (no palbociclib/ribociclib 600mg in adjuvant)
    - **Patient settings logout restoration**: Re-added logout button to patient settings page with proper styling

16. **Comprehensive Medication Adherence Tracking System (July 2025)**:
    - Added complete missed medication tracking database schema with `missed_medication` table
    - Implemented patient-facing interface for reporting missed medications with date selection
    - Added comprehensive missed medication dialog with last 30 days date selection
    - Medication calendar now displays missed medication dates in light red pastello color
    - Doctor dashboard shows missed medication alerts with detailed patient information
    - Added dedicated missed medication alerts section in doctor dashboard with orange color coding
    - Enhanced doctor patient detail page with missed medication history display
    - Implemented full API endpoints for missed medication CRUD operations
    - Added missed medication monitoring in doctor patient view with calendar integration
    - Patients can add notes explaining reasons for missing medications
    - Real-time synchronization between patient reporting and doctor monitoring
    - **Removed "Calendario Settimanale" text from patient dashboard** as requested
    - **Moved missed medication button below calendar** for better user experience
    - **Added click-to-correct functionality**: patients can click on red (missed) days with confirmation dialog to restore them as taken
    - Enhanced calendar with hover effects and visual feedback for clickable missed days
    - Confirmation dialog asks for user confirmation before removing missed medication marking
    - Removed modification instructions from calendar legend for cleaner interface
    - **Fixed symptom display issues**: Added missing "Dolori articolari" label in patient history view
    - **Enhanced doctor patient view**: Added proper symptom name mapping for all symptom types including joint pain
    - Improved symptom value display with proper formatting for different symptom types
    - **Fixed video call request button**: "Richiedi di essere ricontattata" now works without requiring text message
    - Button now sends automatic urgent message to doctor creating proper alerts in dashboard
    - Enhanced patient-doctor notification system for video call requests
    - **Updated medication calendar legend text**: Modified legend descriptions for better clarity
    - Green days: "Giorni di trattamento" (Treatment days)
    - Gray days: "Giorni di pausa dalla terapia" (Therapy pause days)
    - Red days: "Terapia non assunta" (Therapy not taken)
    - Historical tracking of all missed medications with timestamps and patient notes

16. **Enhanced Urgent Alert System with Custom Messages and Deletion (July 2025)**:
    - Added customizable urgent message dialog in both patient home and video pages
    - Patients can now add personal text to urgent alerts or use default messages
    - Implemented visual display of recent urgent messages with deletion capability
    - Added X button to delete urgent messages if sent by mistake
    - Enhanced backend with DELETE endpoint for messages with security validation
    - Automatic alert cleanup when urgent messages are deleted from database
    - Improved user experience with confirmation dialogs and Italian language support
    - Real-time message management with immediate UI updates after operations
    - Secure message deletion ensures users can only delete their own messages
    - Enhanced video page "Richiedi di essere ricontattata" with custom message input

17. **Enhanced Chat Notification System and Doctor Patient Interface Improvements (July 2025)**:
    - **Chat notifications for all messages**: Added comprehensive notification system for all patient messages, not just urgent ones
    - **Dismissible chat notifications**: Implemented X button to remove chat notifications once viewed/resolved
    - **Streamlined doctor-patient interface**: Removed video tab from doctor's view of patient profile
    - **Unified history and symptoms view**: Combined symptoms and history tabs into single "Storico Sintomi e Diario" section
    - **Symptoms filtering**: Modified symptoms display to show only reported symptoms (with values > 0 or present = true)
    - **Integrated diary visualization**: Combined symptom data with diary entries organized by date
    - **Selective missed medication alerts**: Changed notification system to only show patients with more than 5 missed medication days
    - **Mobile-optimized chat layout**: Improved responsive design for doctor chat interface with compact headers and flexible buttons
    - **Enhanced notification management**: Real-time updates and dismissal functionality for better workflow efficiency

18. **Consistent Chat Interface Design and Dashboard Improvements (July 2025)**:
    - **Unified chat interface design**: Applied consistent visual styling between doctor and patient chat interfaces
    - **Card-based conversation layout**: Implemented separated sections for "Conversazione" and "Invia Messaggio" with card components
    - **Three-counter dashboard**: Added third counter button for "Messaggi chat" alongside urgent and patient message counters
    - **Updated counter titles**: Changed to "Nuovi messaggi urgenti", "Messaggi pazienti", and "Nuovi messaggi in Chat"
    - **Removed charts analytics tab**: Eliminated charts section from doctor dashboard navigation menu
    - **Vertical button layout**: Modified chat interface to stack "Allega File" and "Invia" buttons side by side for better mobile experience
    - **Enhanced visual consistency**: Applied same color scheme and styling patterns across all messaging interfaces
    - **Improved file attachment display**: Consistent file preview and management across patient and doctor interfaces

19. **Real-Time Symptom Analytics with Interactive Selector (July 2025)**:
    - **Real patient data analytics**: Replaced mock percentages with authentic symptom data from database
    - **Interactive symptom selector**: Added dropdown to analyze different symptom types (diarrea, nausea, vomito, fatigue, dolori articolari, febbre, rush cutaneo, perdita appetito)
    - **Drug-specific analysis table**: Added comprehensive analysis table showing patient counts and average weeks to first/second dose reduction for all CDK 4/6 inhibitors
    - **Real-time histogram data**: Symptom severity percentages now calculated from actual patient reports (intensity ≥5) by medication and dosage
    - **Enhanced API endpoints**: Created `/api/analytics/symptom-by-dosage` endpoint for dynamic symptom analysis
    - **Performance optimization**: Fixed infinite loop issues in analytics dashboard with useMemo implementation
    - **Medication-dosage specificity**: Accurate dosage analysis for Abemaciclib (150mg/100mg/50mg), Ribociclib (600mg/400mg/200mg), Palbociclib (125mg/100mg/75mg)
    - **Doctor workflow enhancement**: Streamlined analytics interface with only essential counters (Total Patients, Average Adherence) plus interactive drug analysis table

20. **Doctor-Specific Filtering and Enhanced Dashboard (July 2025)**:
   - **Comprehensive doctor filtering**: Implemented doctor-specific filtering across all dashboard sections (alerts, messages, chat notifications, missed medications)
   - **Doctor information display**: Added doctor reference information below patient name and birth date in all notifications and alerts
   - **Removed green statistics section**: Eliminated non-functional green statistics cards from doctor dashboard for cleaner interface
   - **Enhanced notification counters**: All counters now reflect filtered data based on selected doctor view mode
   - **Doctor assignment visibility**: Added doctor name display in all patient-related notifications for better identification and workflow management
   - **Streamlined dashboard**: Focused dashboard on essential functionality with proper data filtering and authentic patient information
   - **Improved user experience**: Clear visual hierarchy with doctor information consistently displayed across all notification types

21. **Calendar Real-Time Updates and UI Cleanup (July 2025)**:
   - **Fixed calendar real-time refresh**: Implemented proper UPSERT logic in backend to prevent duplicate calendar events
   - **Enhanced mutation invalidation**: Added refetchQueries to ensure immediate calendar color updates after changes
   - **Removed duplicate calendar sections**: Eliminated redundant "Calendario Interattivo" and "Aggiungi Evento Manualmente" from doctor treatment profile page
   - **Removed calendar events list**: Eliminated "Eventi Calendario Esistenti" section from profile settings to streamline interface
   - **Improved dropdown options**: Updated calendar dropdown with correct Italian labels matching user requirements
   - **Database optimization**: Added getCalendarEventByPatientAndDate method to check existing events before creation
   - **UI consistency**: Streamlined doctor interface by removing duplicate functionality and focusing on main calendar component
   - **Icon size optimization**: Reduced navigation tab icons in doctor patient view from w-4 h-4 to w-3 h-3 for better button proportions
   - **Dashboard centering**: Centered total patient count number in doctor dashboard for improved visual alignment
   - **Patient calendar functionality restored**: Re-implemented ability for patients to mark therapy days as missed (red) and restore missed days as taken (green)
   - **Real-time calendar updates**: Fixed immediate color changes after patient interactions without page refresh
   - **Removed airplane emoji**: Cleaned up messaging interface by removing airplane emoji from "Invia Messaggio" button in patient video page

22. **Enhanced Patient Calendar Missed Medication Functionality (July 2025)**:
   - **Added missing mutation for patient calendar**: Implemented addMissedMedication mutation for patients to mark therapy days as missed
   - **Made therapy days clickable**: Green therapy days now have hover effects and cursor pointer for patient interaction
   - **Enhanced confirmation dialog**: Updated dialog to handle both adding and removing missed medication days with different titles and actions
   - **Real-time calendar updates**: Added refetchQueries to ensure immediate calendar refresh after patient changes
   - **No doctor notifications**: Patient calendar interactions only save to database without creating alerts for doctors
   - **Improved UX**: Clear visual feedback with red button for marking as missed and standard button for restoring as taken
   - **Clean messaging interface**: Removed conversation emoji (💬) from "Conversazione" title, keeping only styled MessageSquare icon

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