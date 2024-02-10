import React, { useState, useEffect } from 'react';
import { signOut } from "firebase/auth";
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { ref, get, remove, update, set } from 'firebase/database';
import { getCurrentUserUID, database } from '../../firebase';

import Sidebar from '../Sidebar';
import './home.css';

const Home = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [paramNames, setParamNames] = useState([]);
  const [error, setError] = useState(null);
  const [editingData, setEditingData] = useState(null); 
  const [newRowData, setNewRowData] = useState({ metric: '', day: '', value: '' });

  const userUID = getCurrentUserUID();

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

  const handleDelete = async (paramName, day) => {
    try {
      const formattedDay = day.replace(/\//g, '_');

      const userRef = ref(database, `users/${getCurrentUserUID()}/${formattedDay}${paramName}`);

      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        await remove(userRef);
        console.log(`Successfully deleted ${paramName} data for day ${formattedDay}`);

        await fetchData();
      } else {
        console.log(`${paramName} data for day ${formattedDay} does not exist`);
      }
    } catch (error) {
      console.error("Error deleting data:", error.message);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const { paramName, day, value } = editingData;
      const formattedDay = day.replace(/\//g, '_');
      const userRef = ref(database, `users/${getCurrentUserUID()}/${formattedDay}${paramName}`);
      await update(userRef, { [paramName]: value }); 
      setEditingData(null); 
      await fetchData(); 
    } catch (error) {
      console.error("Error editing data:", error.message);
    }
  };

  const handleEdit = (paramName, day) => {
    const itemToEdit = data[paramName].find(item => item.day === day);
    setEditingData({ paramName, day, value: itemToEdit[paramName] });
  };

  const handleAddRow = async () => {
    try {
      const { metric, day, value } = newRowData;
  
      // Check if any of the required fields are empty
      if (!metric || !day || !value) {
        console.error("Error adding new row: All fields are required");
        return;
      }
  
      const formattedDay = day.replace(/\//g, '_');
      const userRef = ref(database, `users/${getCurrentUserUID()}/${formattedDay}${metric}`);
      await set(userRef, { [metric]: value, date: day, label: metric }); 
      setNewRowData({ metric: '', day: '', value: '' }); 
      await fetchData(); 
    } catch (error) {
      console.error("Error adding new row:", error.message);
    }
  };
  

  useEffect(() => {
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

      <div className='home--table'>
        {error && <div>Error: {error}</div>}
        {paramNames.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Day</th>
                <th>Value</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              <tr key="new-row">
                <td>
                  <input
                    type="text"
                    value={newRowData.metric}
                    onChange={(e) => setNewRowData({ ...newRowData, metric: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={newRowData.day}
                    onChange={(e) => setNewRowData({ ...newRowData, day: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={newRowData.value}
                    onChange={(e) => setNewRowData({ ...newRowData, value: e.target.value })}
                  />
                </td>
                <td>
                  <button onClick={handleAddRow}>Add Row</button>
                </td>
                <td></td>
              </tr>
              {paramNames.sort().map((paramName) => (
                <React.Fragment key={paramName}>
                  <tr>
                    <th>{paramName}</th>
                    <th>Day</th>
                    <th>Value</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                  {data[paramName].map((item) => (
                    <tr key={item.day}>
                      <td>{item.label}</td>
                      <td>{item.day}</td>
                      <td>{item[paramName]}</td>
                      <td>
                        <button
                          onClick={() => handleEdit(paramName, item.day)} 
                        >
                          Edit
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(paramName, item.day)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {editingData && (
        <div className="edit-modal">
          <h2>Edit Data</h2>
          <p>Metric: {editingData.paramName}</p>
          <p>Day: {editingData.day}</p>
          <input
            type="text"
            value={editingData.value}
            onChange={(e) => setEditingData({...editingData, value: e.target.value})}
          />
          <button onClick={handleSaveEdit}>Save</button>
        </div>
      )}
    </div>
  );
}

export default Home;
