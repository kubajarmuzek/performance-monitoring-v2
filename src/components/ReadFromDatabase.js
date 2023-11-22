import React, { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { getCurrentUserUID, database } from '../firebase';
import ChartComponent from './ChartComponent'; // Import your ChartComponent here

function ReadDataFromDatabase() {
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

            // Organize data into separate arrays based on metric names
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

            // Set the organized data and param names to state
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
  }, [userUID]);

  // Helper function to strip units from values
  const stripUnits = (value) => {
    if (typeof value === 'string') {
      return value.replace(/[^\d.-]/g, ''); // Remove non-digit characters, including units
    } else {
      return value;
    }
  };

  return (
    <div>
      <h2>Read Data from Firebase</h2>
      {error && <p>Error: {error}</p>}

      {paramNames.length > 0 && (
        <div>
          <h3>Charts</h3>
          <div className='chart--grid'>
            {paramNames
              .filter(
                (paramName) =>
                  !isNaN(parseFloat(stripUnits(data[paramName][0][paramName]))) && // Exclude metrics with string values
                  !data[paramName].every((item) => parseFloat(stripUnits(item[paramName])) === 0) // Exclude metrics with only zeros as values
              )
              .map((paramName, index) => (
                <div key={index}>
                  <h4>{paramName}</h4>
                  <ChartComponent
                    data={data[paramName].map((item) => ({
                      name: item.day,
                      value: parseFloat(stripUnits(item[paramName])),
                    }))
                      .filter((item) => item.value !== 0)} // Filter out 0 values
                  />
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReadDataFromDatabase;
