import React, { useState } from 'react';
import { signOut } from "firebase/auth";
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { getCurrentUserUID } from '../../firebase';

import Sidebar from '../Sidebar';
import './home.css';

const Home = () => {
    const navigate = useNavigate();

    if(!getCurrentUserUID) {
        navigate("/auth");
    }
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
            navigate("/auth");
            console.log("Signed out successfully")
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage)
        });
    }

    return (
        <div className="home--body" style={showSidebar ? hoverStyles : defaultStyle}>
            <div className='home--top'>
                <span className="menu--bars" onClick={handleClick}><i className="fa-solid fa-bars fa"></i></span>
                <div className='home--logout'>
                    <button onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>
            {showSidebar && <Sidebar handleClick={handleClick} className="menu--sideNav" />}
            
            <div >
                <p>
                    Welcome Home
                </p>
            </div>
        </div>
    );
}

export default Home;
