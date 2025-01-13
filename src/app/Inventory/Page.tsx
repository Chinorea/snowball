import { AdminNavbar } from "@/components/Admin/AdminNavBar";
import { InventoryManagement } from "@/components/Admin/InventoryManagement/InventoryManagement";
import { Container } from "@/components/Container";

export default function Inventory() {
  return (
    <Container>
        <AdminNavbar /> 
        <InventoryManagement />
    </Container>
  );
}