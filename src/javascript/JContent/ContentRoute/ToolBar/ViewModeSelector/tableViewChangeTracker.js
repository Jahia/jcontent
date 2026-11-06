export const TableViewModeChangeTracker = {
    modeChanged: false,
    registerChange() {
        this.modeChanged = true;
    },
    resetChanged() {
        this.modeChanged = false;
    }
};
