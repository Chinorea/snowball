import { Container } from "@/components/Container";
import { AdminNavbar } from "@/components/Admin/AdminNavBar";
import { UserManagementPage } from "@/components/Admin/UserManagementPage";

export default function Dashboard() { //For user management
  return (
    <Container>
        <AdminNavbar /> 
        <UserManagementPage />
    </Container>
  );
}