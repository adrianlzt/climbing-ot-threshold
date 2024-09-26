import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar
} from 'recharts';
import exampleData from './exampleData';

const CSVGraphApp = () => {
  const [data, setData] = useState(exampleData);
  const [threshold, setThreshold] = useState(5); // Default threshold
  const [pullMeans, setPullMeans] = useState([]);

  useEffect(() => {
    const means = calculatePullMeans(data, threshold);
    setPullMeans(means);
  }, [data, threshold]);

  const calculatePullMeans = (data, threshold) => {
    const pulls = [];
    let currentPull = [];

    data.forEach((point) => {
      if (point.weight >= threshold) {
        currentPull.push(point.weight);
      } else {
        if (currentPull.length > 0) {
          const sum = currentPull.reduce((a, b) => a + b, 0);
          const mean = sum / currentPull.length;
          pulls.push(mean);
          currentPull = [];
        }
      }
    });

    if (currentPull.length > 0) {
      const sum = currentPull.reduce((a, b) => a + b, 0);
      const mean = sum / currentPull.length;
      pulls.push(mean);
    }

    return pulls;
  };

  return (
    <div>
      <div>
        <label>
          Threshold (0.5 - 10 kg):
          <input
            type="number"
            value={threshold}
            min="0.5"
            max="10"
            step="0.1"
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
          />
        </label>
      </div>
      <ResponsiveContainer width="95%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            label={{ value: 'Time', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            label={{ value: 'Weight', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip />
          <Legend />
          <Bar dataKey="weight" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
      <div>
        <h3>Mean Weight of Each Pull:</h3>
        <ul>
          {pullMeans.map((mean, index) => (
            <li key={index}>
              Pull {index + 1}: {mean.toFixed(2)} kg
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CSVGraphApp;