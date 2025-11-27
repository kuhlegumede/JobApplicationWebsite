# Job Application System - Documentation

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [How to Run the Project](#how-to-run-the-project)
3. [Key Features Implementation](#key-features-implementation)

---

## Prerequisites

### Backend (.NET 8.0 Web API)
- **.NET SDK 8.0** or later - [Download here](https://dotnet.microsoft.com/download/dotnet/8.0)
- **SQLite** (included with .NET, no separate installation needed)
- **Visual Studio 2022** or **Visual Studio Code** (optional but recommended)

### Frontend (React + Vite)
- **Node.js 18.x** or later - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

### Additional Tools
- **Git** for version control
- A modern web browser (Chrome, Firefox, Edge, or Safari)

---

## How to Run the Project

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "Job Application System"
```

### 2. Backend Setup (ASP.NET Core API)

#### Navigate to backend directory:
```bash
cd Job_Application
```

#### Restore dependencies:
```bash
dotnet restore
```

#### Apply database migrations:
```bash
dotnet ef database update
```
*Note: This creates a SQLite database (`JobApplicationDB.db`) with a default admin account.*

#### Run the backend:
```bash
dotnet run
# Or use watch mode for development:
dotnet watch run
```

The API will be available at:
- **HTTPS:** `https://localhost:5068`
- **HTTP:** `http://localhost:5068`
- **Swagger UI:** `https://localhost:5068/swagger`

**Default Admin Credentials:**
- Email: `admin@jobapp.com`
- Password: `Admin@123`

### 3. Frontend Setup (React)

#### Open a new terminal and navigate to frontend directory:
```bash
cd group-project
```

#### Install dependencies:
```bash
npm install
```

#### Run the development server:
```bash
npm run dev
```

The React app will be available at:
- **URL:** `http://localhost:5173`

### 4. Access the Application
1. Open your browser and go to `http://localhost:5173`
2. Register as a Job Seeker or Employer
3. Login with your credentials

---

## Key Features Implementation

### 1. **Authentication & Authorization (JWT)**
- **Implementation:** JWT-based authentication using `Microsoft.AspNetCore.Authentication.JwtBearer`
- **Location:** `Program.cs`, `AuthController.cs`
- **How it works:**
  - Users register and receive a JWT token upon login
  - Token contains user ID, role (JobSeeker/Employer/Admin), and other claims
  - Protected endpoints validate tokens using `[Authorize]` attributes
  - Role-based access control using `[Authorize(Roles = "...")]`

### 2. **Job Seeker Features**

#### A. CV Upload & Management
- **Implementation:** File upload service with validation
- **Location:** `FileUploadController.cs`, `FileStorageService.cs`
- **Key Points:**
  - Files stored in `wwwroot/uploads/cvs/`
  - Validates file type (.pdf, .doc, .docx) and size (max 5MB)
  - Metadata stored in database (`UploadedFiles` table)
  - Employers can view CVs inline (without downloading) using PDF viewer

#### B. Profile Picture Capture
- **Implementation:** Base64 image upload endpoint for camera capture
- **Location:** `FileUploadController.cs` - `UploadJobSeekerProfilePictureBase64`
- **Key Points:**
  - Accepts base64-encoded images from device camera
  - Validates image format (JPEG, PNG) and size
  - Stores in `wwwroot/uploads/profile-pictures/jobseekers/`

#### C. Job Applications
- **Implementation:** Application submission with CV attachment
- **Location:** `JobApplicationController.cs`
- **Key Points:**
  - Links job seeker to job post with status tracking
  - Statuses: Pending, Reviewing, Shortlisted, Rejected, Accepted
  - Notifications sent to both parties on status changes

#### D. Assessments
- **Implementation:** Dynamic assessment system with questions/answers
- **Location:** `AssessmentController.cs`, `AssessmentRepository.cs`
- **Key Points:**
  - Assessments stored as JSON with questions and correct answers
  - Job seekers submit answers, system auto-grades
  - Scores stored in `AssessmentResult` table
  - Employers can view results

#### E. Messaging
- **Implementation:** Real-time chat using SignalR
- **Location:** `ChatHub.cs`, `MessageController.cs`
- **Key Points:**
  - WebSocket-based real-time communication
  - Messages stored in database for persistence
  - Users join groups based on their user ID
  - Push notifications on new messages

#### F. Notifications
- **Implementation:** Multi-type notification system
- **Location:** `NotificationController.cs`, `NotificationService.cs`
- **Key Points:**
  - Types: User (individual), Role (all users in role), System (all users)
  - Real-time delivery via SignalR
  - Persistent storage with read/unread status
  - Notifications for: applications, interviews, messages, approvals

#### G. Interview Management
- **Implementation:** Accept/decline interview invitations
- **Location:** `InterviewScheduleController.cs`
- **Key Points:**
  - Statuses: Scheduled, Accepted, Declined, Completed, Cancelled
  - Job seekers can accept or decline interviews
  - Reminder service sends notifications before interviews

### 3. **Employer Features**

#### A. Account Approval System
- **Implementation:** Custom authorization filter
- **Location:** `RequireApprovedEmployerAttribute.cs`, `AdminController.cs`
- **Key Points:**
  - All new employer accounts start with "Pending" status
  - Admin must approve before employer can post jobs
  - Filter blocks job posting attempts by unapproved employers
  - Approval statuses: Pending, Approved, Rejected

#### B. Job Posting
- **Implementation:** CRUD operations with company logo
- **Location:** `JobPostController.cs`, `JobPostRepository.cs`
- **Key Points:**
  - Company logo (employer profile picture) attached to every job post
  - Fields: title, description, requirements, salary, location, type
  - Admins can remove inappropriate posts
  - Status tracking: Active, Closed, Removed

#### C. View Applicants & CVs
- **Implementation:** File access control with inline viewing
- **Location:** `FileUploadController.cs` - `DownloadCV` endpoint
- **Key Points:**
  - Employers see list of applicants for their job posts
  - CVs served with `inline` content disposition for browser viewing
  - Access control: only employers with applications can view CVs

#### D. Assessment Creation
- **Implementation:** JSON-based assessment structure
- **Location:** `AssessmentController.cs`
- **Key Points:**
  - Create custom assessments with multiple questions
  - Link assessments to specific job posts
  - View job seeker results and scores

#### E. Interview Scheduling
- **Implementation:** Interview management system
- **Location:** `InterviewScheduleController.cs`
- **Key Points:**
  - Schedule interviews with date, time, location, and notes
  - Edit interview details
  - Cancel interviews
  - Notifications sent to job seekers

#### F. Company Logo Upload
- **Implementation:** Image upload similar to profile pictures
- **Location:** `FileUploadController.cs` - `UploadCompanyLogo`
- **Key Points:**
  - Stored in `wwwroot/uploads/profile-pictures/employers/`
  - Displayed on all job posts by that employer
  - Validates image format and size

#### G. Analytics Dashboard
- **Implementation:** Analytics service with aggregated data
- **Location:** `AnalyticsService.cs`, `EmployerController.cs`
- **Key Points:**
  - Track applications per job post
  - View application trends over time
  - Job post performance metrics

### 4. **Admin Features**

#### A. Employer Approval Workflow
- **Implementation:** Approval status management
- **Location:** `AdminController.cs` - `GetPendingEmployers`, `ApproveEmployer`, `RejectEmployer`
- **Key Points:**
  - View all pending employer registrations
  - Check company details before approval
  - Approve or reject with reason
  - Email notifications sent on approval/rejection

#### B. Job Post Moderation
- **Implementation:** Admin override for inappropriate content
- **Location:** `AdminController.cs` - `RemoveJobPost`
- **Key Points:**
  - Remove job posts that violate policies
  - Provide removal reason
  - Notify employer of removal

#### C. Account Management
- **Implementation:** User deactivation system
- **Location:** `AdminController.cs` - `DeactivateUserAccount`, `ReactivateUserAccount`
- **Key Points:**
  - Deactivate user accounts (blocks login)
  - Reactivate accounts
  - View all users with filtering by role and status

#### D. FAQ Management
- **Implementation:** CRUD operations for FAQs
- **Location:** `FaqController.cs`, `AdminController.cs`
- **Key Points:**
  - Create, update, delete FAQs
  - Order/priority management
  - Public endpoint for viewing FAQs

#### E. Reports & Analytics
- **Implementation:** Dashboard with system-wide statistics
- **Location:** `AnalyticsService.cs`, `AdminController.cs`
- **Key Points:**
  - Total users by role
  - Total job posts and applications
  - User growth trends
  - Application trends over time
  - Pending employer approvals count
  - System overview metrics

#### F. System Notifications
- **Implementation:** Broadcast notifications
- **Location:** `NotificationController.cs` - `CreateSystemNotification`
- **Key Points:**
  - Send announcements to all users
  - Role-based notifications (e.g., all employers)
  - Critical system updates

### 5. **Technical Architecture**

#### A. Database (Entity Framework Core + SQLite)
- **ORM:** Entity Framework Core 9.0
- **Database:** SQLite (portable, file-based)
- **Location:** `JobApplicationDB.db`
- **Context:** `JobApplicationDbContext.cs`
- **Migrations:** Automatic schema management

#### B. Repository Pattern
- **Purpose:** Separation of data access logic
- **Location:** `Repositories/` folder
- **Interface:** Each entity has an interface in `Interfaces/`
- **Benefits:** Testability, maintainability, loose coupling

#### C. Data Transfer Objects (DTOs)
- **Purpose:** API response/request models
- **Location:** `Dto/` folder
- **Mapping:** AutoMapper for entity-to-DTO conversion
- **Benefits:** Security (don't expose internal models), flexibility

#### D. Real-time Communication (SignalR)
- **Implementation:** ASP.NET Core SignalR
- **Hub:** `ChatHub.cs` at `/chathub` endpoint
- **Usage:** Messaging and notifications
- **Client:** SignalR JavaScript client in React

#### E. File Storage
- **Service:** `FileStorageService.cs`
- **Validation:** `FileValidationService.cs`
- **Storage:** Local file system (`wwwroot/uploads/`)
- **Organization:** Separate folders for CVs, profile pictures, logos

#### F. Security Features
- **Password Hashing:** BCrypt.Net-Next
- **JWT Tokens:** Secure, stateless authentication
- **CORS:** Configured for localhost development
- **Authorization Filters:** Custom attributes for business rules
- **File Validation:** Type, size, and content validation

---

## Project Structure

### Backend (`Job_Application/`)
```
Controllers/        - API endpoints
Data/              - DbContext and database seeding
Dto/               - Data transfer objects
Filters/           - Custom authorization filters
Hub/               - SignalR hubs
Interfaces/        - Repository interfaces
Migrations/        - EF Core migrations
Models/            - Entity models
Repositories/      - Data access layer
Services/          - Business logic layer
wwwroot/uploads/   - File storage
```

### Frontend (`group-project/`)
```
src/
  components/      - Reusable React components
  pages/           - Page components
  services/        - API service layer
  assets/          - Static assets
  utils/           - Helper functions
```

---

## Environment Configuration

### Backend (`appsettings.json`)
- **Database:** SQLite connection string
- **JWT:** Secret key, issuer, audience, expiration
- **File Storage:** Upload paths, size limits, allowed types
- **CORS:** Allowed origins for frontend

### Frontend
- **API Base URL:** `http://localhost:5068/api`
- **SignalR Hub:** `http://localhost:5068/chathub`

---

## Testing the System

1. **Register as Admin** (use seeded account) → Manage system
2. **Register as Employer** → Wait for admin approval → Post jobs
3. **Register as Job Seeker** → Upload CV → Apply for jobs
4. **Test Messaging** → Send messages between employer and job seeker
5. **Test Assessments** → Employer creates → Job seeker takes → View results
6. **Test Interviews** → Employer schedules → Job seeker accepts/declines
7. **View Reports** → Admin dashboard shows all statistics

---

## Troubleshooting

### Backend won't start
- Ensure .NET 8.0 SDK is installed: `dotnet --version`
- Check if port 5068 is available
- Run `dotnet ef database update` to create database

### Frontend won't start
- Ensure Node.js is installed: `node --version`
- Delete `node_modules` and run `npm install` again
- Check if port 5173 is available

### File uploads fail
- Check `wwwroot/uploads/` directory exists and has write permissions
- Verify file size is under 5MB for CVs
- Ensure file type is .pdf, .doc, or .docx for CVs

### SignalR connection fails
- Ensure backend is running
- Check browser console for WebSocket errors
- Verify JWT token is valid and not expired

---

**Last Updated:** November 2, 2025
