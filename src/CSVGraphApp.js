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
  const [threshold, setThreshold] = useState(0.5); // Default threshold
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
          pulls.push(currentPull);
          currentPull = [];
        }
      }
    });

    if (currentPull.length > 0) {
      pulls.push(currentPull);
    }

    const means = pulls.map((pull, index, arr) => {
      const sum = pull.reduce((acc, val) => acc + val, 0);
      const mean = sum / pull.length;
      let difference = null;
      if (index > 0) {
        const previousMean = arr[index - 1].reduce((acc, val) => acc + val, 0) / arr[index - 1].length;
        difference = mean - previousMean;
      }
      return {
        pullNumber: index + 1,
        meanWeight: mean,
        difference: difference,
      };
    });

    // Calculate increments of the differences
    for (let i = 2; i < means.length; i++) {
      const currentDifference = means[i].difference;
      const lastDifference = means[i - 1].difference;
      
      if (lastDifference !== 0 && lastDifference !== null && currentDifference !== null) {
        means[i].increment = ((currentDifference - lastDifference) / lastDifference) * 100;
      } else {
        means[i].increment = null;
      }
    }

    return means;
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
      <h1>Pull Means</h1>
      <table style={{ border: '1px solid black', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black' }}></th>
            <th style={{ border: '1px solid black' }}>Mean weight</th>
            <th style={{ border: '1px solid black' }}>Difference between last pull</th>
            <th style={{ border: '1px solid black' }}>Increment of the differences</th>
          </tr>
        </thead>
        <tbody>
          {pullMeans.map((pull) => (
            <tr key={pull.pullNumber}>
              <td style={{ border: '1px solid black' }}>{`Pull ${pull.pullNumber}`}</td>
              <td style={{ border: '1px solid black' }}>{pull.meanWeight.toFixed(2)}</td>
              <td style={{ border: '1px solid black' }}>
                {pull.difference !== null ? pull.difference.toFixed(2) : ''}
              </td>
              <td style={{ border: '1px solid black' }}>
                {pull.increment !== null && pull.increment !== undefined ? `${pull.increment.toFixed(2)}%` : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CSVGraphApp;