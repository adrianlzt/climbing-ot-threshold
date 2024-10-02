import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from 'recharts';
import exampleData from './exampleData';

const CSVGraphApp = () => {
  const [data, setData] = useState(exampleData);
  const [threshold, setThreshold] = useState(0.5); // Default threshold
  const [pullMeans, setPullMeans] = useState([]);
  const [normalizedData, setNormalizedData] = useState([]);

  useEffect(() => {
    // Normalize the data (time starts at 0)
    normalizeData(data);

    const means = calculatePullMeans(normalizedData, threshold);
    setPullMeans(means);


  }, [data, threshold, normalizedData]);

  const calculatePullMeans = (data, threshold) => {
    const pulls = [];
    let currentPull = [];

    // Iterate over the data and group the weights into pulls
    data.forEach((point) => {
      if (point.weight >= threshold) {
        currentPull.push(point);
      } else {
        // If the weight is below the threshold, we consider the pull to be over
        if (currentPull.length > 0) {
          pulls.push(currentPull);
          currentPull = [];
        }
      }
    });

    // If the last pull is not empty, add it to the pulls
    if (currentPull.length > 0) {
      pulls.push(currentPull);
    }

    // Calculate the mean weight of each pull
    const means = pulls.map((pull, index, arr) => {
      const sum = pull.reduce((acc, val) => acc + val.weight, 0);
      const mean = sum / pull.length;

      // Calculate the difference between the mean of the current pull and the previous pull
      let difference = null;
      if (index > 0) {
        const previousMean = arr[index - 1].reduce((acc, val) => acc + val.weight, 0) / arr[index - 1].length;
        difference = mean - previousMean;
      }

      // Calculate the rest time as the time between the last point of the current pull and the first point of the next pull
      let restTime = null;
      if (index < arr.length - 1) {
        const nextPull = arr[index + 1];
        restTime = nextPull[0].time - pull[pull.length - 1].time;
      }

      return {
        pullNumber: index + 1,
        meanWeight: mean,
        difference: difference,
        duration: pull[pull.length - 1].time - pull[0].time,
        restTime: restTime,
        middleTime: pull[Math.floor(pull.length / 2)].time,
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

  const normalizeData = (data) => {
    // Find the minimum time value
    const minTime = Math.min(...data.map(point => point.time));

    // Normalize the time values
    const normalized = data.map(point => ({
      ...point,
      time: point.time - minTime,
    }));

    setNormalizedData(normalized);
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
        <BarChart data={normalizedData}>
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
            <th style={{ border: '1px solid black' }}>Duration</th>
            <th style={{ border: '1px solid black' }}>Rest Time</th>
            <th style={{ border: '1px solid black' }}>Middle Time</th>
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
              <td style={{ border: '1px solid black' }}>{pull.duration.toFixed(2)} s</td>
              <td style={{ border: '1px solid black' }}>{pull.restTime !== null ? `${pull.restTime.toFixed(2)} s` : ''}</td>
              <td style={{ border: '1px solid black' }}>{pull.middleTime !== null ? pull.middleTime.toFixed(2) : ''} s</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CSVGraphApp;