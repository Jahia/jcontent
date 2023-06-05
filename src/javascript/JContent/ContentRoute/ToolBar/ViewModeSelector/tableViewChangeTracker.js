export const TableViewModeChangeTracker = {
    modeChanged: false,
    registerChange: function () {
        this.modeChanged = true;
    },
    resetChanged: function () {
        this.modeChanged = false;
    }
};
