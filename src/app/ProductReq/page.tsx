import { Container } from "@/components/Container";
import { AdminNavbar } from "@/components/Admin/AdminNavBar";
import { UserManagementPage } from "@/components/Admin/UserManagementPage";
import { ProductRequestApproval } from "@/components/Admin/ProductRequestAdmin/ProductRequestAdmin";

export default function ProductReq() { //For user management
  return (
    <Container>
        <AdminNavbar /> 
        <ProductRequestApproval />
    </Container>
  );
}