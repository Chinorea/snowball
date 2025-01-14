import { AdminNavbar } from "@/components/Admin/AdminNavBar";
import { AuditLogsPage } from "@/components/Admin/InventoryManagement/AuditLogsPage/AuditLogsPage";

import { Container } from "@/components/Container";

export default function auditlogs() {
  return (
    <Container>
        <AdminNavbar /> 
        <AuditLogsPage />
    </Container>
  );
}