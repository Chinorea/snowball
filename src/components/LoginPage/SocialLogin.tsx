import "./index.css"

export const SocialLogin = () => {
    return(
        <div>
            <p className="separator"><span>or</span></p>
            <div className="social-login">
                <button className="social-button">
                <img src="/img/google.svg" alt="Google" className="social-icon" />
                Google
                </button>
                <button className="social-button">
                <img src="/img/apple.svg" alt="Apple" className="social-icon" />
                Apple
                </button>
            </div>
        </div>
    );
}