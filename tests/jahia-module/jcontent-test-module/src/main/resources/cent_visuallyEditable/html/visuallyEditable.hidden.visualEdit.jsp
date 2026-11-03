<%@ page language="java" contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%--@elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper"--%>
<div class="visually-editable" data-view="hidden.visualEdit">
    <h2>${fn:escapeXml(currentNode.displayableName)}</h2>
    <c:forEach items="${jcr:getChildrenOfType(currentNode, 'cent:childObject1')}" var="child">
        <template:module path="${child.path}" editable="true"/>
    </c:forEach>
    <template:module path="*"/>
</div>
