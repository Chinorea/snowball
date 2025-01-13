import "./index.css"
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, provider, db } from "@/firebase/firebaseConfig";
import { useRouter } from "next/navigation";
import { createData } from "./LoginDetails";
import { setCurrentUserEmail, setIsAdmin, setIsUser } from "../User/userInfo";
import { doc, getDoc } from "firebase/firestore";


export const SocialLogin = () => {
    const router = useRouter(); // Initialize the router
    
    const redirectUser = async (event: React.MouseEvent<HTMLButtonElement>, email: string, uid: string) => {
          const userRef = doc(db, "users", email);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userType = userSnap.data()?.usertype;

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
            createData(event, email, "Google", uid)
            setIsUser();
            router.push("/Product");
          }
    }

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
          const authUid = user.uid;
          if(email == null){
            return;
          }
          setCurrentUserEmail(email);
          redirectUser(event, email, authUid);
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