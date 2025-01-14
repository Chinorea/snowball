import { Container } from "@/components/Container";
import { UserNavbar } from "@/components/User/UserNavBar";
import { VoucherLogsPage } from "@/components/User/VoucherCard/VoucherlogsPage/VoucherlogsPage";

export default function Voucher() {
  return (
    <Container>
        <UserNavbar /> 
        <VoucherLogsPage />
    </Container>
  );
}