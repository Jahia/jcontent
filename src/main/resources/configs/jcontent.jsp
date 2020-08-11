<%@ page import="org.jahia.settings.SettingsBean"%><%@ page language="java" contentType="text/javascript" %>
contextJsParameters.config.links['sql2CheatSheet']="<%= SettingsBean.getInstance().getString("sql2CheatSheet.link", null) %>";
contextJsParameters.config.links['importAcademy']="<%= SettingsBean.getInstance().getString("importAcademy.link", "https://academy.jahia.com/documentation/digital-experience-manager/7.3/modules/content-and-media-manager#exporting_importing_contents") %>";
