<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="functions" uri="http://www.jahia.org/tags/functions" %>
<html lang="${renderContext.mainResourceLocale.language}">

<head>
    <meta charset="utf-8">
    <title>${fn:escapeXml(renderContext.mainResource.node.displayableName)}</title>
</head>


<body style="margin: 0px">
    <template:addResources type="javascript" resources="app/content-manager.js" />
    <c:set var="targetId" value="reactComponent${fn:replace(currentNode.identifier,'-','_')}"/>

    <div id="${targetId}">loading..</div>
    <script type="text/javascript">
        contextJsParameters['urlbase'] = '${url.base}';
        contextJsParameters['mainResourceId'] = '${renderContext.mainResource.node.identifier}';
        contextJsParameters['mainResourcePath'] = '${renderContext.mainResource.node.path}';
        contextJsParameters['siteKey'] = '${renderContext.mainResource.node.resolveSite.name}';
        contextJsParameters['siteTitle'] = '${functions:escapeJavaScript(renderContext.site.title)}';

        reactRender('${targetId}', "${currentNode.identifier}", contextJsParameters);
    </script>
</body>


