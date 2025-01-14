import { Container } from "@/components/Container";
import { UserNavbar } from "@/components/User/UserNavBar";
import { AuctionHouse } from "@/components/User/AuctionHouse/AuctionHouse";

export default function Cart() {
  return (
    <Container>
        <UserNavbar /> 
        <AuctionHouse />
    </Container>
  );
}