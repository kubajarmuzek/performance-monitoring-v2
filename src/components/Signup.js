import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isEmailValid, setIsEmailValid] = useState(true);
    const [isPasswordValid, setIsPasswordValid] = useState(true);

    const isValidEmail = (a) => {
        const pattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        return pattern.test(a);
    };

    const onSubmit = async (e) => {
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
            await createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    console.log(user);
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.log(errorCode, errorMessage);
                });
        }
    };

    return (
        <main className='login--right'>
            <section>
                <div>
                    <form>
                        <div>
                            <input
                                type="email"
                                className={isEmailValid ? "" : "login--input--wrong"}
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setIsEmailValid(true); // Reset validation when user types
                                }}
                                required
                                placeholder="Email address"
                            />
                            {!isEmailValid && <p className='login--message'>{email} isn't a valid email address.</p>}
                        </div>

                        <div>
                            <input
                                type="password"
                                className={isPasswordValid ? "" : "login--input--wrong"}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setIsPasswordValid(true); // Reset validation when user types
                                }}
                                required
                                placeholder="Password"
                            />
                            {!isPasswordValid && <p className='login--message'>Please enter a valid password.</p>}
                        </div>

                        <button
                            type="submit"
                            onClick={onSubmit}
                        >
                            Sign up
                        </button>
                    </form>
                </div>
            </section>
        </main>
    );
};

export default Signup;
