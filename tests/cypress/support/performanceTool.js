
let logs = {};

export const preparePerformanceTool = () => {
    logs = {};
};

export const generateReportFile = () => {
    Object.keys(logs).forEach(key => {
        const o = logs[key];
        o.average = o.runs.reduce((acc, value) => acc + value, 0) / o.runs.length;
    });

    cy.writeFile('results/performanceReport.json', JSON.stringify(logs, null, 2));
};

export const gatherPerformanceStats = cy => {
    cy.on('test:after:run', test => {
        if (!logs[test.title]) {
            logs[test.title] = {
                runs: [],
                average: 0
            };
        }

        logs[test.title].runs.push(test.duration);
    });
};

