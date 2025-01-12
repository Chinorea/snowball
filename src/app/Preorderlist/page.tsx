import { Container } from "@/components/Container";
import { UserNavbar } from "@/components/User/UserNavBar";

import { PreorderList } from "@/components/User/PreorderPage/PreorderList";

export default function product() {
  return (
    <Container>
        <UserNavbar /> 
        <PreorderList />
    </Container>
  );
}