import { detectCSVType, parseTindeqCSV } from './CSVGraphApp'; // Adjust the import path if necessary
import * as fs from 'fs';
import * as path from 'path';

describe('detectCSVType', () => {
  it('should detect Tindeq CSV', () => {
    const tindeqCSV = 'date,tag,comment,unit,time,weight,speed,power\n2023-10-26 10:00:00,Tag1,Comment1,kg,0,0,0,0';
    expect(detectCSVType(tindeqCSV)).toBe('Tindeq');
  });

  it('should detect Grip-Connect CSV', () => {
    const gripConnectCSV = '1678886400000,1,2,3,4\n1678886400100,1,2,3.1,4';
    expect(detectCSVType(gripConnectCSV)).toBe('Grip-Connect');
  });

  it('should detect Generic CSV', () => {
    const genericCSV = 'time,weight\n0,20\n1,21';
    expect(detectCSVType(genericCSV)).toBe('Generic');
  });

  it('should return Unknown for invalid CSV', () => {
    const invalidCSV = 'invalid,header\n1,2';
    expect(detectCSVType(invalidCSV)).toBe('Unknown');
  });

  it('should return Unknown for empty input', () => {
    expect(detectCSVType('')).toBe('Unknown');
  });

  it('should detect Generic CSV (case-insensitive)', () => {
    const genericCSV = 'TIME,WEIGHT\n0,20\n1,21';
    expect(detectCSVType(genericCSV)).toBe('Generic');
  });
});

describe('parseTindeqCSV', () => {
  it('should correctly parse Tindeq CSV data', () => {
    const tindeqCSV = `date,tag,comment,unit,duration (s),tZoneEnabled,mvc,"Target Zone, lower(% of mvc)","Target Zone, upper (% of mvc)",avg,max
2025-19-03 12:57:05,prueba,,SI,30,No,0.0,-,-,3.0098345663802712,5.391836166381836

time,weight
0.23,2.88
0.24,2.89
0.26,2.91`;

    const expectedData = [
      { time: 0.23, weight: 2.88 },
      { time: 0.24, weight: 2.89 },
      { time: 0.26, weight: 2.91 },
    ];
    const parsedData = parseTindeqCSV(tindeqCSV);
    expect(parsedData).toEqual(expectedData);
  });

  it('should handle empty csv', () => {
    const tindeqCSV = `date,tag,comment,unit,duration (s),tZoneEnabled,mvc,"Target Zone, lower(% of mvc)","Target Zone, upper (% of mvc)",avg,max
2025-19-03 12:57:05,prueba,,SI,30,No,0.0,-,-,3.0098345663802712,5.391836166381836

time,weight`;
    const parsedData = parseTindeqCSV(tindeqCSV);
    expect(parsedData).toEqual([]);
  });

  it('should correctly parse the contents of src/csv_samples/tindeq_endurance.csv', () => {
    const tindeqCSV = fs.readFileSync(path.join(__dirname, 'csv_samples', 'tindeq_endurance.csv'), 'utf8');

    const expectedData = [
      { time: 0.31, weight: 3.08 },
      { time: 0.32, weight: 3.11 },
      { time: 0.34, weight: 3.16 },
    ];
    const parsedData = parseTindeqCSV(tindeqCSV);
    expect(parsedData).toEqual(expectedData);

  });
});
