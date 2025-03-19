import { detectCSVType } from './CSVGraphApp'; // Adjust the import path if necessary

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
