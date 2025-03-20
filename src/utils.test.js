import { findInflectionPoint } from './utils';

describe('findInflectionPoint', () => {
  it('should return an empty array if less than 4 pull means are provided', () => {
    const pullMeans = [
      { middleTime: 1, meanWeight: 10, startTime: 0, endTime: 2 },
      { middleTime: 3, meanWeight: 12, startTime: 2, endTime: 4 },
      { middleTime: 5, meanWeight: 14, startTime: 4, endTime: 6 },
    ];
    const result = findInflectionPoint(pullMeans);
    expect(result).toEqual([]);
  });

  it('should calculate the inflection point correctly for a simple case', () => {
    const pullMeans = [
      { middleTime: 1, meanWeight: 10, startTime: 0, endTime: 2 },
      { middleTime: 3, meanWeight: 12, startTime: 2, endTime: 4 },
      { middleTime: 5, meanWeight: 8, startTime: 4, endTime: 6 },
      { middleTime: 7, meanWeight: 6, startTime: 6, endTime: 8 },
    ];
    const result = findInflectionPoint(pullMeans);

    // We expect one result in this simplified scenario
    expect(result.length).toBe(1);
    expect(result[0].i).toBe(2);
    // The exact r2Sum will depend on the linear regression calculation,
    // so we'll just check if it's a number.
    expect(typeof result[0].r2Sum).toBe('number');
  });

  it('should discard results where the former phase has a larger slope', () => {
    const pullMeans = [
      { middleTime: 1, meanWeight: 6, startTime: 0, endTime: 2 },
      { middleTime: 3, meanWeight: 8, startTime: 2, endTime: 4 },
      { middleTime: 5, meanWeight: 12, startTime: 4, endTime: 6 },
      { middleTime: 7, meanWeight: 10, startTime: 6, endTime: 8 },
    ];
    const result = findInflectionPoint(pullMeans);
    // Expect no results since the first slope should be greater than the second
    expect(result).toEqual([]);
  });

  it('should discard results where the cross point is out of range', () => {
    const pullMeans = [
      { middleTime: 1, meanWeight: 10, startTime: 0, endTime: 2 },
      { middleTime: 3, meanWeight: 11, startTime: 2, endTime: 4 },
      { middleTime: 9, meanWeight: 5, startTime: 8, endTime: 10 },
      { middleTime: 11, meanWeight: 4, startTime: 10, endTime: 12 },
    ];
    const result = findInflectionPoint(pullMeans);
    // Expect no results since the cross point will be outside the range
    expect(result).toEqual([]);
  });

    it('should return multiple results and sort by r2Sum in descending order', () => {
    const pullMeans = [
      { middleTime: 1, meanWeight: 20, startTime: 0, endTime: 2 },
      { middleTime: 3, meanWeight: 18, startTime: 2, endTime: 4 },
      { middleTime: 5, meanWeight: 16, startTime: 4, endTime: 6 },
      { middleTime: 7, meanWeight: 10, startTime: 6, endTime: 8 },
      { middleTime: 9, meanWeight: 8, startTime: 8, endTime: 10 },
    ];

    const result = findInflectionPoint(pullMeans);
    expect(result.length).toBeGreaterThan(1); // Expect at least two possible inflection points

    // Check if the results are sorted by r2Sum in descending order
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].r2Sum).toBeGreaterThanOrEqual(result[i + 1].r2Sum);
    }
  });
});
