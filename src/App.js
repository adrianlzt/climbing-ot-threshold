import React, { useState } from 'react';
import CSVGraphApp from './CSVGraphApp';
import InfoIcon from './InfoIcon';

function App() {
  const [showHelpModal, setShowHelpModal] = useState(false);

  const helpText = (
    <>
      <h2>How to Use the App</h2>
      <p>This app allows you to visualize and analyze data from grip strength tests.</p>

      <h3>Recording Data</h3>
      <p>
        To record data, you'll need a compatible device (e.g., Tindeq, Grip-Connect,
        GripMeter). Follow the device-specific instructions to collect your data.
        Generally, you will perform a series of maximum effort pulls, with rest
        periods in between. The device will record the force exerted over time.
      </p>

      <h3>Data Format</h3>
      <p>
        The app supports several CSV formats. It will auto-detect the format based on
        the file's header row. Supported formats include Tindeq, Grip-Connect, and
        a generic format. You can also manually select the data source.
      </p>
      <ul>
          <li><b>Tindeq</b>: date,tag,comment,unit,time,weight</li>
          <li><b>Grip-Connect</b>: No header, each line contains comma separated values. Time(ms),Status,Force(kg),Battery,Temperature</li>
          <li><b>GripMeter</b>: Header starts with 'Sample Number;'</li>
          <li><b>Generic CSV</b>: Must contain 'time' and 'weight' columns.</li>
        </ul>

      <h3>App Options</h3>
      <ul>
        <li>
          <b>Data Source</b>: Choose between generating random data, using
          example data, or uploading a CSV file.
        </li>
        <li>
          <b>Threshold</b>: Set a weight threshold (in kg) to define the start
          and end of a pull.
        </li>
        <li><b>Inflection Point</b>: Select an inflection point from the dropdown to highlight it on the graph.</li>
      </ul>

      <h3>Data Visualization</h3>
      <p>
        The graph displays force (weight) over time. Each pull is identified based on the threshold.
        The table below the graph shows the mean force for each of the 9 pulls.
        The inflection point, if selected, indicates a significant change in the force curve.
      </p>
    </>
  );

  return (
    <div className="App">
      <div style={{ position: 'absolute', top: 10, left: 10 }}>
        <InfoIcon text={helpText} />
      </div>
      <CSVGraphApp />
    </div>
  );
}

export default App;
