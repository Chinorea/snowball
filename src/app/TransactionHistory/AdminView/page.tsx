import { Container } from "@/components/Container";
import { AdminNavbar } from "@/components/Admin/AdminNavBar";
import { AdminTransactionHistoryPage } from "@/components/Admin/AdminTransactionHistoryPage/AdminTransactionHistoryPage";

export default function TransactionHistory() {
  return (
    <Container>
        <AdminNavbar /> 
        <AdminTransactionHistoryPage />
    </Container>
  );
}