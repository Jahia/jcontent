import {truncate} from '~/utils/truncate';

const MAX_CONTENT_NAME_LENGTH = 100;

export const getImpactedItemsCount = result => {
    const counts = result?.workspaceResults?.map(workspaceResult => workspaceResult.processedCount) || [];
    return counts.length > 0 ? Math.max(...counts) : 0;
};

export const getFailedCount = result => {
    const counts = result?.workspaceResults?.map(workspaceResult => workspaceResult.failedCount) || [];
    return counts.length > 0 ? Math.max(...counts) : 0;
};

export const getContentName = node => truncate(node?.displayName || node?.path || '', MAX_CONTENT_NAME_LENGTH);
