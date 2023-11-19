import Login from "../Login"
import Signup from "../Signup"
import "./auth.css"
import React from 'react';

const Auth = () => {
    const [activeMode,setActiveMode] = React.useState("login");
    return (
        <div className="login--body">
            <div className="login--box">
                <Login className="login--left" activeMode={activeMode} setActiveMode={setActiveMode}/>
                <Signup className="login--right" activeMode={activeMode} setActiveMode={setActiveMode}/>
            </div>
        </div>
    );
}
export default Auth;