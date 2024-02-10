import React, { useState, useEffect } from 'react';
import { signOut } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, getCurrentUserUID, database } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import './corelation.css';

function Corelation() {
    const navigate = useNavigate();
    const [showSidebar, setShowSidebar] = useState(false);
    const [selectedMetricX, setSelectedMetricX] = useState('');
    const [selectedMetricY, setSelectedMetricY] = useState('');
    const [showChart, setShowChart] = useState(false);
    const [metricsData, setMetricsData] = useState([]);
    const [results, setResults] = useState([]);
    const hoverStyles = {
        marginLeft: '300px',
    };
    const defaultStyle = {
        marginLeft: 0,
    };

    useEffect(() => {
        fetchDataFromFirebase();
    }, []);

    const fetchDataFromFirebase = async () => {
        try {
            const userUID = getCurrentUserUID();
            const databaseRef = ref(database, `users/${userUID}`);

            const snapshot = await get(databaseRef);

            if (snapshot.exists()) {
                const userData = snapshot.val();
                const metricsData = Object.values(userData);
                setMetricsData(metricsData);
            } else {
                console.log("No data available");
            }
        } catch (error) {
            console.error("Error fetching data:", error.message);
        }
    };

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

    const handleMetricXSelect = (event) => {
        setSelectedMetricX(event.target.value);
    }

    const handleMetricYSelect = (event) => {
        setSelectedMetricY(event.target.value);
    }

    const handleSubmit = async () => {
        try {
            const selectedMetricsData = metricsData.filter(metric => metric.label === selectedMetricX || metric.label === selectedMetricY);

            // Sort the data based on dates
            const sortedData = selectedMetricsData.sort((a, b) => {
                const dateA = a.date.split('/').reverse().join('-');
                const dateB = b.date.split('/').reverse().join('-');
                return new Date(dateA) - new Date(dateB);
            });

            setShowChart(true);
            setResults(sortedData);
        } catch (error) {
            console.error("Error fetching data:", error.message);
            setShowChart(false);
            setResults([]);
        }
    }

    const preprocessData = (data) => {
        const groupedData = {};
        data.forEach((item) => {
            const date = item.date;
            if (!groupedData[date]) {
                groupedData[date] = { date: date };
            }
            groupedData[date][item.label] = item[item.label];
        });

        return Object.values(groupedData);
    };

    const processedData = preprocessData(results);


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

            <div className="container">
                <div className="left-column">
                    <div className="input-field">
                        <label>1st value:</label>
                        <select value={selectedMetricX} onChange={handleMetricXSelect}>
                            <option value="">Select</option>
                            {metricsData
                                .filter((metric, index, self) =>
                                    index === self.findIndex((m) => m.label === metric.label)
                                )
                                .map((metric, index) => (
                                    <option key={index} value={metric.label}>{metric.label}</option>
                                ))}
                        </select>

                    </div>
                </div>
                <div className="middle-column">
                    <div className="input-field">
                        <label>2nd value:</label>
                        <select value={selectedMetricY} onChange={handleMetricYSelect}>
                            <option value="">Select</option>
                            {metricsData
                                .filter((metric, index, self) =>
                                    index === self.findIndex((m) => m.label === metric.label)
                                )
                                .map((metric, index) => (
                                    <option key={index} value={metric.label}>{metric.label}</option>
                                ))}
                        </select>
                    </div>
                </div>
                <div className="right-column">
                    <button onClick={handleSubmit}>Submit</button>
                </div>
            </div>


            {showChart && (
                <div className="chart--corelation">
                    <LineChart width={600} height={400} data={processedData} style={{ margin: 'auto' }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" type="category" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey={selectedMetricX} stroke="#8884d8" activeDot={{ r: 8 }} yAxisId="left" />
                        <Line type="monotone" dataKey={selectedMetricY} stroke="#82ca9d" activeDot={{ r: 8 }} yAxisId="right" />
                    </LineChart>
                </div>
            )}

        </div>
    );
}

export default Corelation;
