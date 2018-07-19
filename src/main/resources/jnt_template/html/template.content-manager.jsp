<%--@elvariable id="renderContext" type="org.jahia.services.render.RenderContext"--%>
<%--@elvariable id="url" type="org.jahia.services.render.URLGenerator"--%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="functions" uri="http://www.jahia.org/tags/functions" %>
<c:set var="mainResourceLocale" value="${renderContext.mainResourceLocale}"/>
<html lang="${mainResourceLocale.language}">

<head>
    <meta charset="utf-8">
    <title>${fn:escapeXml(renderContext.mainResource.node.displayableName)}</title>
</head>

<body>
    <template:addResources type="javascript" resources="apps/content-manager.js" />
    <c:set var="targetId" value="reactComponent${fn:replace(currentNode.identifier,'-','_')}"/>

    <div id="${targetId}">loading..</div>
    <script type="text/javascript">
        contextJsParameters['urlBrowser'] = '/cms/contentmanager';
        contextJsParameters['urlbase'] = '${renderContext.servletPath}';
        contextJsParameters['langName'] = '${functions:displayLocaleNameWith(mainResourceLocale, mainResourceLocale)}';
        contextJsParameters['userName'] = '${renderContext.user.username}';

        reactRender('${targetId}', "${currentNode.identifier}", contextJsParameters);
    </script>
</body>