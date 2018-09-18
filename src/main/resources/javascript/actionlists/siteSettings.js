contextJsParameters['config'].actions = Object.assign(contextJsParameters['config'].actions, {
    manageLeftMenuUsers : {
        priority : 1.0,
        component: "routerAction",
        mode: "iframe",
        iframeUrl : "/:context/cms/editframe/:workspace/:lang/sites/:site.manageUsers.html",
        target : ["leftMenuManageActions"],
        labelKey: 'label.contentManager.leftMenu.manage.users.title'
    }
});
