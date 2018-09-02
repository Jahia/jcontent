package org.jahia.modules.contentmanager.actionlists;

import org.apache.commons.lang.StringUtils;
import org.jahia.data.templates.JahiaTemplatesPackage;
import org.jahia.services.render.RenderContext;
import org.jahia.services.templates.JahiaTemplateManagerService;
import org.osgi.framework.BundleContext;
import org.osgi.framework.InvalidSyntaxException;
import org.osgi.framework.ServiceReference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

public class TagFunctions {

    private static final Logger logger = LoggerFactory.getLogger(TagFunctions.class);

    static BundleContext bundleContext = null;
    static JahiaTemplateManagerService jahiaTemplateManagerService = null;

    public static void setBundleContext(BundleContext bundleContext) {
        TagFunctions.bundleContext = bundleContext;
    }

    public static void setJahiaTemplateManagerService(JahiaTemplateManagerService jahiaTemplateManagerService) {
        TagFunctions.jahiaTemplateManagerService = jahiaTemplateManagerService;
    }

    public static String generateActionLists(RenderContext renderContext) {

        Collection<ServiceReference<ActionListRenderer>> actionListRendererReferences = null;
        if (bundleContext == null) {
            logger.warn("Content Manager tag functions library not properly initialized (missing bundleContext), aborting...");
            return "";
        }

        // here we must retrieve and execute all the ActionListRenderers we find in the OSGi registry.
        try {
            actionListRendererReferences = bundleContext.getServiceReferences(ActionListRenderer.class, null);
        } catch (InvalidSyntaxException e) {
            logger.error("Error retrieving action list renderer instances from OSGi service registry", e);
            return "";
        }
        List<ActionListRenderer> actionListRenderers = new ArrayList<>();
        for (ServiceReference<ActionListRenderer> actionListRendererReference : actionListRendererReferences) {
            actionListRenderers.add(bundleContext.getService(actionListRendererReference));
        }

        StringBuilder result = new StringBuilder();

        for (ActionListRenderer actionListRenderer : actionListRenderers) {
            result.append(actionListRenderer.renderActionList(renderContext));
        }

        return result.toString();
    }

    public static String getI18nNameSpaces(RenderContext renderContext) {
        Set<String> installedModules = renderContext.getSite().getInstalledModulesWithAllDependencies();
        Set<JavascriptActionListRenderer.ActionListResource> actionListResourceList = new TreeSet<>();
        Set<String> namespaces = new LinkedHashSet<>();
        for (String siteInstalledModule : installedModules) {
            JahiaTemplatesPackage templatesPackage = jahiaTemplateManagerService.getTemplatePackageById(siteInstalledModule);
            if (templatesPackage.getBundle().getEntry("/javascript/locales") != null) {
                namespaces.add(siteInstalledModule);
            }
        }
        return "['" + StringUtils.join(namespaces, "', '") + "']";
    }
}
