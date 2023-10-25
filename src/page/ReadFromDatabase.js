import React, { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { getCurrentUserUID, database } from '../firebase';

function ReadDataFromFirebase() {
  const [data, setData] = useState([]);
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

  return (
    <div>
      <h2>Read Data from Firebase</h2>
      {error && <p>Error: {error}</p>}
      {data.length > 0 && (
        <table className='data-table'>
          
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
      )}
    </div>
  );
}

export default ReadDataFromFirebase;
