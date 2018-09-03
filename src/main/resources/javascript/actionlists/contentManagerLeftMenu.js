contextJsParameters['config'].actions = Object.assign(contextJsParameters['config'].actions, {
    contentLeftMenu: {
        priority : 1.0,
        component: "routerAction",
        mode : "browse",
        modeParams : {
            labelKey : "content"
        },
        menuId: "leftMenuContentActions",
        target: ["leftMenuActions"],
        labelKey: 'label.contentManager.leftMenu.content',
    },
    mediaLeftMenu: {
        priority : 2.0,
        component: "routerAction",
        mode : "browse-files",
        modeParams : {
            labelKey : "media"
        },
        menuId : "leftMenuMediaActions",
        target: ["leftMenuActions"],
        labelKey: 'label.contentManager.leftMenu.media',
    },
    contentReportsLeftMenu : {
        priority : 4.0,
        component: "sideMenuAction",
        menuId : "leftMenuContentReportsActions",
        target: ["leftMenuActions"],
        labelKey: 'label.contentManager.leftMenu.contentReports'
    },
    manageLeftMenu : {
        priority : 5.0,
        component: "sideMenuAction",
        menuId : "leftMenuManageActions",
        target : ["leftMenuActions"],
        labelKey: 'label.contentManager.leftMenu.manage.title'
    },
    bottomLeftMenu: {
        component: "sideMenuAction",
        menuId: "bottomLeftMenuActions",
        target: ["bottomLeftMenu"],
        requiredPermission: "",
        labelKey: 'label.contentManager.bottomLeftMenu',
    },

});
