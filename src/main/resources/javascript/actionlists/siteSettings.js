contextJsParameters['config'].actions = Object.assign(contextJsParameters['config'].actions, {
    manageLeftMenuUsers : {
        priority : 1.0,
        component: "routerAction",
        mode: "iframe",
        modeParams : {
            labelKey : 'manage.title',
            iframeUrl : '/cms/editframe/:workspace/:lang/sites/:siteKey.manageUsers.html'
        },
        target : ["leftMenuManageActions"],
        labelKey: 'label.contentManager.leftMenu.manage.users.title'
    }
});
