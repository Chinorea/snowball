import { Container } from "@/components/Container";
import { Hero } from "@/components/Hero";
import { SectionTitle } from "@/components/SectionTitle";
import { Benefits } from "@/components/Benefits";
import { Video } from "@/components/Video";
import { Testimonials } from "@/components/Testimonials";
import { UserNavbar } from "@/components/User/UserNavBar";
import { Faq } from "@/components/Faq";
import { Cta } from "@/components/Cta";

import { benefitOne, benefitTwo } from "@/components/data";
import { VoucherCard } from "@/components/User/VoucherCard";

export default function Voucher() {
  return (
    <Container>
        <UserNavbar /> 
        <VoucherCard />
    </Container>
  );
}