import { Container } from "@/components/Container";
import { UserNavbar } from "@/components/User/UserNavBar";
import { VoucherCard } from "@/components/User/VoucherCard/VoucherCard";

export default function Voucher() {
  return (
    <Container>
        <UserNavbar /> 
        <VoucherCard />
    </Container>
  );
}