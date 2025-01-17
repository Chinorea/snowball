"use client";

import { Container } from "@/components/Container";
import { useRouter } from "next/navigation";

import { ForgetPassword } from "@/components/ForgetPassword/ForgetPassword";


export default function Home() {
  const router = useRouter(); // Initialize the router

  return (
    <div
      className="min-h-screen w-full overflow-hidden flex items-center justify-center"
      style={{
        backgroundImage: `url('/img/bg-log.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="bg-white dark:bg-gray-900 lg:w-6/12 md:w-7/12 w-8/12 shadow-3xl rounded-xl relative">
        <form className="p-12 md:p-10">
          <h2 className="form-title">Forgot Password</h2>
          <ForgetPassword />
        </form>
      </div>
    </div>
  );
}
