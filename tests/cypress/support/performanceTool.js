
let logs = {};

export const preparePerformanceTool = () => {
    logs = {};
};

export const generateReportFile = () => {
    Object.keys(logs).forEach(key => {
        const o = logs[key];
        o.average = o.runs.reduce((acc, value) => acc + value, 0) / o.runs.length;
    });

    cy.writeFile('performanceReport.json', JSON.stringify(logs, null, 2));
};

let measurementName;
let measurementStart;

export const beginMeasurement = name => {
    measurementName = name;
    measurementStart = performance.now();
};

export const endMeasurement = () => {
    if (!logs[measurementName]) {
        logs[measurementName] = {
            runs: [],
            average: 0
        };
    }

    logs[measurementName].runs.push(performance.now() - measurementStart);
};
