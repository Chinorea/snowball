import { Container } from "@/components/Container";
import { UserNavbar } from "@/components/User/UserNavBar";
import { MissionLogsPage } from "@/components/User/UserMissionPage/MissionLogPage/MissionLogPage";

export default function product() {
  return (
    <Container>
        <UserNavbar /> 
        <MissionLogsPage />
    </Container>
  );
}