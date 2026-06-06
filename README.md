# Gynecology Hospital Management System - Backend

A comprehensive Node.js/Express backend application designed for managing patient care, admissions, treatments, and investigations in a gynecology hospital. The system provides robust APIs for staff management, patient records, medical history tracking, and advanced data analytics.

![Status](https://img.shields.io/badge/status-active-brightgreen) ![License](https://img.shields.io/badge/license-ISC-blue) ![Language](https://img.shields.io/badge/language-JavaScript-yellow)

## 🏥 Overview

This backend system powers a hospital management platform specifically designed for gynecology departments. It handles complex workflows including patient admission, treatment tracking, investigation management, and provides comprehensive analytics and reporting features.

## ✨ Key Features

### 👥 Staff Management
- User registration and authentication with JWT tokens
- Role-based access control (Consultant, Registrar, Medical Officer, Data Entry, SuperAdmin)
- Password management with bcrypt encryption
- OTP-based password recovery via email
- Staff profile management and activation

### 👨‍⚕️ Patient Management
- Complete patient registration and profile management
- Medical history tracking including allergies, past surgeries, diseases, and cancer history
- Patient admission/discharge workflows
- Support for patient identification (PHN, NIC, Blood Group)
- Admission status tracking (admitted/discharged)

### 🏥 Admission & Treatment
- Multi-visit admission tracking
- Treatment and investigation record creation and updates
- Clinical examination data recording (vital signs, physical exams)
- Management procedures (medical and surgical)
- Treatment outcome tracking

### 🔬 Investigation & Analysis
- Comprehensive lab investigation support:
  - Full Blood Count (FBC)
  - Urine Full Report (UFR)
  - Serum Electrolytes
  - Liver Function Tests (LFT)
  - Blood Glucose Tests
- Advanced imaging support (MRI, CT, USS)
- Statistical analysis and trends

### 📊 Analytics & Reporting
- Patient admission statistics (by year, month, day)
- Admission rate calculations
- Discharge tracking
- Complaint analysis
- Scan data analytics
- Historical statistics

### 📤 Data Export
- Export to Excel format
- Export to PDF format
- Multi-format data backup
- Database backup management
- Filtered exports by date range or patient

### 🤖 AI Integration
- Google Generative AI (Gemini) chatbot integration
- AI-powered assistance for clinical queries
- Contact form with email notifications

## 📋 Tech Stack

### Core
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database ORM**: Sequelize
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens) + Passport.js

### Security & Utilities
- **Password Hashing**: bcryptjs
- **Email**: Nodemailer
- **Session Management**: express-session + Redis (connect-redis)
- **CORS**: Enabled for cross-origin requests

### Data & Export
- **Excel**: ExcelJS, xlsx
- **PDF**: PDFKit
- **HTTP Client**: Axios

### AI & Advanced Features
- **AI**: Google Generative AI (Gemini)
- **OpenAI**: Support for OpenAI API integration

### Development
- **Process Manager**: Nodemon
- **CLI Tools**: Sequelize-CLI

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server
- Redis (for session management)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/vieronicka/gyn_backend.git
   cd gyn_backend
