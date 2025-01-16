import { Container } from "@/components/Container";
import { AdminNavbar } from "@/components/Admin/AdminNavBar";
import { InventorySummaryReport } from "@/components/Admin/UserManagementPage/InventorySummaryReport";

export default function InventorySummary() { //For user management
  return (
    <Container>
        <AdminNavbar /> 
        <InventorySummaryReport />
    </Container>
  );
}