const findInflectionPoint = (pullMeans) => {
  const linearRegression = (data) => {
    const n = data.length;
    const sumX = data.reduce((sum, point) => sum + point.middleTime, 0);
    const sumY = data.reduce((sum, point) => sum + point.meanWeight, 0);
    const sumXY = data.reduce((sum, point) => sum + point.middleTime * point.meanWeight, 0);
    const sumX2 = data.reduce((sum, point) => sum + point.middleTime * point.middleTime, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const meanY = sumY / n;
    const ssTotal = data.reduce((sum, point) => sum + Math.pow(point.meanWeight - meanY, 2), 0);
    const ssRes = data.reduce(
      (sum, point) => sum + Math.pow(point.meanWeight - (slope * point.middleTime + intercept), 2),
      0
    );
    const rSquared = 1 - ssRes / ssTotal;

    return { slope, intercept, rSquared };
  };

  let results = [];

  for (let i = 2; i < pullMeans.length - 1; i++) {
    const formerPhase = pullMeans.slice(0, i);
    const latterPhase = pullMeans.slice(i);

    const { slope: a1, intercept: b1, rSquared: r2_1 } = linearRegression(formerPhase);
    const { slope: a2, intercept: b2, rSquared: r2_2 } = linearRegression(latterPhase);

    if (a1 > a2) {
      console.log('The former phase has a larger slope than the latter phase. Discarding the result. i=', i);
      continue;
    }

    const r2Sum = r2_1 + r2_2;

    // Calculate the cross point of the two lines
    const formerEndTime = formerPhase[formerPhase.length - 1].endTime;
    const latterStartTime = latterPhase[0].startTime;
    const crossTime = (b2 - b1) / (a1 - a2);
    const crossWeight = a1 * crossTime + b1;

    // Cross point should be within the range of the measurements
    if (crossTime < formerPhase[0].startTime || crossTime > latterPhase[latterPhase.length - 1].endTime) {
      console.log('The cross point is not within the range of the two phases. Discarding the result. i=', i);
      continue;
    }

    results.push({
      i: i,
      r2Sum: r2Sum,
      r2_1: r2_1,
      r2_2: r2_2,
      a1: a1,
      b1: b1,
      a2: a2,
      b2: b2,
      otTime: crossTime,
      otWeight: crossWeight,
      formerEndTime: formerEndTime,
      latterStartTime: latterStartTime,
    });
  }

  results.sort((a, b) => b.r2Sum - a.r2Sum);

  return results;
};

const calculatePullMeans = (data, threshold) => {
  const pulls = [];
  let currentPull = [];

  data.forEach((point) => {
    if (point.weight >= threshold) {
      currentPull.push(point);
    } else {
      if (currentPull.length > 0) {
        pulls.push(currentPull);
        currentPull = [];
      }
    }
  });

  if (currentPull.length > 0) {
    pulls.push(currentPull);
  }

  const means = pulls.map((pull, index, arr) => {
    const sum = pull.reduce((acc, val) => acc + val.weight, 0);
    const mean = sum / pull.length;

    let difference = null;
    if (index > 0) {
      const previousMean =
        arr[index - 1].reduce((acc, val) => acc + val.weight, 0) / arr[index - 1].length;
      difference = mean - previousMean;
    }

    let restTime = null;
    if (index < arr.length - 1) {
      const nextPull = arr[index + 1];
      restTime = nextPull[0].time - pull[pull.length - 1].time;
    }

    return {
      pullNumber: index + 1,
      meanWeight: mean,
      difference: difference,
      startTime: pull[0].time,
      endTime: pull[pull.length - 1].time,
      duration: pull[pull.length - 1].time - pull[0].time,
      restTime: restTime,
      middleTime: pull[Math.floor(pull.length / 2)].time,
    };
  });

  for (let i = 2; i < means.length; i++) {
    const currentDifference = means[i].difference;
    const lastDifference = means[i - 1].difference;

    if (lastDifference !== 0 && lastDifference !== null && currentDifference !== null) {
      means[i].increment = ((currentDifference - lastDifference) / lastDifference) * 100;
    } else {
      means[i].increment = null;
    }
  }

  return means;
};

export { findInflectionPoint, calculatePullMeans };
