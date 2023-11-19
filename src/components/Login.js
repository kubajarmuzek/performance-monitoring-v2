import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom'
import "./auth/auth.css"

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isEmailValid, setIsEmailValid] = useState(true);
    const [isPasswordValid, setIsPasswordValid] = useState(true);


    function isValidEmail(a) {
        const pattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

        return pattern.test(a);
    }

    const onLogin = (e) => {
        e.preventDefault();
        let isValid = true;

        if (!isValidEmail(email)) {
            setIsEmailValid(false);
            isValid = false;
        } else {
            setIsEmailValid(true);
        }

        if (password.trim() === '') {
            setIsPasswordValid(false);
            isValid = false;
        } else {
            setIsPasswordValid(true);
        }

        if (isValid) {
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    navigate("/");
                    console.log(user);
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    alert(errorCode, errorMessage);
                });
        }
    };


    return (
        <main className='login--left'>
            <section>
                <div>
                    <form>
                        <div>
                            <input
                                className={isEmailValid ? "" : "login--input--wrong"}
                                id="email-address"
                                name="email"
                                type="email"
                                value={email}
                                required
                                placeholder="Email address"
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setIsEmailValid(true); 
                                }}
                            />
                            {!isEmailValid && <p className='login--message'>Please enter a valid email</p>}
                        </div>

                        <div>
                            <input
                                className={isPasswordValid ? "" : "login--input--wrong"}
                                id="password"
                                name="password"
                                type="password"
                                required
                                placeholder="Password"
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setIsPasswordValid(true);
                                }}
                            />
                            {!isPasswordValid && <p className='login--message'>Please enter a valid password.</p>}
                        </div>

                        <button
                            onClick={onLogin}
                        >
                            Sign in
                        </button>
                    </form>


                </div>
            </section>
        </main>
    )
}

export default Login