import Login from "./Login"
import Signup from "./Signup"
import "./auth.css"

const Auth = () => {
    return (
        <div className="login--body">
            <div className="login--box">
                <Login className="login--left" />
                <div className="or">OR</div>
                <Signup className="login--right" />
            </div>
        </div>
    );
}
export default Auth;