package org.jahia.modules.contentmanager.utils;

import java.util.Collection;
import java.util.LinkedList;
import java.util.List;

import org.jahia.osgi.FrameworkService;
import org.osgi.framework.Bundle;

public final class Utils {

    public static final String HEADER_ACTION_LIST_RESOURCES = "Jahia-ActionList-Resources";

    /**
     * Returns a collection of all active bundles, containing action list resources.
     *
     * @return a collection of all active bundles, containing action list resources; if no such bundles are found, returns an empty
     *         collection
     */
    public static Collection<Bundle> getBundlesWithActionListResources() {
        List<Bundle> bundles = new LinkedList<>();
        for (Bundle bundle : FrameworkService.getBundleContext().getBundles()) {
            if (bundle.getState() == Bundle.ACTIVE && bundle.getHeaders().get(HEADER_ACTION_LIST_RESOURCES) != null) {
                bundles.add(bundle);
            }
        }
        return bundles;
    }
}
