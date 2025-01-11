"use client"

import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/firebase/firebaseConfig";
// import { useRouter } from "next/navigation";
import { getData } from "../LoginPage/SignUpPage";


export const productCard = () => {

    const googleLogIn = async(event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault(); // Prevent form submission
        console.log(getData(event, "tester@gmail.com"));
    }

    return(
        <div>
            <div className="social-login">
                <button className="social-button"
                onClick={googleLogIn}
                >
                Google
                </button>
            </div>
        </div>
    );
}