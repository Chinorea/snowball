import { AdminNavbar } from "@/components/Admin/AdminNavBar";
import { AuctionManagerPage } from "@/components/Admin/AuctionManager/AuctionManagerPage";
import { Container } from "@/components/Container";

export default function VoucherApproval() {
  return (
    <Container>
        <AdminNavbar /> 
        <AuctionManagerPage />
    </Container>
  );
}