import { useRouter } from "next/navigation";
import "./index.css";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import { useState } from "react";

export const ForgetPassword = () => {
  const router = useRouter(); // Initialize the router
  const [email, setEmail] = useState("");
  // const admin = require("firebase-admin");

  const resetPassword = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Prevent form submission
    try {
      await sendPasswordResetEmail(auth, email).then(
        () => {
          alert("Password Reset Email Sent");
          router.push("/");
        }
      );
    } catch (err) {
      console.error(err);
      alert(err);
    }
    // sendPasswordResetLink("12345678", email);
  };

  // async function sendPasswordResetLink(phoneNumber: string, email: string) {
  //   try{
  //     const resetLink = await admin.auth().generatePasswordResetLink(email);
  //     sendSms(phoneNumber, resetLink);
  //     alert("Password reset link sent to your phone number.");
  //   } catch (error) {
  //     console.error("Error sending password reset link:", error);
  //     alert("Error sending password reset link. Please try again later.");
  //   }
  // }

  // const sendSms = (phoneNumber: string, message: string) => {
  //   console.log(`Sending SMS to ${phoneNumber}: ${message}`);
  // }

  return (
    <div>
      {/* Email Input */}
      <div className="flex items-center text-lg mb-6 md:mb-8 relative">
        <svg className="absolute ml-3" width="24" viewBox="0 0 24 24">
          <path d="M20.822 18.096c-3.439-.794-6.64-1.49-5.09-4.418 4.72-8.912 1.251-13.678-3.732-13.678-5.082 0-8.464 4.949-3.732 13.678 1.597 2.945-1.725 3.641-5.09 4.418-3.073.71-3.188 2.236-3.178 4.904l.004 1h23.99l.004-.969c.012-2.688-.092-4.222-3.176-4.935z" />
        </svg>
        <input
          type="text"
          id="username"
          className="bg-gray-200 dark:bg-gray-700 dark:text-white rounded pl-12 py-2 md:py-4 focus:outline-none w-full"
          placeholder="Email Address"
          onChange={(ev) => setEmail(ev.target.value)}
        />
      </div>
      {/* Signup Button */}
      <button
        onClick={resetPassword}
        className="bg-gray-700 dark:bg-gray-800 font-medium p-2 md:p-4 text-white uppercase w-full rounded mt-4"
      >
        Reset my Password
      </button>
    </div>
  );
};
