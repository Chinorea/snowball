import { AdminNavbar } from "@/components/Admin/AdminNavBar";
import { PreorderReqPage } from "@/components/Admin/PreorderReqPage/PreorderReqPage";
import { Container } from "@/components/Container";

export default function product() {
  return (
    <Container>
        <AdminNavbar />
        <PreorderReqPage /> 
    </Container>
  );
}