import { Container } from "@/components/Container";
import { AdminNavbar } from "@/components/Admin/AdminNavBar";
import { AdminTransactionHistoryPage } from "@/components/Admin/AdminTransactionHistoryPage/AdminTransactionHistoryPage";
import { Suspense } from "react";

export default function TransactionHistory() {
  return (
    <Container>
        <AdminNavbar /> 
          <Suspense fallback={<div>Loading...</div>}>
              <AdminTransactionHistoryPage />
          </Suspense>
    </Container>
  );
}