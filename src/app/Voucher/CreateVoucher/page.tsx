import { AdminNavbar } from "@/components/Admin/AdminNavBar";
import { VoucherCreationPage } from "@/components/Admin/VoucherCreationPage/VoucherCreationPage";
import { Container } from "@/components/Container";

export default function CreateVoucher() {
  return (
    <Container>
        <AdminNavbar /> 
        <VoucherCreationPage />
    </Container>
  );
}