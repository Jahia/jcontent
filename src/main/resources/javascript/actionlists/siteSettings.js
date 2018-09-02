contextJsParameters['config'].actions = Object.assign(contextJsParameters['config'].actions, {
    manageLeftMenuUsers : {
        priority : 1.0,
        component: "routerAction",
        mode: "browse-files",
        target : ["leftMenuManageActions"],
        labelKey: 'label.contentManager.leftMenu.manage.users.title'
    }
});
