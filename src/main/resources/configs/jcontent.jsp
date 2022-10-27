<%@ page import="org.jahia.settings.SettingsBean"%><%@ page import="org.jahia.services.modulemanager.spi.ConfigService"%><%@ page import="org.jahia.osgi.BundleUtils"%><%@ page import="org.json.JSONWriter"%><%@ page import="org.json.JSONObject"%>
    <%@ page language="java" contentType="text/javascript" %>
contextJsParameters.config.links['sql2CheatSheet']="<%= SettingsBean.getInstance().getString("sql2CheatSheet.link", null) %>";
contextJsParameters.config.links['importAcademy']="<%= SettingsBean.getInstance().getString("importAcademy.link", "https://academy.jahia.com/documentation/digital-experience-manager/7.3/modules/content-and-media-manager#exporting_importing_contents") %>";
contextJsParameters.config.jcontent = <%= new JSONObject(BundleUtils.getOsgiService(ConfigService.class, null).getConfig("org.jahia.modules.jcontent").getRawProperties()).toString() %>;
