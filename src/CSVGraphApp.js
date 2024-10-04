import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Scatter,
} from 'recharts';
import { exampleData, generateArray } from './exampleData';
import { findInflectionPoint, calculatePullMeans } from './utils';
import PullMeansTable from './PullMeansTable';

const CSVGraphApp = () => {
  // const [data, setData] = useState(exampleData);
  const [data, setData] = useState(generateArray); // Generate random data
  const [threshold, setThreshold] = useState(0.5); // Default threshold
  const [pullMeans, setPullMeans] = useState([]);
  const [normalizedData, setNormalizedData] = useState([]);
  const [combinedData, setCombinedData] = useState([]);

  useEffect(() => {
    // Normalize the data when 'data' changes
    const minTime = Math.min(...data.map((point) => point.time));
    const normalized = data.map((point) => ({
      ...point,
      time: point.time - minTime,
    }));
    setNormalizedData(normalized);
  }, [data]);

  useEffect(() => {
    // Calculate pullMeans when 'normalizedData' or 'threshold' changes
    const means = calculatePullMeans(normalizedData, threshold);
    setPullMeans(means);
  }, [normalizedData, threshold]);

  useEffect(() => {
    // Combine normalizedData and pullMeans into combinedData
    const combineData = () => {
      // Initialize combinedData with normalizedData and meanWeight as null
      const combined = normalizedData.map((point) => ({
        time: point.time,
        weight: point.weight,
        meanWeight: null,
      }));

      // Assign meanWeight to the corresponding time
      pullMeans.forEach((pull) => {
        const index = combined.findIndex((dataPoint) => dataPoint.time === pull.middleTime);
        if (index !== -1) {
          combined[index].meanWeight = pull.meanWeight;
        }
      });

      setCombinedData(combined);
    };

    combineData();
  }, [normalizedData, pullMeans]);

  useEffect(() => {
    // Find inflection point when 'pullMeans' changes
    const results = findInflectionPoint(pullMeans);
  }, [pullMeans]);

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
      <ResponsiveContainer width="95%" height={400}>
        <ComposedChart data={combinedData}>
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
          <Scatter name="Mean Weights" dataKey="meanWeight" fill="red" />
        </ComposedChart>
      </ResponsiveContainer>

      <PullMeansTable pullMeans={pullMeans} />
    </div>
  );
};

export default CSVGraphApp;
