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
  Line,
} from 'recharts';
import { exampleData, generateArray } from './exampleData';
import { findInflectionPoint, calculatePullMeans } from './utils';
import PullMeansTable from './PullMeansTable';

const CSVGraphApp = () => {
  const [data, setData] = useState(generateArray); // Generate random data
  const [threshold, setThreshold] = useState(0.5); // Default threshold
  const [pullMeans, setPullMeans] = useState([]);
  const [normalizedData, setNormalizedData] = useState([]);
  const [combinedData, setCombinedData] = useState([]);
  const [inflectionPoints, setInflectionPoints] = useState([]);
  const [selectedInflectionPoint, setSelectedInflectionPoint] = useState(null);

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
      let combined = normalizedData.map((point) => ({
        time: point.time,
        weight: point.weight,
        meanWeight: null,
      }));

      pullMeans.forEach((pull) => {
        const index = combined.findIndex((dataPoint) => dataPoint.time === pull.middleTime);
        if (index !== -1) {
          combined[index].meanWeight = pull.meanWeight;
        }
      });

      // If an inflection point is selected, add line points
      if (selectedInflectionPoint) {
        const { a1, b1, a2, b2, formerEndTime, latterStartTime } = selectedInflectionPoint;

        // Iterate over the normalizedData and calculate the y-values for the lines formerPhaseLine and latterPhaseLine
        for (let i = 0; i < combined.length; i++) {
          const time = combined[i].time;
          let formerPhaseLine = null;
          let latterPhaseLine = null;

          // Check if the time is within the former phase
          if (time <= formerEndTime) {
            formerPhaseLine = a1 * time + b1;
          }

          // Check if the time is within the latter phase
          if (time >= latterStartTime) {
            latterPhaseLine = a2 * time + b2;
          }

          // Add the y-values to the combined data
          combined[i] = {
            ...combined[i],
            formerPhaseLine,
            latterPhaseLine,
          };
        }
      }

      setCombinedData(combined);
    };

    combineData();
  }, [normalizedData, pullMeans, selectedInflectionPoint]);

  useEffect(() => {
    // Find inflection points when 'pullMeans' changes
    const results = findInflectionPoint(pullMeans);
    setInflectionPoints(results);
    setSelectedInflectionPoint(results[0]);
  }, [pullMeans]);

  const handleInflectionPointChange = (e) => {
    const selectedIndex = e.target.value;
    if (selectedIndex !== "") {
      setSelectedInflectionPoint(inflectionPoints[selectedIndex]);
    } else {
      setSelectedInflectionPoint(null);
    }
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
      <div>
        <label>
          Select Inflection Point:
          <select onChange={handleInflectionPointChange} value={selectedInflectionPoint ? inflectionPoints.indexOf(selectedInflectionPoint) : ""}>
            <option value="">--Select--</option>
            {inflectionPoints.map((point, index) => (
              <option key={index} value={index}>
                Inflection Point {point.otWeight.toFixed(2)}kg: R² perfection = {(point.r2Sum/0.02).toFixed(1)} %
              </option>
            ))}
          </select>
        </label>
      </div>
      <ResponsiveContainer width="95%" height={400}>
        <ComposedChart data={combinedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }}
            tickFormatter={(value) => value.toFixed(0)}
          />
          <YAxis
            label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip />
          <Legend verticalAlign="top" height={36} />
          <Bar dataKey="weight" fill="#8884d8" />
          <Scatter name="Mean Weights" dataKey="meanWeight" fill="red" />
          <Line
            type="linear"
            dataKey="formerPhaseLine"
            stroke="green"
            strokeWidth={2}
            dot={false}
            name="Former Phase Line"
          />
          <Line
            type="linear"
            dataKey="latterPhaseLine"
            stroke="limegreen"
            strokeWidth={2}
            dot={false}
            name="Latter Phase Line"
          />
        </ComposedChart>
      </ResponsiveContainer>

      {selectedInflectionPoint && (
        <div style={{ margin: '20px 0', fontWeight: 'bold' }}>
          Inflection Point Value: {selectedInflectionPoint.otWeight.toFixed(2)} kg
        </div>
      )}

      <PullMeansTable pullMeans={pullMeans} />
    </div>
  );
};

export default CSVGraphApp;
