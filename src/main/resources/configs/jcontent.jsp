<%@ page import="org.jahia.settings.SettingsBean"%>
<%@ page import="org.jahia.services.modulemanager.spi.ConfigService"%>
<%@ page import="org.jahia.services.modulemanager.spi.Config"%>
<%@ page import="org.jahia.osgi.BundleUtils"%>
<%@ page language="java" contentType="text/javascript" %>
contextJsParameters.config.links['sql2CheatSheet']="<%= SettingsBean.getInstance().getString("sql2CheatSheet.link", null) %>";
contextJsParameters.config.links['importAcademy']="<%= SettingsBean.getInstance().getString("importAcademy.link", "https://academy.jahia.com/documentation/digital-experience-manager/7.3/modules/content-and-media-manager#exporting_importing_contents") %>";
<%
    ConfigService configService = BundleUtils.getOsgiService(ConfigService.class, null);
    Config automatedTagConfig = configService.getConfig("org.jahia.modules.automatedtags.service.impl.AutomatedTagServiceImpl");
    String tagImageOnUploadStr = automatedTagConfig.getRawProperties().get("automated-tags.tagImageOnUpload");
    Boolean tagImageOnUploadFlag = Boolean.valueOf(tagImageOnUploadStr);
%>
contextJsParameters.config.links['tagImageOnUpload']=<%= tagImageOnUploadFlag %>;
