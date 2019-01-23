import('./ContentManagerApp').then(m => {
    m.renderContentManager(window.cmmContext.targetId, window.cmmContext.nodeIdentifier, window.contextJsParameters);
});
