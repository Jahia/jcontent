<%@ page import="org.jahia.settings.SettingsBean"%><%@ page import="org.jahia.services.modulemanager.spi.ConfigService"%><%@ page import="org.jahia.osgi.BundleUtils"%><%@ page import="org.json.JSONWriter"%><%@ page import="org.json.JSONObject"%>
    <%@ page language="java" contentType="text/javascript" %>
<%
    SettingsBean settingsBean = SettingsBean.getInstance();
%>
contextJsParameters.config.maxNameSize=<%= settingsBean.getMaxNameSize() %>;
contextJsParameters.config.wip="<%= settingsBean.getString("wip.link", "https://academy.jahia.com/documentation/enduser/jahia/8/authoring-content-in-jahia/using-content-editor/understanding-work-in-progress-content")%>";
contextJsParameters.config.links['sql2CheatSheet']="<%= settingsBean.getString("sql2CheatSheet.link", null) %>";
contextJsParameters.config.links['importAcademy']="<%= settingsBean.getString("importAcademy.link", "https://academy.jahia.com/documentation/digital-experience-manager/7.3/modules/content-and-media-manager#exporting_importing_contents") %>";
contextJsParameters.config.defaultSynchronizeNameWithTitle=<%= settingsBean.getString("jahia.ui.contentTab.defaultSynchronizeNameWithTitle", "true") %>;
contextJsParameters.config.jcontent = <%= new JSONObject(BundleUtils.getOsgiService(ConfigService.class, null).getConfig("org.jahia.modules.jcontent").getRawProperties()).toString() %>;
