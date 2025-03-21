# CSVGraphApp Development Documentation

This document provides an in-depth explanation of the `CSVGraphApp` React application, its components, data flow, and core algorithms.

## Overview

`CSVGraphApp` is a React application designed to visualize and analyze time-series weight data from CSV files or predefined datasets. It allows users to:

1.  Upload CSV files in various formats (Tindeq, Grip-Connect, Generic, GripMeter).
2.  Visualize the data on an interactive graph.
3.  Calculate and display pull means.
4.  Identify inflection points in the data using linear regression.
5.  Visualize regression lines and the optimal inflection point.
6.  Adjust a threshold to filter out noise.
7.  Display a table of pull means and related statistics.

## File Structure

The application consists of the following main files:

*   **`src/CSVGraphApp.js`**: The main component that handles data loading, parsing, graph rendering, and UI interactions.
*   **`src/utils.js`**: Contains utility functions for calculating pull means and inflection points.
*   **`src/exampleData.js`**: Provides example data for demonstration purposes.
*   **`src/InfoIcon.js`**: A reusable component for displaying informational tooltips.
*   **`src/PullMeansTable.js`**: A component to display pull means data in a table.
*   **`src/CSVGraphApp.css`**: Styles for `CSVGraphApp`.
*   **`src/InfoIcon.css`**: Styles for `InfoIcon`.
*   **`src/PullMeansTable.css`**: Styles for `PullMeansTable`.
*   **`src/App.js`**: The root component that renders `CSVGraphApp`.

## Data Flow

1.  **Data Source Selection**: The user selects a data source:
    *   "Real example data" (loads from `exampleData.js`).
    *   "Synthetic data" (generates data using `generateArray()` in `exampleData.js`).
    *   "Upload CSV" (allows the user to upload a CSV file).

2.  **CSV Parsing (if applicable)**:
    *   If "Upload CSV" is selected, the application uses `FileReader` to read the file contents.
    *   `detectCSVType` determines the CSV format (Tindeq, Grip-Connect, Generic, GripMeter).
    *   The appropriate parsing function (`parseTindeqCSV`, `parseGripConnectCSV`, `parseGenericCSV`, or `parseGripMeterCSV`) is called.
    *   Each parsing function uses the `papaparse` library to parse the CSV data into an array of objects with `time` and `weight` properties.

3.  **Data Normalization**:
    *   The parsed data (or example/generated data) is normalized by subtracting the initial time from all time values. This ensures the graph starts at time 0.

4.  **Pull Mean Calculation**:
    *   `calculatePullMeans` (from `utils.js`) is called with the normalized data and a user-defined `threshold`.
    *   This function identifies individual pulls based on the threshold.
    *   It calculates the mean weight, duration, rest time, and other statistics for each pull.

5.  **Inflection Point Calculation**:
    *   `findInflectionPoint` (from `utils.js`) is called with the calculated pull means.
    *   This function iterates through possible inflection points (splitting the pull means into two phases).
    *   For each split, it performs linear regression on both phases.
    *   It calculates the R-squared value for each regression and sums them.
    *   It discards results where the former phase has a larger slope than the latter phase, or where the cross point of the two regression lines is outside the range of the data.
    *   The inflection points are sorted by the sum of R-squared values (higher is better).

6.  **Graph Rendering**:
    *   The `ResponsiveContainer` and `ComposedChart` components from `recharts` are used to render the graph.
    *   The graph displays:
        *   Raw weight data (Line).
        *   Calculated pull means (Scatter).
        *   A horizontal line representing the threshold.
        *   Regression lines for the selected inflection point (if one is selected).
        *   The optimal inflection point (OT Point) as a scatter point.

7.  **Inflection Point Selection**:
    *   A dropdown allows the user to select an inflection point.
    *   When an inflection point is selected, the corresponding regression lines and OT point are displayed on the graph.

8.  **Pull Means Table**:
    *   The `PullMeansTable` component displays the calculated pull means and related statistics in a table.
    *   It highlights durations that are considered too short.

9. **Smart Downsampling**:
    *   Before rendering the graph, the combined data (raw data, pull means, threshold, and regression lines) is downsampled.
    *   The downsampling algorithm preserves points with meanWeight and otWeight, and then samples the remaining points to reduce the total number of points to around 500. This improves rendering performance, especially for large datasets.

## Core Algorithms

### `calculatePullMeans` (in `utils.js`)

