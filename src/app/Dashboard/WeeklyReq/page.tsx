import { Container } from "@/components/Container";
import { AdminNavbar } from "@/components/Admin/AdminNavBar";
import { WeeklyRequestsReportPage } from "@/components/Admin/UserManagementPage/WeeklyRequestsReportPage";


export default function WeeklyReq() { //For user management
  return (
    <Container>
        <AdminNavbar /> 
        <WeeklyRequestsReportPage />
    </Container>
  );
}