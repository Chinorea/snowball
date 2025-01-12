import { Container } from "@/components/Container";
import { UserNavbar } from "@/components/User/UserNavBar";

import { PreorderPage } from "@/components/User/PreorderPage/PreorderPage";

export default function product() {
  return (
    <Container>
        <UserNavbar /> 
        <PreorderPage />
    </Container>
  );
}