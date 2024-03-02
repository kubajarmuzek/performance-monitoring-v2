import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const ChartComponent = ({ data, height, width, chartsPerRow }) => {
  const calculatePercentageIncrease = () => {
    if (data.length < 2) return 0;

    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    const percentageIncrease = ((lastValue - firstValue) / firstValue) * 100;
    return percentageIncrease.toFixed(2);
  };

  const percentageIncrease = calculatePercentageIncrease();

  const arrowDirection = percentageIncrease >= 0 ? '▲' : '▼';
  const arrowColor = percentageIncrease >= 0 ? 'green' : 'red';

  return (
    <div>
      <LineChart width={width} height={height} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
      <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '16px', color: arrowColor }}>
        {percentageIncrease}% <span style={{ color: arrowColor }}>{arrowDirection}</span>
      </div>
    </div>
  );
};

export default ChartComponent;
