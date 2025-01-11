"use client";

import { Container } from "@/components/Container";
import { useRouter } from "next/navigation";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import { useState } from "react";

export default function Home() {
  const router = useRouter(); // Initialize the router
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const logIn = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Prevent form submission
    router.push("/Dashboard"); // Navigate to the dashboard
  };

  const signUp = async(event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Prevent form submission
    try{
      await createUserWithEmailAndPassword(auth,email,password)
      .then((userCredential)=>{
          const user = userCredential.user;
      })
      } catch (err){
          console.error(err);
      }
  };

  return (
    // <Container className="min-h-screen w-full">
      <div className="bg-indigo-200 dark:bg-gray-800 min-h-screen w-full overflow-hidden flex items-center justify-center">
        <div className="bg-white dark:bg-gray-900 lg:w-6/12 md:w-7/12 w-8/12 shadow-3xl rounded-xl relative">
          <form className="p-12 md:p-24">
            {/* Email Input */}
            <div className="flex items-center text-lg mb-6 md:mb-8 relative">
              <input
                type="text"
                id="username"
                className="bg-gray-200 dark:bg-gray-700 dark:text-white rounded pl-12 py-2 md:py-4 focus:outline-none w-full"
                placeholder="Email Address"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {/* Password Input */}
            <div className="flex items-center text-lg mb-6 md:mb-8 relative">
              <input
                type="password"
                id="password"
                className="bg-gray-200 dark:bg-gray-700 dark:text-white rounded pl-12 py-2 md:py-4 focus:outline-none w-full"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {/* Login Button */}
            <button
              onClick={logIn}
              className="bg-gray-700 dark:bg-gray-800 font-medium p-2 md:p-4 text-white uppercase w-full rounded"
            >
              Log In
            </button>
            {/* Signup Button */}
            <button
              onClick={signUp}
              className="bg-gray-700 dark:bg-gray-800 font-medium p-2 md:p-4 text-white uppercase w-full rounded mt-4"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    // </Container>
  );
}
