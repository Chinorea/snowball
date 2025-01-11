import { Container } from "@/components/Container";
import { UserNavbar } from "@/components/User/UserNavBar";

import { benefitOne, benefitTwo } from "@/components/data";
import { VoucherCard } from "@/components/User/VoucherCard";

export default function product() {
  return (
    <Container>
        <UserNavbar /> 
        <VoucherCard />
    </Container>
  );
}