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
import './CSVGraphApp.css';
import Papa from 'papaparse';

const CSVGraphApp = () => {
  const [dataSource, setDataSource] = useState('generateArray');
  const [data, setData] = useState(dataSource === 'exampleData' ? exampleData : generateArray());
  const [threshold, setThreshold] = useState(1.5);
  const [pullMeans, setPullMeans] = useState([]);
  const [normalizedData, setNormalizedData] = useState([]);
  const [combinedData, setCombinedData] = useState([]);
  const [inflectionPoints, setInflectionPoints] = useState([]);
  const [selectedInflectionPoint, setSelectedInflectionPoint] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (dataSource === 'exampleData') {
      setData(exampleData);
    } else if (dataSource === 'generateArray') {
      setData(generateArray());
    }
  }, [dataSource]);

  useEffect(() => {
    const minTime = Math.min(...data.map((point) => point.time));
    const normalized = data.map((point) => ({
      ...point,
      time: point.time - minTime,
    }));
    setNormalizedData(normalized);
  }, [data]);

  useEffect(() => {
    const means = calculatePullMeans(normalizedData, threshold);
    setPullMeans(means);
  }, [normalizedData, threshold]);

  useEffect(() => {
    const combineData = () => {
      let combined = normalizedData.map((point) => ({
        time: point.time,
        weight: point.weight,
        meanWeight: null,
        threshold: threshold,
      }));

      pullMeans.forEach((pull) => {
        const index = combined.findIndex((dataPoint) => dataPoint.time === pull.middleTime);
        if (index !== -1) {
          combined[index].meanWeight = pull.meanWeight;
        }
      });

      if (selectedInflectionPoint) {
        const { a1, b1, a2, b2, otTime, otWeight, formerEndTime, latterStartTime } = selectedInflectionPoint;

        for (let i = 0; i < combined.length; i++) {
          const time = combined[i].time;
          let formerPhaseLine = null;
          let latterPhaseLine = null;

          if (time <= formerEndTime) {
            formerPhaseLine = a1 * time + b1;
          }

          if (time >= latterStartTime) {
            latterPhaseLine = a2 * time + b2;
          }

          combined[i] = {
            ...combined[i],
            formerPhaseLine,
            latterPhaseLine,
          };
        }

        const otIndex = combined.findIndex((point) => point.time >= otTime);
        combined[otIndex] = {
          ...combined[otIndex],
          otWeight: otWeight,
        };
      }

      setCombinedData(combined);
    };

    combineData();
  }, [normalizedData, pullMeans, selectedInflectionPoint]);

  useEffect(() => {
    const results = findInflectionPoint(pullMeans);
    if (results.length === 0) {
      setErrorMessage('No inflection points found.');
    } else {
      setErrorMessage(null);
    }
    setInflectionPoints(results);
    setSelectedInflectionPoint(results[0]);
  }, [pullMeans]);

  useEffect(() => {
    if (uploadedFile !== null) {
      Papa.parse(uploadedFile, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          const parsedData = results.data
            .map((row) => ({
              time: parseFloat(row.time),
              weight: parseFloat(row.weight),
            }))
            .filter((row) => !isNaN(row.time) && !isNaN(row.weight));
          setData(parsedData);
        },
        error: () => {
          alert('Error parsing CSV file.');
        },
      });
    }
  }, [uploadedFile]);

  const handleInflectionPointChange = (e) => {
    const selectedIndex = e.target.value;
    if (selectedIndex !== "") {
      setSelectedInflectionPoint(inflectionPoints[selectedIndex]);
    } else {
      setSelectedInflectionPoint(null);
    }
  };

  const handleDataSourceChange = (e) => {
    setDataSource(e.target.value);
    if (e.target.value !== 'uploadCSV') {
      setUploadedFile(null);
    }
  };

  const detectCSVType = (contents) => {
    const lines = contents.split('\n');
    const firstRow = lines[0];

    if (firstRow.startsWith('date,tag,comment,unit')) {
      return 'Tindeq';
    }

    const columns = firstRow.split(',');
    if (
      columns.length === 5 &&
      !isNaN(Number(columns[0])) &&
      Number(columns[0]) > 1600000000000
    ) {
      return 'Grip-Connect';
    }

    return 'Generic';
  };

  const parseTindeqCSV = (contents) => {
    const lines = contents.split('\n');
    const processedLines = lines.slice(3).join('\n');
    let results = null;
    Papa.parse(processedLines, {
      header: true,
      dynamicTyping: true,
      complete: (pResults) => {
        results = pResults;
      }
    });
     const parsedData = results.data
      .map((row) => ({
        time: parseFloat(row.time),
        weight: parseFloat(row.weight),
      }))
      .filter((row) => !isNaN(row.time) && !isNaN(row.weight));
    return parsedData;

  };

  const parseGripConnectCSV = (contents) => {
    const lines = contents.split('\n');
      const header = 'time,weight';
      const processed = lines.map(line => {
        // Remove quotes and split by comma
        const cols = line.split(',');
        if (cols.length < 5) return line;
        const timeSec = Number(cols[0]) / 1000;
        const weight = cols[3];
        return `${timeSec},${weight}`;
      }).join('\n');

    let results = null;
    Papa.parse(`${header}\n${processed}`, {
      header: true,
      dynamicTyping: true,
      complete: (pResults) => {
        results = pResults;
      }
    });
    const parsedData = results.data
      .map((row) => ({
        time: parseFloat(row.time),
        weight: parseFloat(row.weight),
      }))
      .filter((row) => !isNaN(row.time) && !isNaN(row.weight));
    return parsedData;
  };

  const parseGenericCSV = (contents) => {
    let results = null;
     Papa.parse(contents, {
      header: true,
      dynamicTyping: true,
      complete: (pResults) => {
        results = pResults;
      },
      error: () => {
        alert('Error parsing CSV file.');
        return [];
      },
    });
    const parsedData = results.data
      .map((row) => ({
        time: parseFloat(row.time),
        weight: parseFloat(row.weight),
      }))
      .filter((row) => !isNaN(row.time) && !isNaN(row.weight));
    return parsedData;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const contents = e.target.result.replace(/"/g, '');
        const csvType = detectCSVType(contents);
        let parsedData;

        switch (csvType) {
          case 'Tindeq':
            parsedData = parseTindeqCSV(contents);
            break;
          case 'Grip-Connect':
            parsedData = parseGripConnectCSV(contents);
            break;
          case 'Generic':
            parsedData = parseGenericCSV(contents);
            break;
          default:
            alert('Unknown CSV type.');
            return;
        }
        setData(parsedData);

      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="app-container">
      <div className="controls">
        <label className="control-label">
          Data Source:
          <select className="control-select" value={dataSource} onChange={handleDataSourceChange}>
            <option value="exampleData">Real example data</option>
            <option value="generateArray">Synthetic data</option>
            <option value="uploadCSV">Upload CSV</option>
          </select>
        </label>
        {dataSource === 'uploadCSV' && (
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="control-input"
          />
        )}
      </div>
      <div className="controls">
        <label className="control-label">
          Threshold (0.5 - 10 kg):
          <input
            className="control-input"
            type="number"
            value={threshold}
            min="0.5"
            max="10"
            step="0.1"
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
          />
        </label>
      </div>
      <div className="controls">
        <label className="control-label">
          Select Inflection Point:
          <select
            className="control-select"
            onChange={handleInflectionPointChange}
            value={selectedInflectionPoint ? inflectionPoints.indexOf(selectedInflectionPoint) : ""}
          >
            <option value="">--Select--</option>
            {inflectionPoints.map((point, index) => (
              <option key={index} value={index}>
                Inflection Point {point.otWeight.toFixed(2)}kg: R² perfection = {(point.r2Sum / 0.02).toFixed(1)} %
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
          <Tooltip formatter={(value) => value.toFixed(2)} />
          <Legend verticalAlign="top" height={36} />
          <Bar dataKey="weight" fill="#8884d8" />
          <Scatter name="Mean Weights" dataKey="meanWeight" fill="red" />
          <Scatter name="OT Point" dataKey="otWeight" fill="blue" />
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
          <Line
            type="linear"
            dataKey="threshold"
            stroke="black"
            strokeWidth={1}
            dot={false}
            name="Threshold"
            strokeDasharray="5 5"
          />
        </ComposedChart>
      </ResponsiveContainer>

      {selectedInflectionPoint && (
        <div className="inflection-point">
          Inflection Point Value: {selectedInflectionPoint.otWeight.toFixed(2)} kg
        </div>
      )}

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <PullMeansTable pullMeans={pullMeans} />
    </div>
  );
};

export default CSVGraphApp;
