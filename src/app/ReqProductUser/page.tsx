import { Container } from "@/components/Container";
import { UserNavbar } from "@/components/User/UserNavBar";
import { UserRequestProduct } from "@/components/User/UserRequestProduct/UserRequestProduct";

export default function ReqProductUser() {
  return (
    <Container>
        <UserNavbar /> 
        <UserRequestProduct />
    </Container>
  );
}