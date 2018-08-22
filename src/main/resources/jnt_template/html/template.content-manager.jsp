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
            // Any action configuration can be overriden here, for example:
            /*
            createMenu: {
                component: "menuAction",
                menuId: "createMenuActions",
                target: ["createMenu"],
                requiredPermission: "jcr:addChildNodes",
                labelKey: 'label.contentManager.create.create',
                hideOnNodeTypes: ["jnt:page"]
            },
            createContentFolder: {
                priority: 3,
                target: ["createMenuActions", "contentTreeMenuActions"],
                requiredAllowedChildNodeType: 'jnt:contentFolder',
                requiredPermission: "jcr:addChildNodes",
                labelKey: 'label.contentManager.create.contentFolder',
                hideOnNodeTypes: ["jnt:page"]
            },
            createContent: {
                priority: 3.1,
                target: ["createMenuActions", "contentTreeMenuActions"],
                requiredPermission: "jcr:addChildNodes",
                labelKey: 'label.contentManager.create.content',
                hideOnNodeTypes: ["jnt:page", "jnt:folder"]
            }
            */
        }
    };

    reactRender('${targetId}', "${currentNode.identifier}", contextJsParameters);
</script>
</body>