contextJsParameters['config'].actions = Object.assign(contextJsParameters['config'].actions, {
    groups : {
        priority : 10.0,
        component: "routerAction",
        mode: "apps",
        iframeUrl : ":context/cms/:frame/:workspace/:lang/sites/:site.manageGroups.html",
        target : ["leftMenuManageActions"],
        requiredPermission: "siteAdminGroups",
        labelKey: 'label.contentManager.leftMenu.manage.groups.title',
        icon: 'users'
    },
    languages : {
        priority : 20.0,
        component: "routerAction",
        mode: "apps",
        iframeUrl : ":context/cms/:frame/:workspace/:lang/sites/:site.manageLanguages.html",
        target : ["leftMenuManageActions"],
        requiredPermission: "siteAdminLanguages",
        labelKey: 'label.contentManager.leftMenu.manage.languages.title',
        icon: 'globe'
    },
    roles : {
        priority : 30.0,
        component: "routerAction",
        mode: "apps",
        iframeUrl : ":context/cms/:frame/:workspace/:lang/sites/:site.manageSiteRoles.html",
        target : ["leftMenuManageActions"],
        requiredPermission: "siteAdminSiteRoles",
        labelKey: 'label.contentManager.leftMenu.manage.roles.title',
        icon: 'user-shield'
    },
    users : {
        priority : 40.0,
        component: "routerAction",
        mode: "apps",
        iframeUrl : ":context/cms/:frame/:workspace/:lang/sites/:site.manageUsers.html",
        target : ["leftMenuManageActions"],
        requiredPermission: "siteAdminUsers",
        labelKey: 'label.contentManager.leftMenu.manage.users.title',
        icon: 'user'
    },
    tags : {
        priority : 50.0,
        component: "routerAction",
        mode: "apps",
        iframeUrl : ":context/cms/:frame/:workspace/:lang/sites/:site.tagsManager.html",
        target : ["leftMenuManageActions"],
        requiredPermission: "tagManager",
        labelKey: 'label.contentManager.leftMenu.manage.tags.title',
        icon: 'tags'
    }
});
