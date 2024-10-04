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
  ScatterChart,
  Scatter,
} from 'recharts';
import exampleData from './exampleData';

const CSVGraphApp = () => {
  const [data, setData] = useState(exampleData);
  const [threshold, setThreshold] = useState(0.5); // Default threshold
  const [pullMeans, setPullMeans] = useState([]);
  const [normalizedData, setNormalizedData] = useState([]);

  useEffect(() => {
    console.log('Data:', data);
    console.log('Threshold:', threshold);
    console.log('Normalized Data:', normalizedData);

    // Normalize the data (time starts at 0)
    normalizeData(data);

    const means = calculatePullMeans(normalizedData, threshold);
    setPullMeans(means);

    // Find inflection point
    findInflectionPoint(means);

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

  // Function to perform linear regression
  function linearRegression(data) {
    const n = data.length;
    const sumX = data.reduce((sum, point) => sum + point.middleTime, 0);
    const sumY = data.reduce((sum, point) => sum + point.meanWeight, 0);
    const sumXY = data.reduce((sum, point) => sum + point.middleTime * point.meanWeight, 0);
    const sumX2 = data.reduce((sum, point) => sum + point.middleTime * point.middleTime, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R²
    const meanY = sumY / n;
    const ssTotal = data.reduce((sum, point) => sum + Math.pow(point.meanWeight - meanY, 2), 0);
    const ssRes = data.reduce((sum, point) => sum + Math.pow(point.meanWeight - (slope * point.middleTime + intercept), 2), 0);
    const rSquared = 1 - ssRes / ssTotal;

    return { slope, rSquared };
  }

  // Find inflection point
  function findInflectionPoint(pullMeans) {
    let bestSplitIndex = -1;
    let maxR2Sum = -Infinity;
    let bestA1 = 0;
    let bestA2 = 0;

    for (let i = 3; i < pullMeans.length - 3; i++) {
      const formerPhase = pullMeans.slice(0, i);
      const latterPhase = pullMeans.slice(i);

      const { slope: a1, rSquared: r2_1 } = linearRegression(formerPhase);
      const { slope: a2, rSquared: r2_2 } = linearRegression(latterPhase);

      if (a1 > a2) {
        const r2Sum = r2_1 + r2_2;
        if (r2Sum > maxR2Sum) {
          maxR2Sum = r2Sum;
          bestSplitIndex = i;
          bestA1 = a1;
          bestA2 = a2;
        }
      }
    }

    if (bestSplitIndex !== -1) {
      const inflectionPoint = pullMeans[bestSplitIndex].middleTime;
      console.log('Inflection Point:', inflectionPoint);
      return inflectionPoint;
    } else {
      console.log('Inflection point not found.');
      return null;
    }
  }

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
            tickFormatter={(value) => value.toFixed(0)}
          />
          <YAxis
            label={{ value: 'Weight', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip />
          <Legend />
          <Bar dataKey="weight" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>

      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="middleTime" name="Time" unit="s" tickFormatter={(value) => value.toFixed(1)} />
          <YAxis dataKey="meanWeight" name="Weight" unit="kg" />

          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          <Scatter name="Mean Weights" data={pullMeans} fill="red" />
        </ScatterChart>
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
