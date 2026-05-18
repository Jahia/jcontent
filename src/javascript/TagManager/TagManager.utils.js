export const getImpactedItemsCount = result => {
    const counts = result?.workspaceResults?.map(workspaceResult => workspaceResult.processedCount) || [];
    return counts.length > 0 ? Math.max(...counts) : 0;
};
