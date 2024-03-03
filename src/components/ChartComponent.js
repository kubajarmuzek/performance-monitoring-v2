import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import './charts/charts.css';

const ChartComponent = ({ data, height, width, chartsPerRow }) => {
  const [showStats, setShowStats] = useState(false);

  const calculateStatistics = () => {
    const values = data.map(item => item.value);

    return {
      average: values.reduce((acc, curr) => acc + curr, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      standardDeviation: calculateStandardDeviation(values),
      // Add more statistics as needed
    };
  };

  const calculateStandardDeviation = (values) => {
    const average = values.reduce((acc, curr) => acc + curr, 0) / values.length;
    const variance = values.reduce((acc, curr) => acc + Math.pow(curr - average, 2), 0) / values.length;
    return Math.sqrt(variance);
  };

  const calculatePercentageIncrease = () => {
    if (data.length < 2) return 0;

    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    const percentageIncrease = ((lastValue - firstValue) / firstValue) * 100;
    return percentageIncrease.toFixed(2);
  };

  const statistics = calculateStatistics();

  const percentageIncrease = calculatePercentageIncrease();

  const arrowDirection = percentageIncrease >= 0 ? '▲' : '▼';
  const arrowColor = percentageIncrease >= 0 ? 'green' : 'red';

  const handleStatsClick = () => {
    setShowStats(!showStats);
  };

  return (
    <div>
      <LineChart width={width} height={height} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
      <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '16px' }}>
        <span style={{ color: arrowColor }}>{percentageIncrease}% {arrowDirection}</span>
        <FontAwesomeIcon style={{ color: 'black', marginLeft: '10px', cursor: 'pointer' }} icon={showStats ? faTimes : faPlus} onClick={handleStatsClick} />

        {showStats && (
          <div className="chart-stats">
              <div className="stat">
                <span>Average:</span> {statistics.average.toFixed(2)}
              </div>
              <div className="stat">
                <span>Min:</span> {statistics.min}
              </div>
              <div className="stat">
                <span>Max:</span> {statistics.max}
              </div>
              <div className="stat">
                <span>Standard Deviation:</span> {statistics.standardDeviation.toFixed(2)}
              </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default ChartComponent;