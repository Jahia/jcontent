/**
 * Tells the editor how many items a bulk action changed and how many it could not change.
 * Logs the reason of each failure in the browser console.
 */
export const notifyBulkResult = ({notificationContext, t, saved, failed}) => {
    failed.forEach(failure => console.warn('[jcontent] bulk action failed on', failure.path, failure.message));

    const message = failed.length === 0 ?
        t('jcontent:label.contentManager.bulkActions.result.saved', {count: saved.length}) :
        t('jcontent:label.contentManager.bulkActions.result.partial', {saved: saved.length, failed: failed.length});

    notificationContext.notify(message, ['closeButton'], {autoHideDuration: failed.length === 0 ? 4000 : null});
};
