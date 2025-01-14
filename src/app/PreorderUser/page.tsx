import React, { Suspense } from "react";
import { Container } from "@/components/Container";
import { UserNavbar } from "@/components/User/UserNavBar";
import { PreorderPage } from "@/components/User/PreorderPage/PreorderPage";

export default function Preorder() {
  return (
    <Container>
      <UserNavbar />
      <Suspense fallback={<div>Loading...</div>}>
        <PreorderPage />
      </Suspense>
    </Container>
  );
}
