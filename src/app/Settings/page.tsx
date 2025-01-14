import { Container } from "@/components/Container";
import { UserNavbar } from "@/components/User/UserNavBar";
import { SettingsPage } from "@/components/User/UserSettings/UserSetting";


export default function Settings() {
  return (
    <Container>
        <UserNavbar /> 
        <SettingsPage />
    </Container>
  );
}