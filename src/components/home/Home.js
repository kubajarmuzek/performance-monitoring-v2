import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { getCurrentUserUID, database } from '../../firebase';
import { useTable, useSortBy, useFilters } from 'react-table';

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
  };
  const handleClick = () => {
    setShowSidebar((showSidebar) => !showSidebar);
  };
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate("/auth");
        console.log("Signed out successfully");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  };

  // Create columns for react-table based on paramNames
  const columns = React.useMemo(
    () =>
      paramNames.map((paramName) => ({
        Header: paramName,
        columns: [
          { Header: 'Label', accessor: 'label' },
          { Header: 'Day', accessor: 'day' },
          { Header: 'Value', accessor: paramName },
          // Add additional columns as needed
        ],
      })),
    [paramNames]
  );

  // Initialize the react-table instance
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data }, useFilters, useSortBy);

  return (
    <div className="home--body" style={showSidebar ? hoverStyles : defaultStyle}>
      <div className="home--top">
        <span className="menu--bars" onClick={handleClick}>
          <i className="fa-solid fa-bars fa"></i>
        </span>
        <div className="home--logout">
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
      {showSidebar && <Sidebar handleClick={handleClick} className="menu--sideNav" />}

      <div>
        <p>Welcome Home</p>
      </div>

      <div>
        {error && <div>Error: {error}</div>}
        {paramNames.length > 0 && (
          <table {...getTableProps()} style={{ width: '100%' }}>
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                      {column.render('Header')}
                      {/* Add a sort indicator */}
                      <span>
                        {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                      </span>
                      {/* Add a filter input */}
                      <div>{column.canFilter ? column.render('Filter') : null}</div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map((row) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Home;
