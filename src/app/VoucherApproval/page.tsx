import { AdminNavbar } from "@/components/Admin/AdminNavBar";
import { VoucherApprovalPage } from "@/components/Admin/VoucherApprovalPage/VoucherApprovalPage";
import { Container } from "@/components/Container";

export default function VoucherApproval() {
  return (
    <Container>
        <AdminNavbar /> 
        <VoucherApprovalPage />
    </Container>
  );
}