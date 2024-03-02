import React, { useState, useEffect } from 'react';
import { signOut } from "firebase/auth";
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';
import './charts.css';
import { ref, get } from 'firebase/database';
import { getCurrentUserUID, database } from '../../firebase';
import ChartComponent from '../ChartComponent';

const Charts = () => {
    const navigate = useNavigate();
    const [showSidebar, setShowSidebar] = useState(false);
    const [data, setData] = useState([]);
    const [paramNames, setParamNames] = useState([]);
    const [error, setError] = useState(null);
    const [chartsPerRow, setChartsPerRow] = useState(3);
    const [containerWidth, setContainerWidth] = useState(0);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const userUID = getCurrentUserUID();

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (userUID) {
                    const databaseRef = ref(database, `users/${userUID}`);
                    const snapshot = await get(databaseRef);
        
                    if (snapshot.exists()) {
                        const dataObject = snapshot.val();
                        const dataAsArray = Object.values(dataObject);
        
                        const metricArrays = {};
        
                        dataAsArray.forEach((item) => {
                            const metricName = item.label;
        
                            if (!metricArrays[metricName]) {
                                metricArrays[metricName] = [];
                            }
        
                            metricArrays[metricName].push({
                                ...item,
                                day: item.date,
                            });
                        });
        
                        setData(metricArrays);
                        setParamNames(Object.keys(metricArrays));
        
                        // Calculate minimum and maximum dates
                        let minDate = new Date();
                        let maxDate = new Date(0);
        
                        dataAsArray.forEach((item) => {
                            const currentDate = new Date(item.date);
                            if (currentDate < minDate) minDate = currentDate;
                            if (currentDate > maxDate) maxDate = currentDate;
                        });
        
                        // Format dates for input fields (YYYY-MM-DD)
                        const minDateFormatted = minDate.toISOString().split('T')[0];
                        const maxDateFormatted = maxDate.toISOString().split('T')[0];
        
                        setStartDate(minDateFormatted);
                        setEndDate(maxDateFormatted);
                    } else {
                        setError("No data found in the database for the current user.");
                    }
                } else {
                    setError("User not authenticated");
                }
            } catch (error) {
                setError(error.message);
            }
        };
        
    
        fetchData();
    
        const updateContainerWidth = () => {
            const container = document.getElementById('chart-container');
            if (container) {
                setContainerWidth(container.offsetWidth);
            }
        };
    
        window.addEventListener('resize', updateContainerWidth);
        updateContainerWidth();
    
        return () => {
            window.removeEventListener('resize', updateContainerWidth);
        };
    }, [userUID]);
    

    const handleStartDateChange = (event) => {
        setStartDate(event.target.value);
    };

    const handleEndDateChange = (event) => {
        setEndDate(event.target.value);
    };

    const stripUnits = (value) => {
        if (typeof value === 'string') {
            return value.replace(/[^\d.-]/g, '');
        } else {
            return value;
        }
    };

    const chartWidth = containerWidth / chartsPerRow;

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
                <h1>
                    Charts
                </h1>
            </div>
            <div id="chart-container">
                {error && <p>Error: {error}</p>}

                {paramNames.length > 0 && (
                    <div>
                        <label htmlFor="chartsPerRow">Charts Per Row: </label>
                        <select
                            className="chartsPerRow"
                            value={chartsPerRow}
                            onChange={(e) => setChartsPerRow(parseInt(e.target.value))}
                        >
                            {[1, 2, 3, 4, 5].map((num) => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>

                        <div className="date-selection">
                            <label htmlFor="startDate">Start Date:</label>
                            <input
                                type="date"
                                id="startDate"
                                value={startDate}
                                onChange={handleStartDateChange}
                                style={{ marginRight: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '16px' }}
                            />
                            <label htmlFor="endDate">End Date:</label>
                            <input
                                type="date"
                                id="endDate"
                                value={endDate}
                                onChange={handleEndDateChange}
                                style={{ padding: '5px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '16px' }}
                            />
                        </div>

                        <div className='chart--grid' style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(calc(100% / ${chartsPerRow + 1}), 1fr))`, gap: '20px' }}>
                            {paramNames
                                .filter(
                                    (paramName) =>
                                        !isNaN(parseFloat(stripUnits(data[paramName][0][paramName]))) &&
                                        !data[paramName].every((item) => parseFloat(stripUnits(item[paramName])) === 0) && paramName !== "Date" && paramName !== "date"
                                )
                                .filter(paramName => data[paramName].some(item => {
                                    const dateObject = new Date(item.date.split('/').reverse().join('-'));
                                    const startDateObj = new Date(startDate);
                                    const endDateObj = new Date(endDate);
                                    return dateObject >= startDateObj && dateObject <= endDateObj;
                                }))
                                .map((paramName, index) => (
                                    <div className="chart" key={index} style={{ width: chartWidth, paddingLeft: `${20 / chartsPerRow}%`, paddingRight: `${20 / chartsPerRow}%` }}>
                                        <h4>{paramName}</h4>
                                        <ChartComponent
                                            data={data[paramName].filter(item => {
                                                const dateObject = new Date(item.date.split('/').reverse().join('-'));
                                                const startDateObj = new Date(startDate);
                                                const endDateObj = new Date(endDate)
                                                return dateObject >= startDateObj && dateObject <= endDateObj;
                                            })
                                                .map((item) => ({
                                                    name: item.day,
                                                    value: parseFloat(stripUnits(item[paramName])),
                                                }))
                                                .filter((item) => item.value !== 0)}
                                            width={chartWidth * (1 - 0.4 / chartsPerRow)}
                                            height={chartWidth * 0.75 * (1 - 0.4 / chartsPerRow)}
                                            chartsPerRow={chartsPerRow}
                                        />
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Charts;
