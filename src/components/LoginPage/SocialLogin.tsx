import "./index.css"
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/firebase/firebaseConfig";
import { useRouter } from "next/navigation";
import { createData } from "./SignUpPage";


export const SocialLogin = () => {
    const router = useRouter(); // Initialize the router
    
    const googleLogIn = async(event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault(); // Prevent form submission
        signInWithPopup(auth, provider)
        .then((result) => {
          // This gives you a Google Access Token. You can use it to access the Google API.
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if(credential == null){
            return;
          }
          const token = credential.accessToken;
          // The signed-in user info.
          const user = result.user;
          const email = user.email
          if(email == null){
            return;
          }
          console.log(user);
          createData(event, email, "Google");
          //router.push("/Dashboard");
        }).catch((error) => {
          // Handle Errors here.
          const errorCode = error.code;
          const errorMessage = error.message;
          // The email of the user's account used.
          const email = error.customData.email;
          // The AuthCredential type that was used.
          const credential = GoogleAuthProvider.credentialFromError(error);
          console.log(errorCode, errorMessage, email, credential);
        });
    }

    return(
        <div>
            <p className="separator"><span>or</span></p>
            <div className="social-login">
                <button className="social-button"
                onClick={googleLogIn}
                >
                <img src="/img/google.svg" alt="Google" className="social-icon" />
                Google
                </button>
            </div>
        </div>
    );
}