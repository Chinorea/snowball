"use client";

import { Container } from "@/components/Container";
import { useRouter } from "next/navigation";
import { SocialLogin } from "@/components/LoginPage/SocialLogin";
import { SignUpPage } from "@/components/LoginPage/SignUpPage";

export default function Home() {
  const router = useRouter(); // Initialize the router

  const logIn = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Prevent form submission
    router.push("/Dashboard"); // Navigate to the dashboard
  };

  return (
    // <Container className="min-h-screen w-full">
    
      <div className="bg-indigo-200 dark:bg-gray-800 min-h-screen w-full overflow-hidden flex items-center justify-center">
        <div className="bg-white dark:bg-gray-900 lg:w-6/12 md:w-7/12 w-8/12 shadow-3xl rounded-xl relative">
          <form className="p-12 md:p-10">
          <h2 className="form-title">Log in with</h2>
            <SignUpPage />
            <SocialLogin />

          </form>
        </div>
      </div>
    // </Container>
  );
}
