<%--@elvariable id="renderContext" type="org.jahia.services.render.RenderContext"--%>
<%--@elvariable id="url" type="org.jahia.services.render.URLGenerator"--%>
<%--@elvariable id="script" type="org.jahia.services.render.scripting.Script"--%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="functions" uri="http://www.jahia.org/tags/functions" %>
<%@ taglib prefix="cmFunctions" uri="http://www.jahia.org/tags/contentmanager/functions" %>
<%@ page import="org.jahia.settings.SettingsBean" %>

<c:set var="mainResourceLocale" value="${renderContext.mainResourceLocale}"/>

<html lang="${mainResourceLocale.language}" style="-webkit-font-smoothing: subpixel-antialiased!important;">

<head>
    <meta charset="utf-8">
    <title>${fn:escapeXml(renderContext.mainResource.node.displayableName)}</title>
</head>

<body style="overflow: hidden; ">
<template:addResources type="javascript" resources="polyfills.js"/>

<template:addResources type="javascript" resources="js-load.js"/>

<%--<js:loader baseExt="cmm"/>--%>

<c:set var="targetId" value="reactComponent${fn:replace(currentNode.identifier,'-','_')}"/>
<div id="${targetId}">loading..</div>
<script type="text/javascript">
    window.top.DX && window.top.DX.switch("contentmanager", {chrome: false});
    contextJsParameters['siteKey'] = '${renderContext.mainResource.node.resolveSite.name}';
    contextJsParameters['siteDisplayableName'] = '${renderContext.mainResource.node.resolveSite.displayableName}';
    contextJsParameters['urlBrowser'] = '/cms/contentmanager';
    contextJsParameters['urlbase'] = '${renderContext.servletPath}';
    contextJsParameters['langName'] = '${functions:displayLocaleNameWith(mainResourceLocale, mainResourceLocale)}';
    contextJsParameters['userName'] = '${renderContext.user.username}';
    contextJsParameters['workspace'] = '${renderContext.workspace}';
    contextJsParameters['maxUploadSize'] = parseInt("<%= SettingsBean.getInstance().getJahiaFileUploadMaxSize() %>") / (1024 * 1024);
    contextJsParameters['config'] = {
        sql2CheatSheetUrl: "<%= SettingsBean.getInstance().getString("sql2CheatSheet.link", null) %>",
        actions: [],
        academyLink: "<%= SettingsBean.getInstance().getString("contentMediaAcademyLink", "https://academy.jahia.com/documentation/modules/content-and-media-manager/1.0") %>"
    };
    contextJsParameters['i18nNamespaces'] = ${cmFunctions:getI18nNamespaces()};

    window.cmmContext = {
        targetId: '${targetId}',
        nodeIdentifier: '${currentNode.identifier}'
    };

    bootstrap(['/modules/content-media-manager/javascript/apps/cmm.bundle.js']);
</script>

${cmFunctions:generateActionLists(renderContext)}

</body>