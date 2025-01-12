import { Container } from "@/components/Container";
import { UserNavbar } from "@/components/User/UserNavBar";
import { TransactionHistoryPage } from "@/components/User/TransactionHistoryPage";
import { Carting } from "@/components/User/Carting/Carting";

export default function Cart() {
  return (
    <Container>
        <UserNavbar /> 
        <Carting />
    </Container>
  );
}