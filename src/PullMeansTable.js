// PullMeansTable.js
import React from 'react';

const PullMeansTable = ({ pullMeans }) => {
  return (
    <div>
      <h1>Pull Means</h1>
      <table style={{ border: '1px solid black', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black' }}> </th>
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
                {pull.increment !== null && pull.increment !== undefined
                  ? `${pull.increment.toFixed(2)}%`
                  : ''}
              </td>
              <td style={{ border: '1px solid black' }}>{pull.duration.toFixed(2)} s</td>
              <td style={{ border: '1px solid black' }}>
                {pull.restTime !== null ? `${pull.restTime.toFixed(2)} s` : ''}
              </td>
              <td style={{ border: '1px solid black' }}>
                {pull.middleTime !== null ? pull.middleTime.toFixed(2) : ''} s
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PullMeansTable;
