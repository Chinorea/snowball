import { useRouter } from "next/navigation";
import "./index.css";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "@/firebase/firebaseConfig";
import { useState } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { setCurrentUserEmail, setIsAdmin, setIsUser } from "../User/userInfo";

export const createData = async (
  event: React.MouseEvent<HTMLButtonElement>,
  email: string,
  method: string,
  authUid: string
) => {
  event.preventDefault(); // Prevent form submission
  const username = email.split("@")[0];
  const userRef = doc(db, "users", email);
  try {
    await setDoc(
      userRef,
      {
        usertype: "User",
        email: email,
        loginMethod: method,
        username: username,
        points: 0,
        status: "Active",
        uid: authUid
      },
      { merge: true }
    );
    console.log("Document successfully written!");
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export const LoginDetails = () => {
  const router = useRouter(); // Initialize the router
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSuspended, setIsSuspended] = useState(false); // State for suspension popup

  const logIn = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Prevent form submission
    try {
      await signInWithEmailAndPassword(auth, email, password).then(
        async (userCredential) => {
          const user = userCredential.user;

          // Fetch user data from Firestore
          const userRef = doc(db, "users", email);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userType = userSnap.data()?.usertype;
            const userStatus = userSnap.data()?.status;

            // Check if the user is suspended
            if (userStatus === "Suspended") {
              setIsSuspended(true); // Show the suspended popup
              return; // Prevent further navigation
            }

            setCurrentUserEmail(email);

            // Route based on usertype
            if (userType === "Admin") {
              setIsAdmin();
              router.push("/Dashboard"); // Navigate to Admin Dashboard
            } else if (userType === "User" || userType === "user") {
              setIsUser();
              router.push("/Product"); // Navigate to User Voucher Page
            } else {
              alert("Invalid usertype. Please contact support.");
            }
          } else {
            alert("No user data found. Please sign up.");
          }
        }
      );
    } catch (err) {
      console.error(err);
      alert(err);
    }
  };

  const signUp = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Prevent form submission
    router.push("/SignUpPage");
  };

  const handleReturnToLogin = () => {
    setIsSuspended(false); // Close the popup
    router.push("/"); // Redirect to the login page
  };


  return (
    <div>
      {/* Suspended Popup */}
      {isSuspended && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>User Suspended</h2>
            <p>Your account is currently suspended. Please contact support for assistance.</p>
            <button
              onClick={handleReturnToLogin}
              className="bg-red-600 text-white p-2 rounded"
            >
              Return to Login
            </button>
          </div>
        </div>
      )}

      {/* Login Form */}
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
      <div className="mb-6 md:mb-8">
        <div className="flex items-center text-lg relative">
          <svg className="absolute ml-3" viewBox="0 0 24 24" width="24">
            <path d="m18.75 9h-.75v-3c0-3.309-2.691-6-6-6s-6 2.691-6 6v3h-.75c-1.24 0-2.25 1.009-2.25 2.25v10.5c0 1.241 1.01 2.25 2.25 2.25h13.5c1.24 0 2.25-1.009 2.25-2.25v-10.5c0-1.241-1.01-2.25-2.25-2.25zm-10.75-3c0-2.206 1.794-4 4-4s4 1.794 4 4v3h-8zm5 10.722v2.278c0 .552-.447 1-1 1s-1-.448-1-1v-2.278c-.595-.347-1-.985-1-1.722 0-1.103.897-2 2-2s2 .897 2 2c0 .737-.405 1.375-1 1.722z" />
          </svg>
          <input
            type="password"
            id="password"
            className="bg-gray-200 dark:bg-gray-700 dark:text-white rounded pl-12 py-2 md:py-4 focus:outline-none w-full"
            placeholder="Password"
            onChange={(ev) => setPassword(ev.target.value)}
          />
        </div>
        <a href="/ForgetPassword" className="forgot-password-link">
          Forgot password?
        </a>
      </div>
      <button
        onClick={logIn}
        className="bg-gray-700 dark:bg-gray-800 font-medium p-2 md:p-4 text-white uppercase w-full rounded"
      >
        Log In
      </button>
      <button
        onClick={signUp}
        className="bg-gray-700 dark:bg-gray-800 font-medium p-2 md:p-4 text-white uppercase w-full rounded mt-4"
      >
        Sign Up
      </button>
    </div>
  );
};
