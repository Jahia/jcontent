package org.jahia.modules.contenteditor.osgi;

import org.jahia.osgi.BundleResource;
import org.jahia.services.SpringContextSingleton;
import org.jahia.services.seo.urlrewrite.UrlRewriteService;
import org.osgi.framework.Bundle;
import org.osgi.framework.BundleContext;
import org.osgi.service.cm.ConfigurationException;
import org.osgi.service.cm.ManagedService;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.springframework.core.io.Resource;

import java.net.URL;
import java.util.Dictionary;

@Component(service = {ManagedService.class, JContentConfig.class}, property = {
    "service.pid=org.jahia.modules.jcontent",
    "service.description=JContent configuration service",
    "service.vendor=Jahia Solutions Group SA"
}, immediate = true)
public class JContentConfig implements ManagedService {

    private UrlRewriteService rewriteService;
    private boolean hideLegacyPageComposer = false;
    private BundleContext bundleContext;

    public JContentConfig() {
        super();
        rewriteService = (UrlRewriteService) SpringContextSingleton.getBean("UrlRewriteService");
    }

    @Activate
    public void activate(BundleContext bundleContext) {
        this.bundleContext = bundleContext;
    }

    @Deactivate
    public void deactivate(BundleContext bundleContext) {
        rewriteService.removeConfigurationResource(getResource(bundleContext.getBundle()));
        rewriteService.getEngine();

    }

    @Override
    public void updated(Dictionary<String, ?> dictionary) throws ConfigurationException {
        hideLegacyPageComposer = dictionary == null || getBoolean(dictionary, "hideLegacyPageComposer", true);
        Resource resource = getResource(bundleContext.getBundle());
        if (hideLegacyPageComposer) {
            rewriteService.removeConfigurationResource(resource);
            rewriteService.addConfigurationResource(resource);
        } else {
            rewriteService.removeConfigurationResource(resource);
        }
        rewriteService.getEngine();
    }

    private Resource getResource(Bundle bundle) {
        URL url = bundle.getResource("META-INF/page-composer-overrideURLs.xml");
        // create associated Resource
        Resource resource = new BundleResource(url, bundle);
        return resource;
    }

    private boolean getBoolean(Dictionary<String, ?> properties, String key, boolean def) {
        if (properties.get(key) != null) {
            Object val = properties.get(key);
            if (val instanceof Boolean) {
                return (Boolean) val;
            } else if (val != null) {
                return Boolean.parseBoolean(val.toString());
            }
        }
        return def;
    }
}
