package org.jahia.modules.contentmanager.actionlists;

import java.util.Collection;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.apache.commons.lang.StringUtils;
import org.jahia.osgi.BundleUtils;
import org.jahia.services.SpringContextSingleton;
import org.jahia.services.render.RenderContext;
import org.osgi.framework.Bundle;

public class TagFunctions {

    /**
     * Generates the list of actions for the Content and Media Manager.
     * 
     * @param renderContext current render context
     * @return a string representation of the JavaScript resources for action lists
     */
    public static String generateActionLists(RenderContext renderContext) {
        StringBuilder result = new StringBuilder();
        List<ActionListRenderer> actionListRenderers = getActionListRenderers();

        for (ActionListRenderer actionListRenderer : actionListRenderers) {
            result.append(actionListRenderer.renderActionList(renderContext));
        }

        return result.toString();
    }

    /**
     * Retrieves a list of namespaces (module names) that contain JavaScript locales.
     * 
     * @param renderContext current render context
     * @return a string representation of an array with all i18n namespaces
     */
    public static String getI18nNameSpaces(RenderContext renderContext) {
        Collection<Bundle> bundles = JavascriptActionListRenderer.getBundlesWithActionListResources();
        Set<String> namespaces = new LinkedHashSet<>();
        for (Bundle bundle : bundles) {
            if (bundle.getEntry("/javascript/locales") != null) {
                namespaces.add(BundleUtils.getModuleId(bundle));
            }
        }

        return "['" + StringUtils.join(namespaces, "', '") + "']";
    }

    @SuppressWarnings("unchecked")
    private static List<ActionListRenderer> getActionListRenderers() {
        if (SpringContextSingleton.getInstance().isInitialized()) {
            return (List<ActionListRenderer>) SpringContextSingleton
                    .getBeanInModulesContext("org.jahia.modules.contentmanager.actionListRenderers");
        }
        return Collections.emptyList();
    }
}
