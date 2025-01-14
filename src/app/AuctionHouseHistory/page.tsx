import { Container } from "@/components/Container";
import { UserNavbar } from "@/components/User/UserNavBar";
import { AuctionHistoryPage } from "@/components/User/AuctionHistory/AuctionHistoryPage";

export default function Cart() {
  return (
    <Container>
        <UserNavbar /> 
        <AuctionHistoryPage />
    </Container>
  );
}