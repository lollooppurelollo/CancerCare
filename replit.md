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

## Data Flow

1. **Patient Registration**: New patients create accounts with medical information
2. **Daily Tracking**: Patients log symptoms and medication adherence
3. **Data Aggregation**: System processes patient data for alerts and analytics
4. **Doctor Review**: Healthcare providers monitor patient status and respond to alerts
5. **Communication**: Bidirectional messaging between patients and doctors

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