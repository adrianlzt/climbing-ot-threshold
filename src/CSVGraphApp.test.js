import { detectCSVType, parseTindeqCSV, parseGripConnectCSV, parseGenericCSV, parseGripMeterCSV } from './CSVGraphApp'; // Adjust the import path if necessary
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

  it('should detect GripMeter CSV', () => {
    const gripMeterCSV = `Record description;BazBar;
Record date (yyyMMdd_HHmmss;20250319_123624;`;
    expect(detectCSVType(gripMeterCSV)).toBe('GripMeter');
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
  it('should correctly parse Tindeq CSV data', async () => {
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
    const parsedData = await parseTindeqCSV(tindeqCSV);
    expect(parsedData).toEqual(expectedData);
  });

  it('should handle empty csv', async () => {
    const tindeqCSV = `date,tag,comment,unit,duration (s),tZoneEnabled,mvc,"Target Zone, lower(% of mvc)","Target Zone, upper (% of mvc)",avg,max
2025-19-03 12:57:05,prueba,,SI,30,No,0.0,-,-,3.0098345663802712,5.391836166381836

time,weight`;
    const parsedData = await parseTindeqCSV(tindeqCSV);
    expect(parsedData).toEqual([]);
  });

  it('should correctly parse the contents of src/csv_samples/tindeq_endurance.csv', async () => {
    const tindeqCSV = fs.readFileSync(path.join(__dirname, 'csv_samples', 'tindeq_endurance.csv'), 'utf8');

    const expectedData = [
      { time: 0.31, weight: 3.08 },
      { time: 0.32, weight: 3.11 },
      { time: 0.34, weight: 3.16 },
    ];
    const parsedData = await parseTindeqCSV(tindeqCSV);
    expect(parsedData.slice(0, 3)).toEqual(expectedData);

  });
});

describe('parseGripConnectCSV', () => {
  it('should correctly parse Grip-Connect CSV data', async () => {
    const gripConnectCSV = `"1742385744025","54503","0","0.0017933547496795654","0.0017933547496795654"
"1742385744025","65942","0","0.009863495826721191","0.009863495826721191"
"1742385744025","77381","0","0.008608132600784302","0.008608132600784302"`;
    const expectedData = [
      { time: 1742385744.025, weight: 0.0017933547496795654 },
      { time: 1742385744.025, weight: 0.009863495826721191 },
      { time: 1742385744.025, weight: 0.008608132600784302 }
    ];
    const parsedData = await parseGripConnectCSV(gripConnectCSV);
    expect(parsedData).toEqual(expectedData);
  });

  it('should handle empty csv', async () => {
    const gripConnectCSV = '';
    const parsedData = await parseGripConnectCSV(gripConnectCSV);
    expect(parsedData).toEqual([]);
  });

  it('should correctly parse the contents of src/csv_samples/grip_connect.csv', async () => {
    const gripConnectCSV = fs.readFileSync(path.join(__dirname, 'csv_samples', 'grip_connect.csv'), 'utf8');
    const expectedData = [
      { time: 1742385744.025, weight: 0.0017933547496795654 },
      { time: 1742385744.025, weight: 0.009863495826721191 },
      { time: 1742385744.025, weight: 0.008608132600784302 }
    ];
    const parsedData = await parseGripConnectCSV(gripConnectCSV);
    expect(parsedData).toEqual(expectedData);
  });
});

