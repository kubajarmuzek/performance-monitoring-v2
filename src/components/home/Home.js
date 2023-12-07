import React, { useState,useEffect } from 'react';
import { signOut } from "firebase/auth";
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { getCurrentUserUID, database } from '../../firebase';

import Sidebar from '../Sidebar';
import './home.css';

const Home = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [paramNames, setParamNames] = useState([]);
    const [error, setError] = useState(null);
    const userUID = getCurrentUserUID();
  
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
      console.log(data);
  
    }, [userUID]);
    if (!getCurrentUserUID()) {
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

            <div>
                <p>
                    Welcome Home
                </p>
            </div>

            <div>
                {error && <div>Error: {error}</div>}
                {paramNames.length > 0 && (
                    <table>
                        <thead>
                            <tr>
                                <th>Metric</th>
                                <th>Day</th>
                                <th>Value</th>
                                {/* Add additional table headers based on your data structure */}
                            </tr>
                        </thead>
                        <tbody>
                            {paramNames.map((paramName) => (
                                <React.Fragment key={paramName}>
                                    <tr>
                                        <th>{paramName}</th>
                                        <th>Day</th>
                                        <th>Value</th>
                                    </tr>
                                    {data[paramName].map((item) => (
                                        <tr key={item.day}>
                                            <td>{item.label}</td>
                                            <td>{item.day}</td>
                                            <td>{item[paramName]}</td>
                                            {/* Add additional table cells based on your data structure */}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default Home;