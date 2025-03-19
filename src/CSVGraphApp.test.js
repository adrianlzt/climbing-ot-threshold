import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CSVGraphApp from './CSVGraphApp';
import fs from 'fs';
import path from 'path';

// Helper function to create a File object
function createFile(filePath, type) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  return new File([fileContent], fileName, { type });
}

describe('CSVGraphApp CSV Parsing', () => {
  it('correctly parses tindeq_endurance.csv', async () => {
    const filePath = path.join(__dirname, 'csv_samples', 'tindeq_endurance.csv');
    const file = createFile(filePath, 'text/csv');

    render(<CSVGraphApp />);

    const fileInput = screen.getByLabelText('Data Source:');
    // Use the "uploadCSV" option
    fireEvent.change(fileInput, { target: { value: 'uploadCSV' } });

    // Upload the file
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Upload CSV/), {
        target: { files: [file] },
      });
    });

    // Check that the processed variable is correct
    const expected = `date,tag,comment,unit,duration (s),tZoneEnabled,mvc,"Target Zone, lower(% of mvc)","Target Zone, upper (% of mvc)",avg,max
2025-19-03 12:57:05,prueba,,SI,30,No,0.0,-,-,3.0098345663802712,5.391836166381836

time,weight
0.237374,2.8813068866729736
0.248806,2.8939054012298584
0.260239,2.9106285572052
0.271671,2.961560010910034
0.283099,3.0243277549743652
0.294528,3.0321288108825684
0.305956,3.0584912300109863
0.317385,3.086512565612793
0.328816,3.1189723014831543
0.340245,3.162416696548462
0.351674,3.1928141117095947
0.363104,3.2154104709625244
0.374533,3.2745914459228516
0.385962,3.351616382598877
0.397391,3.4278345108032227`;

    // Get the processed data from component state.  We need to access the
    // component's state, which is tricky with functional components.  We'll
    // check for an element that changes when data is loaded.
    const inflectionPointSelect = await screen.findByRole('combobox', { name: /Select Inflection Point/ });
    expect(inflectionPointSelect).toBeInTheDocument();

    // Spy on the setUploadedFile function
    const setUploadedFileSpy = jest.spyOn(React, 'useState');
    // Get the last call to setUploadedFile
    const lastCall = setUploadedFileSpy.mock.calls.length - 1;
    const uploadedFile = setUploadedFileSpy.mock.calls[lastCall][0];

    expect(uploadedFile).toBe(expected);
    setUploadedFileSpy.mockRestore();
  });

  it('correctly parses grip_connect.csv', async () => {
    const filePath = path.join(__dirname, 'csv_samples', 'grip_connect.csv');
    const file = createFile(filePath, 'text/csv');

    render(<CSVGraphApp />);

    const fileInput = screen.getByLabelText('Data Source:');
    // Use the "uploadCSV" option
    fireEvent.change(fileInput, { target: { value: 'uploadCSV' } });

    // Upload the file
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Upload CSV/), {
        target: { files: [file] },
      });
    });

    // Check that the processed variable is correct
    const expected = `time,weight
1742385744.025,0.0017933547496795654
1742385744.025,0.009863495826721191
1742385744.025,0.008608132600784302
1742385744.025,0.0049765706062316895
1742385744.025,0.002331376075744629
1742385744.025,-0.005245596170425415
1742385744.025,-0.006680279970169067
1742385744.025,-0.011163681745529175
1742385744.025,-0.00390055775642395
1742385744.025,-0.0012553632259368896
1742385744.025,0.009863495826721191
1742385744.025,0.009459972381591797
1742385744.025,0.003990232944488525
1742385744.025,0.013181209564208984
1742385744.025,0.013988226652145386
1742385744.247,-0.002062380313873291
1742385744.247,0.012419044971466064
1742385744.247,0.03416356444358826
1742385744.247,0.02246186137199402
1742385744.247,0
1742385744.247,0.000986337661743164
1742385744.247,0.00887712836265564
1742385744.247,0.012463867664337158
1742385744.247,0.011612027883529663
1742385744.247,0.012867361307144165
1742385744.247,0.01824745535850525
1742385744.247,0.0159609317779541
1742385744.247,0.006590604782104492`;

    // Get the processed data from component state.  We need to access the
    // component's state, which is tricky with functional components.  We'll
    // check for an element that changes when data is loaded.
    const inflectionPointSelect = await screen.findByRole('combobox', { name: /Select Inflection Point/ });
    expect(inflectionPointSelect).toBeInTheDocument();

    // Spy on the setUploadedFile function
    const setUploadedFileSpy = jest.spyOn(React, 'useState');
    // Get the last call to setUploadedFile
    const lastCall = setUploadedFileSpy.mock.calls.length - 1;
    const uploadedFile = setUploadedFileSpy.mock.calls[lastCall][0];

    expect(uploadedFile).toBe(expected);
    setUploadedFileSpy.mockRestore();
  });
});
