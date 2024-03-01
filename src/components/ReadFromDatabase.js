import React, { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { getCurrentUserUID, database } from '../firebase';
import ChartComponent from './ChartComponent';

function ReadDataFromDatabase() {
  const [data, setData] = useState([]);
  const [paramNames, setParamNames] = useState([]);
  const [error, setError] = useState(null);
  const [chartsPerRow, setChartsPerRow] = useState(3); // Default value for charts per row
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
      {error && <p>Error: {error}</p>}

      {paramNames.length > 0 && (
        <div>
          <label htmlFor="chartsPerRow">Charts Per Row: </label>
          <select
            id="chartsPerRow"
            value={chartsPerRow}
            onChange={(e) => setChartsPerRow(parseInt(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>

          <div className='chart--grid'>
            {paramNames
              .filter(
                (paramName) =>
                  !isNaN(parseFloat(stripUnits(data[paramName][0][paramName]))) && // Exclude metrics with string values
                  !data[paramName].every((item) => parseFloat(stripUnits(item[paramName])) === 0) // Exclude metrics with only zeros as values
              )
              .map((paramName, index) => (
                <div key={index} style={{ flexBasis: `${100 / chartsPerRow}%` }}>
                  <h4>{paramName}</h4>
                  <ChartComponent
                    data={data[paramName]
                      .map((item) => ({
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
