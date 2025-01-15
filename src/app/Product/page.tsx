import { Container } from "@/components/Container";
import { UserNavbar } from "@/components/User/UserNavBar";
import { ProductCardPage } from "@/components/User/Productcard/Productcard";

export default function product() {
  return (
    <Container>
        <UserNavbar /> 
        <ProductCardPage />
    </Container>
  );
}