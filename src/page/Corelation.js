import React, { useState } from 'react';
import { signOut } from "firebase/auth";
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import FileUploadForm from './FileUploadForm';
import './home.css';
import ReadDataFromDatabase from './ReadFromDatabase';

function Corelation() {
    
    const navigate = useNavigate();
    const [showSidebar, setShowSidebar] = useState(false);
    const hoverStyles = {
        marginLeft: '300px',
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
            console.log(errorCode, errorMessage);
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
            <h1> Choose the metrics you want to see the corelation of</h1>
            
        </div>
    );
}

export default Corelation;
