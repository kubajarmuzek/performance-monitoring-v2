import React, { useState } from 'react';
import { signOut } from "firebase/auth";
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './home.css';

const Questionary = () => {
    const navigate = useNavigate();
    const [showSidebar, setShowSidebar] = useState(false);
    const hoverStyles = {
        marginLeft: '300px',
        //backgroundColor: "rgba(0,0,0,0.4)",
    };
    const defaultStyle = {
        marginLeft: 0,
    }
    const handleClick = () => {
        setShowSidebar(showSidebar => !showSidebar);
    }

    const handleLogout = () => {
        signOut(auth).then(() => {
            // Sign-out successful.
            navigate("/auth");
            console.log("Signed out successfully")
        }).catch((error) => {
            // An error happened.
        });
    }


    return (
        <div classname="home--body" style={showSidebar ? hoverStyles : defaultStyle}>
            <div className='home--top'>
                <span className="menu--bars" onClick={handleClick}><i class="fa-solid fa-bars fa"></i></span>
                <div className='home--logout'>
                    <button onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>
            {showSidebar && <Sidebar handleClick={handleClick} className="menu--sideNav" />}
            <div >
                <h1>
                    Readiness Questionary
                </h1>
            </div>
        </div>
    );
}
export default Questionary;