import { AdminNavbar } from "@/components/Admin/AdminNavBar";
import { InventoryManagement } from "@/components/Admin/InventoryManagement/InventoryManagement";
import { Container } from "@/components/Container";
import { VoucherCard } from "@/components/User/VoucherCard";

export default function Inventory() {
  return (
    <Container>
        <AdminNavbar /> 
        <InventoryManagement />
    </Container>
  );
}