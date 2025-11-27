import { Routes, Route } from "react-router-dom";
import { JobSeekerHome } from "./pages/jobSeeker/JobSeekerHome";
import JobSeekerMessages from "./pages/jobSeeker/Messages";
import { MyApplications } from "./pages/jobSeeker/MyApplications";
import { JobSeekerProfile } from "./pages/jobSeeker/JobSeekerProfile";
import { JobSeekerInterviews } from "./pages/jobSeeker/JobSeekerInterviews";
import { Login } from "./pages/auth/login";
import { ProfileCreation } from "./pages/auth/ProfileCreation";
import { PasswordReset } from "./pages/auth/PasswordReset";
import { EmployerProfileCreation } from "./pages/auth/EmployerProfileCreation";
import { JobSeekerProfileCreation } from "./pages/auth/JobSeekerProfileCreation";
import { EmployerHome } from "./pages/employer/EmployerHome";
import { JobSeekerAssessment } from "./pages/jobSeeker/JobSeekerAssessment";
import { AdminHomePage } from "./pages/admin/AdminHomePage";
import { EmployerAssessments } from "./pages/employer/EmployerAssessments";
import EmployerMessages from "./pages/employer/Messages";
import { UserManagement } from "./pages/admin/UserManagement";
import { FAQSManagement } from "./pages/admin/FAQSManagement";
import { AdminNotifications } from "./pages/admin/AdminNotifications";
import { FAQs } from "./pages/FAQs";
import { EmployerProfile } from "./pages/employer/EmployerProfile";
import { JobApplicants } from "./pages/employer/JobApplicants";
import { EmployerInterviews } from "./pages/employer/EmployerInterviews";
import AdminDashboard from "./pages/admin/AdminDashboard";
import EmployerApprovals from "./pages/admin/EmployerApprovals";
import JobPostModeration from "./pages/admin/JobPostModeration";
import Reports from "./pages/admin/Reports";
import { EmployerFAQs } from "./pages/employer/EmployerFAQs";
import { JobSeekerFAQs } from "./pages/jobSeeker/JobSeekerFAQs";

function App() {
  return (
    <>
      <title>NextStep - Job Portal</title>

      <Routes>
        <Route index element={<Login />} />
        <Route path="/jobseeker/home" element={<JobSeekerHome />} />
        <Route path="/jobseeker/profile" element={<JobSeekerProfile />} />
        <Route path="/jobseeker/messages" element={<JobSeekerMessages />} />
        <Route path="/jobseeker/applications" element={<MyApplications />} />
        <Route path="/jobseeker/interviews" element={<JobSeekerInterviews />} />
        <Route
          path="/jobseeker/assessments"
          element={<JobSeekerAssessment />}
        />
        <Route
          path="/jobseeker/creation"
          element={<JobSeekerProfileCreation />}
        />
        <Route path="/creation" element={<ProfileCreation />} />
        <Route path="/reset" element={<PasswordReset />} />
        <Route
          path="/employer/creation"
          element={<EmployerProfileCreation />}
        />
        <Route path="/employer/home" element={<EmployerHome />} />
        <Route path="/admin/home" element={<AdminHomePage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/employer-approvals" element={<EmployerApprovals />} />
        <Route path="/admin/job-post-moderation" element={<JobPostModeration />} />
        <Route path="/admin/reports" element={<Reports />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/faqs" element={<FAQSManagement />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/employer/assessments" element={<EmployerAssessments />} />
        <Route path="/employer/messages" element={<EmployerMessages />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/employer/profile" element={<EmployerProfile />} />
        <Route path="/employer/applicants/:jobId" element={<JobApplicants />} />
        <Route path="/employer/interviews" element={<EmployerInterviews />} />
        <Route path="/employer/faqs" element={<EmployerFAQs />} />
        <Route path="/jobseeker/faqs" element={<JobSeekerFAQs />} />
      </Routes>
    </>
  );
}

export default App;
