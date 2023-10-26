import React, { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { getCurrentUserUID, database } from '../firebase';
import ChartComponent from './ChartComponent'; // Import your ChartComponent here

function ReadDataFromFirebase() {
  const [data, setData] = useState([]);
  const [paramNames, setParamNames] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userUID = getCurrentUserUID();

    if (userUID) {
      const databaseRef = ref(database, `users/${userUID}`);

      get(databaseRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const dataObject = snapshot.val();
            const dataAsArray = Object.values(dataObject);

            // Extract parameter names from the first item (assuming all items have the same structure)
            const firstItem = dataAsArray[0];
            if (firstItem) {
              const names = Object.keys(firstItem);
              setParamNames(names);
            }

            // Convert the data into a 2D table format (array of arrays)
            const dataInTableFormat = dataAsArray.map((item) => {
              return Object.values(item);
            });

            setData(dataInTableFormat);
            setError(null);
          } else {
            setError("No data found in the database for the current user.");
          }
        })
        .catch((error) => {
          setError(error.message);
        });
    } else {
      setError("User not authenticated");
    }
  }, []);

  // Helper function to strip units from values
  const stripUnits = (value) => {
    return value.replace(/[^\d.-]/g, ''); // Remove non-digit characters, including units
  };

  return (
    <div>
      <h2>Read Data from Firebase</h2>
      {error && <p>Error: {error}</p>}
      {data.length > 0 && (
        <div>
          <h3>Data Table</h3>
          <table className="data-table">
            <tbody>
              {data.slice(0).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {paramNames.length > 0 && (
        <div>
          <h3>Parameter Names</h3>
          <table className="param-names-table">
            <tbody>
              <tr>
                {paramNames
                  .filter((name) => name !== "Additional Load _kg_" && name !== "BW _KG" && name !== "ExternalId" &&
                  name !== "Name" && name !== "Time" && name !== "Test Type" && name !== "Tags") // Exclude specified parameters
                  .map((name, index) => (
                    <td key={index}>{name}</td>
                  ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {paramNames.length > 0 && (
        <div>
          <h3>Charts</h3>
          <div className='chart--grid'>
          {paramNames
            .filter((name) => name !== "Additional Load _kg_" && name !== "BW _KG" && name !== "ExternalId" &&
            name !== "Name" && name !== "Time" && name !== "Test Type" && name !== "Tags") // Exclude specified parameters
            .filter((paramName) => paramName !== 'Date') // Exclude 'Date' parameter
            .map((paramName, index) => (
              <div key={index}>
                <h4>{paramName}</h4>
                <ChartComponent
                  data={data.map((item) => ({
                    name: item[paramNames.indexOf('Date')],
                    value: parseFloat(stripUnits(item[paramNames.indexOf(paramName)])), // Remove units and parse as a float
                  }))
                  .filter((item) => item.value !== 0)} // Exclude data with value 0
                />
              </div>
            ))}
            </div>
        </div>
      )}
    </div>
  );
}

export default ReadDataFromFirebase;
