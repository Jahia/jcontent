import('./ContentManagerApp')
    .then(m => {
        console.debug('%c Content Media Manager is activated', 'color: #6B5CA5');

        m.renderContentManager(
            window.cmmContext.targetId,
            window.cmmContext.nodeIdentifier,
            window.contextJsParameters
        );
    });
