const editPanelRefetches = {};

const triggerRefetch = key => {
    const refetch = editPanelRefetches[key];
    if (!refetch) {
        return;
    }

    try {
        refetch.refetch();
    } catch (e) {
        console.error('Unexpected error during refetch', e);
    }
};

const setPreviewRefetcher = refetcherData => {
    // In content editor one preview fetcher registers for each path and language, so they build the key. The unsaved
    // values of the form change the preview query too, and stay out of the key.
    editPanelRefetches[buildPreviewRefetcherKey(refetcherData.queryParams.path, refetcherData.queryParams.language)] = refetcherData;
};

const invalidateRefetch = queryParams => delete editPanelRefetches[buildPreviewRefetcherKey(queryParams.path, queryParams.language)];

const refetchPreview = (path, language) => {
    triggerRefetch(buildPreviewRefetcherKey(path, language));
};

const buildPreviewRefetcherKey = (path, language) => {
    return `${path}_${language}`;
};

export {
    setPreviewRefetcher,
    refetchPreview,
    invalidateRefetch
};
