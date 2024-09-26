import React, { useState } from 'react';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Upload } from 'lucide-react';
import { YAxis } from 'recharts';
import exampleData from './exampleData';

const CSVGraphApp = () => {
  /*
  const [data, setData] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target.result;
      const lines = content.split('\n');
      const parsedData = [];

      for (let i = 1; i < lines.length; i++) {
        const [time, weight] = lines[i].split(',');
        if (time && weight) {
          parsedData.push({
            time: parseFloat(time),
            weight: parseFloat(weight)
          });
        }
      }

      setData(parsedData);
    };

    reader.readAsText(file);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">CSV Time vs Weight Graph</h1>
      <div className="mb-4">
        <label htmlFor="csv-upload" className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center">
          <Upload className="mr-2" />
          <span>Upload CSV</span>
        </label>
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
      {data.length > 0 && (
        <div className="border rounded p-4">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <CustomXAxis />
              <CustomYAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="weight" fill="#8884d8" name="Weight" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
  */

  const [data, setData] = useState(exampleData);

  return (
    <div>
      <ResponsiveContainer width="95%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" label={{ value: 'Time', position: 'insideBottom', offset: -5 }} />
          <YAxis label={{ value: 'Weight', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="weight" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CSVGraphApp;