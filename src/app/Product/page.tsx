import { Container } from "@/components/Container";
import { UserNavbar } from "@/components/User/UserNavBar";

import { benefitOne, benefitTwo } from "@/components/data";
import { ProductCardPage } from "@/components/User/Productcard/Productcard";

export default function product() {
  return (
    <Container>
        <UserNavbar /> 
        <ProductCardPage />
    </Container>
  );
}