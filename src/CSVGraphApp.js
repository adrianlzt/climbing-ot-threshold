import React, { useState, useEffect, useMemo } from 'react';
import InfoIcon from './InfoIcon';
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

export const detectCSVType = (contents) => {
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

  if (firstRow.trim().toLowerCase() === 'time,weight') {
    return 'Generic';
  }

  if (firstRow.startsWith('Record description;')) {
    return 'GripMeter';
  }

  return 'Unknown'; // Added unknown type
};

export const parseTindeqCSV = (contents) => {
  return new Promise((resolve, reject) => {
    const lines = contents.split('\n');
    const processedLines = lines.slice(3).join('\n');
    Papa.parse(processedLines, {
      header: true,
      dynamicTyping: true,
      complete: (pResults) => {
        const parsedData = pResults.data
          .map((row) => ({
            time: parseFloat(row.time),
            weight: parseFloat(row.weight),
          }))
          .filter((row) => !isNaN(row.time) && !isNaN(row.weight));
        resolve(parsedData);
      },
      error: (err) => reject(err)
    });
  });

};

export const parseGripConnectCSV = (contents) => {
  return new Promise((resolve, reject) => {
    const lines = contents.replace(/"/g, '').split('\n');
    const header = 'time,weight';
    const processed = lines.map(line => {
      const cols = line.split(',');
      if (cols.length < 5) return line;
      const timeSec = Number(cols[0]) / 1000;
      const weight = cols[3];
      return `${timeSec},${weight}`;
    }).join('\n');

    Papa.parse(`${header}\n${processed}`, {
      header: true,
      dynamicTyping: true,
      complete: (pResults) => {
        const parsedData = pResults.data
          .map((row) => ({
            time: parseFloat(row.time),
            weight: parseFloat(row.weight),
          }))
          .filter((row) => !isNaN(row.time) && !isNaN(row.weight));
        resolve(parsedData);
      },
      error: (err) => reject(err)
    });
  });
};

export const parseGenericCSV = (contents) => {
  return new Promise((resolve, reject) => {
    Papa.parse(contents, {
      header: true,
      dynamicTyping: true,
      complete: (pResults) => {
        const parsedData = pResults.data
          .map((row) => ({
            time: parseFloat(row.time),
            weight: parseFloat(row.weight),
          }))
          .filter((row) => !isNaN(row.time) && !isNaN(row.weight));
        resolve(parsedData);
      },
      error: (err) => {
        reject(err);
        alert('Error parsing CSV file.');
      }
    });
  });
};

export const parseGripMeterCSV = (contents) => {
  return new Promise((resolve, reject) => {
    const lines = contents.split('\n');
    const dataStart = lines.findIndex(line => line.startsWith('Sample Number;'));
    const dataLines = lines.slice(dataStart + 1);
    const header = 'time,weight';

    const processed = dataLines.map(line => {
      const cols = line.split(';');
      if (cols.length < 3) return '';
      const timeMs = Number(cols[1].replace(',', '.'));
      const weight = cols[2].replace(',', '.');
      return `${timeMs / 1000},${weight}`;
    }).filter(line => line !== '').join('\n');

    Papa.parse(`${header}\n${processed}`, {
      header: true,
      dynamicTyping: true,
      complete: (pResults) => {
        const parsedData = pResults.data
          .map((row) => ({
            time: parseFloat(row.time),
            weight: parseFloat(row.weight),
          }))
          .filter((row) => !isNaN(row.time) && !isNaN(row.weight));
        resolve(parsedData);
      },
      error: (err) => reject(err)
    });
  });
};

const CSVGraphApp = () => {
  const [dataSource, setDataSource] = useState('generateArray');
  const [data, setData] = useState(dataSource === 'exampleData' ? exampleData : generateArray());
  const [threshold, setThreshold] = useState(1.5);
  const [debouncedThreshold, setDebouncedThreshold] = useState(1.5);
  const [selectedInflectionPoint, setSelectedInflectionPoint] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const normalizedData = useMemo(() => {
    if (!data.length) return [];
    const minTime = data[0].time;
    return data.map((point) => ({
      ...point,
      time: point.time - minTime,
    }));
  }, [data]);

  const pullMeans = useMemo(() =>
    calculatePullMeans(normalizedData, threshold),
    [normalizedData, debouncedThreshold]
  );

  const inflectionPoints = useMemo(() =>
    findInflectionPoint(pullMeans),
    [pullMeans]
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedThreshold(threshold);
    }, 2000);

    return () => {
      clearTimeout(handler);
    };
  }, [threshold]);

  useEffect(() => {
    if (dataSource === 'exampleData') {
      setData(exampleData);
    } else if (dataSource === 'generateArray') {
      setData(generateArray());
    }
  }, [dataSource]);

  useEffect(() => {
    if (inflectionPoints.length === 0) {
      setErrorMessage('No inflection points found.');
    } else {
      setErrorMessage(null);
    }
    setSelectedInflectionPoint(prev => inflectionPoints[0] || prev);
  }, [inflectionPoints]);

  const combinedData = useMemo(() => {
    let result = normalizedData.map(point => ({
      time: point.time,
      weight: point.weight,
      threshold: threshold,
      meanWeight: pullMeans.find(p => p.middleTime === point.time)?.meanWeight || null,
    }));

    if (selectedInflectionPoint) {
      const { a1, b1, a2, b2, otTime, otWeight, formerEndTime, latterStartTime } = selectedInflectionPoint;

      result.forEach(point => {
        const formerPhaseLine = point.time <= formerEndTime ? a1 * point.time + b1 : null;
        const latterPhaseLine = point.time >= latterStartTime ? a2 * point.time + b2 : null;
        point.formerPhaseLine = formerPhaseLine;
        point.latterPhaseLine = latterPhaseLine;
      });

      const otIndex = result.findIndex(point => point.time >= otTime);
      if (otIndex !== -1) {
        result[otIndex].otWeight = otWeight;
      }
    }

    // Smart downsampling: Preserve meanWeight points
    const targetSamples = 500;
    const sampleInterval = Math.max(1, Math.floor(result.length / targetSamples)); // Ensure interval is at least 1
    const sampledData = [];
    let lastSampledIndex = -Infinity; // Keep track of the last sampled index

    for (let i = 0; i < result.length; i++) {
      const hasMeanWeight = result[i].meanWeight !== null && result[i].meanWeight !== undefined;
      const isOtPoint = result[i].otWeight !== null && result[i].otWeight !== undefined;

      if (hasMeanWeight || isOtPoint || i - lastSampledIndex >= sampleInterval) {
        sampledData.push(result[i]);
        lastSampledIndex = i;
      }
    }
    // Add this return
    return sampledData;
  }, [normalizedData, pullMeans, debouncedThreshold, selectedInflectionPoint]);


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
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const contents = e.target.result.replace(/"/g, '');
          const csvType = detectCSVType(contents);
          let parsedData;
          switch (csvType) {
            case 'Tindeq':
              parsedData = await parseTindeqCSV(contents);
              break;
            case 'Grip-Connect':
              parsedData = await parseGripConnectCSV(contents);
              break;
            case 'Generic':
              parsedData = await parseGenericCSV(contents);
              break;
            case 'GripMeter':
              parsedData = await parseGripMeterCSV(contents);
              break;
            default:
              alert('Unknown CSV type.');
              return;
          }
          setData(parsedData);
        } catch (error) {
          alert('Error parsing CSV: ' + error.message);
        }

      };
      reader.readAsText(file);
    }
  };

  const maxForce = useMemo(() => {
    return data.reduce((max, point) => Math.max(max, point.weight), 0);
  }, [data]);

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
        <InfoIcon text="Select the source of your data: 'Real example data', 'Synthetic data', or upload your own CSV file." />
        {dataSource === 'uploadCSV' && (
          <>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="control-input"
            />
            <InfoIcon text="Upload a CSV file containing your data. Supported formats: Tindeq, Grip-Connect, Generic, and GripMeter." />
          </>
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
        <InfoIcon text="Set the weight threshold (in kg) for detecting individual pulls. Data points below this threshold will be ignored when calculating pull means." />
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
        <InfoIcon text="Select an inflection point from the calculated options. This will display the regression lines and OT point on the graph." />
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
          <Line
            type="linear"
            name="Weight"
            dataKey="weight"
            stroke="#8884d8"
            dot={false}
            strokeWidth={1}
            isAnimationActive={false}
          />
          <Scatter name="Mean weight" dataKey="meanWeight" fill="red" isAnimationActive={false} />
          <Scatter name="OT Point" dataKey="otWeight" fill="blue" isAnimationActive={false} />
          <Line
            type="linear"
            dataKey="formerPhaseLine"
            stroke="green"
            strokeWidth={2}
            dot={false}
            name="Former Phase Line"
            isAnimationActive={false}
          />
          <Line
            type="linear"
            dataKey="latterPhaseLine"
            stroke="limegreen"
            strokeWidth={2}
            dot={false}
            name="Latter Phase Line"
            isAnimationActive={false}
          />
          <Line
            type="linear"
            dataKey="threshold"
            stroke="black"
            strokeWidth={1}
            dot={false}
            name="Threshold"
            strokeDasharray="5 5"
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {selectedInflectionPoint && (
        <div className="inflection-point">
          Inflection Point Value: {selectedInflectionPoint.otWeight.toFixed(2)} kg ({((selectedInflectionPoint.otWeight / maxForce) * 100).toFixed(1)}% of max force)
        </div>
      )}

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <PullMeansTable pullMeans={pullMeans} />
    </div>
  );
};

export default CSVGraphApp;
