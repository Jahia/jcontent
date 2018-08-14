<%--@elvariable id="renderContext" type="org.jahia.services.render.RenderContext"--%>
<%--@elvariable id="url" type="org.jahia.services.render.URLGenerator"--%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="functions" uri="http://www.jahia.org/tags/functions" %>
<%@ page import="org.jahia.settings.SettingsBean" %>

<c:set var="mainResourceLocale" value="${renderContext.mainResourceLocale}"/>

<html lang="${mainResourceLocale.language}">

<head>
    <meta charset="utf-8">
    <title>${fn:escapeXml(renderContext.mainResource.node.displayableName)}</title>
</head>

<body>
<template:addResources type="javascript" resources="apps/content-manager.js"/>
<c:set var="targetId" value="reactComponent${fn:replace(currentNode.identifier,'-','_')}"/>

<div id="${targetId}">loading..</div>
<script type="text/javascript">
    contextJsParameters['urlBrowser'] = '/cms/contentmanager';
    contextJsParameters['urlbase'] = '${renderContext.servletPath}';
    contextJsParameters['langName'] = '${functions:displayLocaleNameWith(mainResourceLocale, mainResourceLocale)}';
    contextJsParameters['userName'] = '${renderContext.user.username}';
    contextJsParameters['config'] = {
        sql2CheatSheetUrl: "<%= SettingsBean.getInstance().getString("sql2CheatSheet.link", null) %>",
        actions: {
            translate: {
                priority: 2.51,
                component: "action",
                call: () => alert("Translate !!!"),
                icon: "Edit",
                target: ["previewBar"],
                requiredPermission: "",
                labelKey: 'label.contentManager.contentPreview.translate'

            },
            tableActions: {
                priority: 2.5,
                component: "menuAction",
                menuId: "tableMenuActions",
                target: ["tableActions"],
                requiredPermission: "",
                labelKey: 'label.contentManager.contentPreview.edit'
            },
            contentTreeActions: {
                priority: 2.5,
                component: "menuAction",
                menuId: "contentTreeMenuActions",
                target: ["contentTreeActions"],
                requiredPermission: "",
                labelKey: 'label.contentManager.contentPreview.edit'
            },
            edit: {
                priority: 2.5,
                target: ["previewBar", "tableMenuActions", "contentTreeMenuActions"],
                requiredPermission: "",
                labelKey: 'label.contentManager.contentPreview.edit'
            },
            publish: {
                component: "menuAction",
                menuId: "publishMenu",
                icon: "Edit",
                target: ["previewBar", "tableMenuActions"],
                requiredPermission: "",
                labelKey: 'label.contentManager.contentPreview.publish'

            },
            publishAll: {
                component: "action",
                call: () => alert('not implemented yet'),
                icon: "Edit",
                target: ["publishMenu"],
                requiredPermission: "",
                labelKey: 'label.contentManager.contentPreview.publishAll'

            },
            unPublish: {
                component: "action",
                call: () => alert('not implemented yet'),
                icon: "Edit",
                target: ["publishMenu"],
                requiredPermission: "",
                labelKey: 'label.contentManager.contentPreview.unpublish'

            },
            additionalPreview: {
                component: "menuAction",
                menuId: "additionalPreviewMenu",
                icon: "Edit",
                target: ["additionalMenu"],
                requiredPermission: "",
                iconButton: true

            },
            duplicate: {
                component: "action",
                call: () => alert('not implemented yet'),
                icon: "Edit",
                target: ["additionalPreviewMenu"],
                requiredPermission: "",
                labelKey: 'label.contentManager.contentPreview.duplicate'

            },
            copy: {
                component: "action",
                call: () => alert('not implemented yet'),
                icon: "Edit",
                target: ["additionalPreviewMenu"],
                requiredPermission: "",
                labelKey: 'label.contentManager.contentPreview.copy'

            },
            delete: {
                component: "action",
                call: () => alert('not implemented yet'),
                icon: "Edit",
                target: ["additionalPreviewMenu"],
                requiredPermission: "",
                labelKey: 'label.contentManager.contentPreview.delete'

            },
            createMenu: {
                component: "menuAction",
                menuId: "createMenuActions",
                target: ["createMenu"],
                requiredPermission: "jcr:addChildNodes",
                labelKey: 'label.contentManager.create.create',
                hideOnNodeTypes: ["jnt:page"]
            },
            createContentFolder: {
                target: ["createMenuActions", "contentTreeMenuActions"],
                requiredAllowedChildNodeTypes: ['jnt:contentFolder'],
                requiredPermission: "jcr:addChildNodes",
                labelKey: 'label.contentManager.create.contentFolder',
                hideOnNodeTypes: ["jnt:page"]
            },
            createContent: {
                target: ["createMenuActions", "contentTreeMenuActions"],
                requiredPermission: "jcr:addChildNodes",
                labelKey: 'label.contentManager.create.content',
                hideOnNodeTypes: ["jnt:page"]
            }
        }
    };


    reactRender('${targetId}', "${currentNode.identifier}", contextJsParameters);
</script>
</body>