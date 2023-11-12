import React, { useState } from 'react';
import { signOut } from "firebase/auth";
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './home/home.css';

function Corelation() {
    const navigate = useNavigate();
    const [showSidebar, setShowSidebar] = useState(false);
    const [selectedMetric1, setSelectedMetric1] = useState('');
    const [selectedMetric2, setSelectedMetric2] = useState('');
    const hoverStyles = {
        marginLeft: '300px',
    };
    const defaultStyle = {
        marginLeft: 0,
    };

    const options = ['Metric 1', 'Metric 2', 'Metric 3', 'Metric 4', 'Metric 5'];

    const handleClick = () => {
        setShowSidebar(showSidebar => !showSidebar);
    }

    const handleLogout = () => {
        signOut(auth).then(() => {
            navigate("/auth");
            console.log("Signed out successfully");
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage);
        });
    }

    const handleMetric1Select = (metric) => {
        setSelectedMetric1(metric);
    }

    const handleMetric2Select = (metric) => {
        setSelectedMetric2(metric);
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
            <h1>Choose the metrics you want to see the correlation of</h1>
            <div>
                <h2>Select Metric 1:</h2>
                <div>
                    <button onClick={() => handleMetric1Select('')}>Clear</button>
                </div>
                <ul>
                    {options.map((option, index) => (
                        <li key={index} onClick={() => handleMetric1Select(option)}>
                            {option}
                        </li>
                    ))}
                </ul>
                <p>Selected Metric 1: {selectedMetric1}</p>
            </div>
            <div>
                <h2>Select Metric 2:</h2>
                <div>
                    <button onClick={() => handleMetric2Select('')}>Clear</button>
                </div>
                <ul>
                    {options.map((option, index) => (
                        <li key={index} onClick={() => handleMetric2Select(option)}>
                            {option}
                        </li>
                    ))}
                </ul>
                <p>Selected Metric 2: {selectedMetric2}</p>
            </div>
        </div>
    );
}

export default Corelation;
