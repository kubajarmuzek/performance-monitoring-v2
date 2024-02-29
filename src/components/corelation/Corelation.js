import React, { useState, useEffect } from 'react';
import { signOut } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, getCurrentUserUID, database } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';
import { LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, ResponsiveContainer } from 'recharts';
import * as ss from 'simple-statistics';
import './corelation.css';

function Corelation() {
    const navigate = useNavigate();
    const [showSidebar, setShowSidebar] = useState(false);
    const [selectedMetricX, setSelectedMetricX] = useState('');
    const [selectedMetricY, setSelectedMetricY] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showChart, setShowChart] = useState(false);
    const [metricsData, setMetricsData] = useState([]);
    const [results, setResults] = useState([]);
    const [correlationComment, setCorrelationComment] = useState();
    const [commonData, setCommonData] = useState([]);
    const [correlation, setCorrelation] = useState(null); // State to store correlation coefficient
    const [linearModel, setLinearModel] = useState(null); // State to store linear regression model
    const [hoverStyles, setHoverStyles] = useState({
        marginLeft: '300px',
    });
    const [defaultStyle, setDefaultStyle] = useState({
        marginLeft: 0,
    });
    const [linePoints, setLinePoints] = useState([]);
    var minYValueCombined = Number.MAX_VALUE;
    var maxYValueCombined = Number.MIN_VALUE;
    var selectedMetricsData = [];

    useEffect(() => {
        fetchDataFromFirebase();
    }, []);

    useEffect(() => {
        // Update linePoints when linearModel changes
        if (linearModel !== null && commonData.length > 0) {
            const xLineValues = commonData.map(entry => entry[selectedMetricX]);
            const updatedLinePoints = xLineValues.map(x => {
                const y = linearModel.m * x + linearModel.b;
                return { [selectedMetricX]: x, [selectedMetricY]: y };
            });
            setLinePoints(updatedLinePoints);
        }
    }, [linearModel, commonData, selectedMetricX, selectedMetricY]);

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
            selectedMetricsData = metricsData.filter(metric => metric.label === selectedMetricX || metric.label === selectedMetricY);

            const filteredData = selectedMetricsData.filter(entry => {
                const entryDate = new Date(entry.date.split('/').reverse().join('-'));
                const startDateObj = new Date(startDate);
                const endDateObj = new Date(endDate);
                return entryDate >= startDateObj && entryDate <= endDateObj;
            });

            const sortedData = filteredData.sort((a, b) => {
                const dateA = a.date.split('/').reverse().join('-');
                const dateB = b.date.split('/').reverse().join('-');
                return new Date(dateA) - new Date(dateB);
            });

            selectedMetricsData.forEach(metric => {
                if (metric[selectedMetricX] > maxYValueCombined) {
                    maxYValueCombined = metric[selectedMetricX]
                }
                if (metric[selectedMetricY] > maxYValueCombined) {
                    maxYValueCombined = metric[selectedMetricY]
                }
                if (metric[selectedMetricX] < minYValueCombined) {
                    minYValueCombined = metric[selectedMetricX]
                }
                if (metric[selectedMetricY] < minYValueCombined) {
                    minYValueCombined = metric[selectedMetricY]
                }
            })

            setShowChart(true);
            setResults(sortedData);

            const commonDates = findCommonDates(sortedData);
            const commonEntries = aggregateCommonData(sortedData, commonDates);

            if (commonDates.length > 0) {
                const numericCommonData = commonEntries.map(entry => ({
                    date: entry.date,
                    [selectedMetricX]: parseFloat(entry[selectedMetricX]),
                    [selectedMetricY]: parseFloat(entry[selectedMetricY]),
                }));

                setCommonData(numericCommonData);

                const xValues = numericCommonData.map(entry => entry[selectedMetricX]);
                const yValues = numericCommonData.map(entry => entry[selectedMetricY]);
                const corr = ss.sampleCorrelation(xValues, yValues);
                setCorrelation(corr);

                let correlationComment;
                if (corr >= 0.7) {
                    correlationComment = "Strong positive correlation: Changes in " + selectedMetricX + " are likely to be associated with similar changes in " + selectedMetricY + ".";
                } else if (corr >= 0.3 && corr < 0.7) {
                    correlationComment = "Moderate positive correlation: There is a tendency for " + selectedMetricX + " and " + selectedMetricY + " to increase together, but the relationship is not strong.";
                } else if (corr >= -0.3 && corr < 0.3) {
                    correlationComment = "Weak or no correlation: There is little to no linear relationship between " + selectedMetricX + " and " + selectedMetricY + ".";
                } else if (corr >= -0.7 && corr < -0.3) {
                    correlationComment = "Moderate negative correlation: As " + selectedMetricX + " increases, " + selectedMetricY + " tends to decrease, and vice versa, but the relationship is not strong.";
                } else {
                    correlationComment = "Strong negative correlation: Changes in " + selectedMetricX + " are likely to be associated with opposite changes in " + selectedMetricY + ".";
                }

                setCorrelationComment(correlationComment);

                const linearModel = ss.linearRegression(numericCommonData.map(entry => [entry[selectedMetricX], entry[selectedMetricY]]));
                setLinearModel(linearModel);

                const xLineValues = commonData.map(entry => entry[selectedMetricX]);
                const updatedLinePoints = xLineValues.map(x => {
                    const y = linearModel.m * x + linearModel.b;
                    return {
                        [selectedMetricX]: x,
                        [selectedMetricY]: y
                    };
                });
                setLinePoints(updatedLinePoints);
            }


        } catch (error) {
            console.error("Error fetching data:", error.message);
            setShowChart(false);
            setResults([]);
            setCorrelation(null);
            setLinearModel(null);
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

    const findCommonDates = (data) => {
        const datesX = new Set(data.filter(entry => entry.label === selectedMetricX).map(entry => entry.date));
        const datesY = new Set(data.filter(entry => entry.label === selectedMetricY).map(entry => entry.date));
        return [...datesX].filter(date => datesY.has(date));
    };

    const aggregateCommonData = (data, commonDates) => {
        const commonEntries = {};
        data.forEach(entry => {
            if (commonDates.includes(entry.date)) {
                if (!commonEntries[entry.date]) {
                    commonEntries[entry.date] = {};
                }
                commonEntries[entry.date]["date"] = entry.date;
                commonEntries[entry.date][entry.label] = entry[entry.label];
            }
        });
        return Object.values(commonEntries);
    };

    const handleStartDateChange = (event) => {
        setStartDate(event.target.value);
    }

    const handleEndDateChange = (event) => {
        setEndDate(event.target.value);
    }

    const processedData = preprocessData(results);

    const minXValue = Math.min(...commonData.map(entry => entry[selectedMetricX]));
    const maxXValue = Math.max(...commonData.map(entry => entry[selectedMetricX]));
    const minYValue = Math.min(...commonData.map(entry => entry[selectedMetricY]));
    const maxYValue = Math.max(...commonData.map(entry => entry[selectedMetricY]));

    const deltaX = (maxXValue - minXValue) * 0.2; // 10% increase
    const deltaY = (maxYValue - minYValue) * 0.2; // 10% increase
    const initialXDomain = [minXValue - deltaX, maxXValue + deltaX];
    const initialYDomain = [minYValue - deltaY, maxYValue + deltaY];

    // Calculate the minimum and maximum values for both selected metrics, excluding NaN values
    const cMinXValue = Math.min(
        ...processedData
            .filter(entry => !isNaN(entry[selectedMetricX])) // Filter out entries with NaN values for selectedMetricX
            .map(entry => entry[selectedMetricX])
    );

    const cMaxXValue = Math.max(
        ...processedData
            .filter(entry => !isNaN(entry[selectedMetricX])) // Filter out entries with NaN values for selectedMetricX
            .map(entry => entry[selectedMetricX])
    );

    const cMinYValue = Math.min(
        ...processedData
            .filter(entry => !isNaN(entry[selectedMetricY])) // Filter out entries with NaN values for selectedMetricY
            .map(entry => entry[selectedMetricY])
    );

    const cMaxYValue = Math.max(
        ...processedData
            .filter(entry => !isNaN(entry[selectedMetricY])) // Filter out entries with NaN values for selectedMetricY
            .map(entry => entry[selectedMetricY])
    );


    const cDeltaX = (cMaxXValue - cMinXValue) * 0.4; // 10% increase
    const cDeltaY = (cMaxYValue - cMinYValue) * 0.4; // 10% increase
    const cInitialXDomain = [cMinXValue - cDeltaX, cMaxXValue + cDeltaX];
    const cInitialYDomain = [cMinYValue - cDeltaY, cMaxYValue + cDeltaY];


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
    <h1>Correlation of two metrics</h1>
    <p>Select two metrics of which correlation you want to see</p>

    <div className="inputs">
        <div className="input-row">
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
        <div className="input-row">
            <div className="date-filter">
                <label className="date-label">Start Date:</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    className="date-input"
                />

                <label className="date-label">End Date:</label>
                <input
                    type="date"
                    value={endDate}
                    onChange={handleEndDateChange}
                    className="date-input"
                />
            </div>
        </div>
        <div className="input-row">
            <div className="right-column">
                <button onClick={handleSubmit}>Submit</button>
            </div>
        </div>
    </div>
</div>


            {showChart && (
                <div className="chart--correlation">
                    <ResponsiveContainer className="chart--container" width="80%" height={400}>
                        <LineChart width={600} height={400} data={processedData} style={{ margin: 'auto' }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" type="category" />
                            <YAxis yAxisId="left" domain={cInitialXDomain} />
                            <YAxis yAxisId="right" orientation='right' domain={cInitialYDomain} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey={selectedMetricX} stroke="#8884d8" activeDot={{ r: 8 }} yAxisId="left" />
                            <Line type="monotone" dataKey={selectedMetricY} stroke="#82ca9d" activeDot={{ r: 8 }} yAxisId="right" />
                        </LineChart>
                    </ResponsiveContainer>

                    {correlation !== null && linearModel !== null && (
                        <div className="statistics">
                            <h3>Statistics</h3>
                            <p>Correlation Coefficient: <span className="result">{correlation.toFixed(2)}</span></p>
                            <p><span className="result">{correlationComment}</span></p>
                            <p>Linear Regression Model: <span className="result"> Y = {linearModel.m.toFixed(2)}X + {linearModel.b.toFixed(2)}</span></p>
                        </div>
                    )}

                    {commonData.length > 0 &&

                        <div className="chart--correlation">
                            <ResponsiveContainer className="chart--container" width="80%" height={400}>
                                <ComposedChart width={600} height={400} style={{ margin: 'auto' }}>
                                    <CartesianGrid />
                                    <XAxis
                                        type="number"
                                        dataKey={selectedMetricX}
                                        name={selectedMetricX}
                                        domain={initialXDomain}
                                        label={{
                                            value: selectedMetricX,
                                            position: 'insideBottom',
                                            dy: 10 // Adjust this value to move the label away from the chart
                                        }}
                                    />
                                    <YAxis
                                        type="number"
                                        dataKey={selectedMetricY}
                                        name={selectedMetricY}
                                        domain={initialYDomain}
                                        label={{
                                            value: selectedMetricY,
                                            position: 'insideLeft',
                                            angle: -90,
                                            dx: 0, // Adjust this value to move the label away from the chart
                                        }}
                                    />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                    <Scatter name="Common Data" data={commonData} fill="#8884d8" />
                                    <Line
                                        type="monotone"
                                        dataKey={selectedMetricY}
                                        data={linePoints}
                                        stroke="#ff7300"
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    }


                    {commonData.length > 0 && (
                        <div className="common-data-table">
                            <h3>Common Data</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>{selectedMetricX}</th>
                                        <th>{selectedMetricY}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {commonData.map((entry, index) => (
                                        <tr key={index}>
                                            <td>{entry.date}</td>
                                            <td>{entry[selectedMetricX]}</td>
                                            <td>{entry[selectedMetricY]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

        </div >
    );
}

export default Corelation;
