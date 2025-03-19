// PullMeansTable.js
import React from 'react';
import './PullMeansTable.css';

const PullMeansTable = ({ pullMeans }) => {
  const isPullCountInvalid = pullMeans.length !== 9;

  return (
    <div>
      <h1>Pull info</h1>
      {isPullCountInvalid && (
        <div className="error-message">
          Error: The number of pulls must be exactly 9.
        </div>
      )}
      <table className="pull-means-table">
        <thead>
          <tr>
            <th></th>
            <th>Mean weight</th>
            <th>Difference between last pull</th>
            <th>Increment of the differences</th>
            <th>Duration</th>
            <th>Rest Time</th>
            <th>Middle Time</th>
          </tr>
        </thead>
        <tbody>
          {pullMeans.map((pull) => {
            const isDurationLow = pull.duration < 5;
            return (
              <tr key={pull.pullNumber}>
                <td>{`Pull ${pull.pullNumber}`}</td>
                <td>{pull.meanWeight.toFixed(2)}</td>
                <td>
                  {pull.difference !== null ? pull.difference.toFixed(2) : ''}
                </td>
                <td>
                  {pull.increment !== null && pull.increment !== undefined
                    ? `${pull.increment.toFixed(2)}%`
                    : ''}
                </td>
                <td
                  className={isDurationLow ? 'red-cell' : ''}
                  title={isDurationLow ? 'Too small, expected around 9s. Consider increasing the threshold value.' : ''}
                >
                  {pull.duration.toFixed(2)} s
                </td>
                <td>
                  {pull.restTime !== null ? `${pull.restTime.toFixed(2)} s` : ''}
                </td>
                <td>
                  {pull.middleTime !== null ? pull.middleTime.toFixed(2) : ''} s
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PullMeansTable;
