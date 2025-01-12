import { Container } from "@/components/Container";
import { UserNavbar } from "@/components/User/UserNavBar";

import { PreorderPage } from "@/components/User/PreorderPage/PreorderPage";
import { UserMissionPage } from "@/components/User/UserMissionPage/UserMissionPage";

export default function product() {
  return (
    <Container>
        <UserNavbar /> 
        <UserMissionPage />
    </Container>
  );
}