import { Container } from "@/components/Container";
import { UserNavbar } from "@/components/User/UserNavBar";
import { TransactionHistoryPage } from "@/components/User/TransactionHistoryPage";

export default function TransactionHistory() {
  return (
    <Container>
        <UserNavbar /> 
        <TransactionHistoryPage />
    </Container>
  );
}