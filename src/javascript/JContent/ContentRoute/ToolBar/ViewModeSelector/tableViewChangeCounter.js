export const TableViewModeChangeCounter = {
    count: 0,
    modeChanged: false,
    increment: function () {
        this.count++;
        this.modeChanged = true;
    },
    resetModeChanged: function () {
        this.modeChanged = false;
    }
};
