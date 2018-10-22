
let openWorkflowDashboard = (context) => window.parent.authoringApi.openWorkflowDashboard();

contextJsParameters['config'].actions = Object.assign(contextJsParameters['config'].actions, {
    contentLeftMenu: {
        priority : 1.0,
        component: "routerAction",
        mode : "browse",
        menuId: "leftMenuContentActions",
        customIcon: {name: 'content', viewBox: '0 0 512 512'},
        target: ["leftMenuActions"],
        labelKey: 'label.contentManager.leftMenu.content',
    },
    mediaLeftMenu: {
        priority : 2.0,
        component: "routerAction",
        customIcon: {name: 'media', viewBox: '0 0 512 512'},
        mode : "browse-files",
        menuId : "leftMenuMediaActions",
        target: ["leftMenuActions"],
        labelKey: 'label.contentManager.leftMenu.media',
    },
    /*
    savedSearchesLeftMenu: {
        priority : 3.0,
        component: "sideMenuAction",
        menuId : "leftMenuSavedSearchActions",
        target: ["leftMenuActions"],
        labelKey: 'label.contentManager.leftMenu.savedSearches',
    },
    */
    manageLeftMenu : {
        priority : 5.0,
        component: "sideMenuAction",
        customIcon: {name: 'manage'},
        menuId : "leftMenuManageActions",
        target : ["leftMenuActions"],
        labelKey: 'label.contentManager.leftMenu.manage.title',
        hasChildren: true
    },
    bottomLeftMenu: {
        component: "sideMenuAction",
        menuId: "bottomLeftMenuActions",
        target: ["bottomLeftMenu"],
        requiredPermission: "",
        labelKey: 'label.contentManager.bottomLeftMenu'
    },
    workflowsLeftMenu: {
        priority : 6.0,
        component: "workflowDashboardAction",
        customIcon: {name: 'workflow', viewBox: '0 0 512 512'},
        call: openWorkflowDashboard,
        requiredPermission: "",
        target: ["leftMenuBottomAction"],
        labelKey: 'label.contentManager.leftMenu.workflow'
    },
});