describe('parseGenericCSV', () => {
  it('should correctly parse Generic CSV data', async () => {
    const genericCSV = `time,weight
0.237374,2.8813068866729736
0.248806,2.8939054012298584`;
    const expectedData = [
      { time: 0.237374, weight: 2.8813068866729736 },
      { time: 0.248806, weight: 2.8939054012298584 },
    ];
    const parsedData = await parseGenericCSV(genericCSV);
    expect(parsedData).toEqual(expectedData);
  });

  it('should handle empty csv', async () => {
    const genericCSV = `time,weight`;
    const parsedData = await parseGenericCSV(genericCSV);
    expect(parsedData).toEqual([]);
  });

  it('should correctly parse the contents of src/csv_samples/generic.csv', async () => {
    const genericCSV = fs.readFileSync(path.join(__dirname, 'csv_samples', 'generic.csv'), 'utf8');
    const expectedData = [
      { time: 0.237374, weight: 2.8813068866729736 },
      { time: 0.248806, weight: 2.8939054012298584 },
      { time: 0.260239, weight: 2.9106285572052 },
      { time: 0.271671, weight: 2.961560010910034 },
      { time: 0.283099, weight: 3.0243277549743652 },
      { time: 0.294528, weight: 3.0321288108825684 },
      { time: 0.305956, weight: 3.0584912300109863 },
      { time: 0.317385, weight: 3.086512565612793 },
      { time: 0.328816, weight: 3.1189723014831543 },
      { time: 0.340245, weight: 3.162416696548462 },
      { time: 0.351674, weight: 3.1928141117095947 },
      { time: 0.363104, weight: 3.2154104709625244 },
      { time: 0.374533, weight: 3.2745914459228516 },
      { time: 0.385962, weight: 3.351616382598877 },
      { time: 0.397391, weight: 3.4278345108032227 }
    ];
    const parsedData = await parseGenericCSV(genericCSV);
    expect(parsedData).toEqual(expectedData);
  });
});

describe('parseGripMeterCSV', () => {
  it('should correctly parse GripMeter CSV data', async () => {
    const gripMeterCSV = `Record description;BarFoo;
Record date (yyyMMdd_HHmmss;20250319_123624;
Edge size (mm);12;
Body weight: 70.0kg
Max Left: 4,46kg;5444,00ms
Max Left: 43,70N;5444,00ms
Max Left: 6,36%(BM);5444,00ms
Average Left: 2,10kg
Average Left: 3,01%(BM)
Average Left: 42,71kg·s
RFD (200ms) Left: 0,00;kg/s;X0;0;ms;Y0;0,0;kg;X1;0,0;ms;X1;0,0;kg
RFD (95%) Left: 0,8;kg/s;X0;0;ms;Y0;0,0;kg;X1;5292;ms;Y1;4,2;kg

Sample Number;Time Left(ms);Force Left(kg);Time Right(ms);Force Right(kg)
1;834,0;1,1;;;
2;837,0;2,2;;;
3;840,0;0,0;;;
4;842,0;0,0;;;
5;844,0;0,0;;;
6;845,0;0,0;;;`;

    const expectedData = [
      { time: 0.834, weight: 1.1 },
      { time: 0.837, weight: 2.2 },
      { time: 0.84, weight: 0 },
      { time: 0.842, weight: 0 },
      { time: 0.844, weight: 0 },
      { time: 0.845, weight: 0 },
    ];
    const parsedData = await parseGripMeterCSV(gripMeterCSV);
    expect(parsedData).toEqual(expectedData);
  });

  it('should handle empty CSV data', async () => {
    const gripMeterCSV = `Record description;FooBar;
Record date (yyyMMdd_HHmmss;20250319_123624;
Sample Number;Time Left(ms);Force Left(kg);Time Right(ms);Force Right(kg)`;
    const parsedData = await parseGripMeterCSV(gripMeterCSV);
    expect(parsedData).toEqual([]);
  });

  it('should correctly parse the contents of src/csv_samples/gripmeter.csv', async () => {
    const gripMeterCSV = fs.readFileSync(path.join(__dirname, 'csv_samples', 'gripmeter.csv'), 'utf8');
    const expectedData = [
      { "time": 0.835, "weight": 1.2 },
      { "time": 0.837, "weight": 2.3 },
      { "time": 0.84, "weight": 0 },
      { "time": 0.842, "weight": 0 },
      { "time": 0.844, "weight": 0 },
      { "time": 0.845, "weight": 0 }
    ];

    const parsedData = await parseGripMeterCSV(gripMeterCSV);
    expect(parsedData).toEqual(expectedData);
  });
});
