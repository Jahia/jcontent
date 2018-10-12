
let openWorkflowDashboard = (context) => window.parent.authoringApi.openWorkflowDashboard();

contextJsParameters['config'].actions = Object.assign(contextJsParameters['config'].actions, {
    contentLeftMenu: {
        priority : 1.0,
        component: "routerAction",
        mode : "browse",
        menuId: "leftMenuContentActions",
        target: ["leftMenuActions"],
        labelKey: 'label.contentManager.leftMenu.content',
    },
    mediaLeftMenu: {
        priority : 2.0,
        component: "routerAction",
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
        call: openWorkflowDashboard,
        requiredPermission: "",
        target: ["leftMenuBottomAction"],
        labelKey: 'label.contentManager.leftMenu.workflow'
    },
});
