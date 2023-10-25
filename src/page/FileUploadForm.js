import React, { useState } from 'react';
import Papa from 'papaparse';
import { database, getCurrentUserUID } from '../firebase';
import { ref, get, push, set, child } from 'firebase/database';

function FileUploadForm() {
  const [csvData, setCSVData] = useState([]);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          const data = result.data;

          const userUID = getCurrentUserUID();
          if (userUID) {
            const labels = data[0].map(label => label.replace(/[.#$/[\]]/g, "_"));

            data.slice(1).forEach((row) => {
              const rowData = {};
              let customNodeName = ""; // Initialize the custom node name
            
              row.forEach((value, index) => {
                const label = labels[index];
                rowData[label] = value;
            
                // Check if the label is "Date" and use it to generate a custom node name
                if (label === "Date") {
                  customNodeName += value; 
                }
                if (label === "Time") {
                  customNodeName += value; 
                }
              });
            
              const databaseRef = ref(database, `users/${userUID}`);
              checkAndUpdateData(databaseRef, customNodeName.replace(/[.#$/[\]]/g, "_"), rowData);
            });

            setCSVData(data);
            setError(null);
          } else {
            setError("User not authenticated");
            setCSVData([]);
          }
        },
        error: (err) => {
          setError(err.message);
          setCSVData([]);
        },
      });
    }
  }

  // Function to check if data already exists and update or add a new entry
  const checkAndUpdateData = (databaseRef, customNodeName, rowData) => {
    const dataRef = child(databaseRef, customNodeName);
    get(dataRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          // Data already exists, update the existing record
          set(dataRef, rowData);
        } else {
          // Data doesn't exist, create a new record
          push(dataRef, rowData);
        }
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  return (
    <div>
      <h2>CSV File Reader</h2>
      <input type="file" onChange={handleFileChange} />
    
      {error && <p>Error: {error}</p>}
      {csvData.length > 0 && (
        <table className='charts--table'>
          <thead>
            <tr className='charts--table--cell'>
              {csvData[0].map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {csvData.slice(1).map((row, rowIndex) => (
              <tr key={rowIndex} className='charts--table---cell'>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default FileUploadForm;