This function takes the normalized data and a threshold as input. It identifies "pulls" as contiguous sequences of data points where the weight is above the threshold. For each pull, it calculates:

*   **`meanWeight`**: The average weight during the pull.
*   **`difference`**: The difference in mean weight compared to the previous pull.
*   **`startTime`**: The time of the first data point in the pull.
*   **`endTime`**: The time of the last data point in the pull.
*   **`duration`**: The duration of the pull (`endTime` - `startTime`).
*   **`restTime`**: The time between the end of the current pull and the start of the next pull.
*   **`middleTime`**: The time at the midpoint of the pull.
*   **`increment`**: The percentage change in the difference between consecutive pulls.

### `findInflectionPoint` (in `utils.js`)

This function takes the array of pull means as input. It aims to find the "optimal" inflection point, which represents the point where the trend of the data changes significantly. It does this by:

1.  **Iterating through potential inflection points**: It loops through the pull means, considering each point as a potential dividing point between two phases (former and latter).

2.  **Linear Regression**: For each potential inflection point, it performs linear regression on the pull means before and after the point. This results in two lines: one for the former phase and one for the latter phase.  The linear regression calculates the slope (`a`), intercept (`b`), and R-squared value (`rSquared`) for each line.

3.  **Slope Check**: It checks if the slope of the former phase (a1) is greater than the slope of the latter phase (a2). If it is, the result is discarded, as we are looking for a decrease in slope.

4.  **Cross Point Check**: It calculates the intersection point (crossTime, crossWeight) of the two regression lines. It checks if this intersection point lies within the time range of the data. If not, the result is discarded.

5.  **R-squared Sum**: It calculates the sum of the R-squared values of the two regression lines (`r2Sum`). A higher `r2Sum` indicates a better fit for the two lines.

6.  **Sorting**: After iterating through all potential inflection points, the results are sorted in descending order based on `r2Sum`. The inflection point with the highest `r2Sum` is considered the "best" inflection point.

7.  **Return Value**: The function returns an array of inflection point objects, each containing:
    *   `i`: The index of the inflection point in the `pullMeans` array.
    *   `r2Sum`: The sum of the R-squared values.
    *   `r2_1`: R-squared for the former phase.
    *   `r2_2`: R-squared for the latter phase.
    *   `a1`, `b1`: Slope and intercept of the former phase line.
    *   `a2`, `b2`: Slope and intercept of the latter phase line.
    *   `otTime`: The time coordinate of the intersection point.
    *   `otWeight`: The weight coordinate of the intersection point.
    *   `formerEndTime`: The end time of the former phase.
    *   `latterStartTime`: The start time of the latter phase.

## Components

### `CSVGraphApp`

The main component responsible for the application's logic and rendering. It manages state for:

*   `dataSource`: The selected data source.
*   `data`: The parsed and normalized data.
*   `threshold`: The user-defined threshold.
*   `debouncedThreshold`: A debounced version of the threshold (to avoid frequent recalculations).
*   `selectedInflectionPoint`: The currently selected inflection point.
*   `errorMessage`: Any error messages to display.

It also handles:

*   Data source selection and CSV file uploading.
*   Data parsing and normalization.
*   Calling `calculatePullMeans` and `findInflectionPoint`.
*   Rendering the graph and pull means table.
*   Handling user interactions (threshold changes, inflection point selection).

### `InfoIcon`

A reusable component that displays an "i" icon. When clicked, it shows a modal with the provided text. The modal is positioned next to the icon and can be closed by clicking outside, pressing ESC, or clicking the close button.

### `PullMeansTable`

This component receives the `pullMeans` array as a prop and renders a table displaying the pull statistics. It also includes error handling for cases where the number of pulls is not equal to 9 and highlights durations that are below 5 seconds.

## Key Concepts

*   **Linear Regression**: A statistical method used to model the relationship between a dependent variable (weight) and one or more independent variables (time).
*   **R-squared**: A statistical measure that represents the proportion of the variance in the dependent variable that is predictable from the independent variable(s). A higher R-squared value (closer to 1) indicates a better fit of the regression line to the data.
*   **Debouncing**: A technique used to limit the rate at which a function is called. In this case, it's used to prevent frequent recalculations of pull means and inflection points when the user is adjusting the threshold.
*   **Smart Downsampling**: Reduces the number of data points for faster rendering while preserving key features like mean weights and the optimal inflection point.

This documentation provides a comprehensive overview of the `CSVGraphApp` application. For more specific details, refer to the inline comments within the code itself.
