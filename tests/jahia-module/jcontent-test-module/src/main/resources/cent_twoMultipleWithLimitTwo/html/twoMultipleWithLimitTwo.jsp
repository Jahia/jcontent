<%@ page language="java" contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="ui" uri="http://www.jahia.org/tags/uiComponentsLib" %>
<%@ taglib prefix="functions" uri="http://www.jahia.org/tags/functions" %>
<%@ taglib prefix="query" uri="http://www.jahia.org/tags/queryLib" %>
<%@ taglib prefix="utility" uri="http://www.jahia.org/tags/utilityLib" %>
<%@ taglib prefix="s" uri="http://www.jahia.org/tags/search" %>
<%--@elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper"--%>
<%--@elvariable id="out" type="java.io.PrintWriter"--%>
<%--@elvariable id="script" type="org.jahia.services.render.scripting.Script"--%>
<%--@elvariable id="scriptInfo" type="java.lang.String"--%>
<%--@elvariable id="workspace" type="java.lang.String"--%>
<%--@elvariable id="renderContext" type="org.jahia.services.render.RenderContext"--%>
<%--@elvariable id="currentResource" type="org.jahia.services.render.Resource"--%>
<%--@elvariable id="url" type="org.jahia.services.render.URLGenerator"--%>
twoMultipleWithLimitTwo

<c:set var="children1" value="${jcr:getChildrenOfType(currentNode, 'cent:childObject1')}"/>
<c:set var="children2" value="${jcr:getChildrenOfType(currentNode, 'cent:childObject2')}"/>

<c:if test="${renderContext.editMode}">
    <c:forEach var="child" items="${children1}">
        <template:module node="${child}"/>
    </c:forEach>
    <c:if test="${fn:length(children1) lt 3}">
        <template:module path="*" nodeTypes="cent:childObject1"/>
    </c:if>

    Children for cent:childObject2 have no limit
    <template:module path="*" nodeTypes="cent:childObject2"/>
    <c:forEach var="child2" items="${children2}">
        <template:module node="${child2}"/>
    </c:forEach>
</c:if>
