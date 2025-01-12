import { Container } from "@/components/Container";
import { UserNavbar } from "@/components/User/UserNavBar";

import { benefitOne, benefitTwo } from "@/components/data";
import { ProductCardPage } from "@/components/User/Productcard";
import { UserRequestProduct } from "@/components/User/UserRequestProduct/UserRequestProduct";

export default function ReqProductUser() {
  return (
    <Container>
        <UserNavbar /> 
        <UserRequestProduct />
    </Container>
  );
}