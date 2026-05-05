package org.jahia.modules.visibility.actions;

import org.jahia.services.cache.CacheProvider;
import org.jahia.services.cache.ehcache.EhCacheProvider;
import org.jahia.services.content.rules.BackgroundAction;
import org.jahia.services.content.rules.FlushCacheOnNodeBackgroundAction;
import org.jahia.services.render.URLResolverFactory;
import org.jahia.services.render.filter.cache.ModuleCacheProvider;
import org.osgi.framework.BundleContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

import java.text.MessageFormat;
import java.util.Dictionary;
import java.util.Hashtable;
import java.util.List;

@Component(service = {VisibilityActionRegistrar.class}, immediate = true)
public class VisibilityActionRegistrar {

    private CacheProvider cacheProvider;

    @Reference
    public void setCacheProvider(CacheProvider cacheProvider) {
        this.cacheProvider = cacheProvider;
    }

    @Activate
    public void activate(BundleContext bundleContext) {
        List<String> actions = List.of(
            "startDateVisibilityAction",
            "endDateVisibilityAction",
            "startDayOfWeekVisibilityAction",
            "endDayOfWeekVisibilityAction",
            "startTimeOfDayVisibilityAction",
            "endTimeOfDayVisibilityAction",
            "flushVisibilityOnDeleteAll",
            "flushVisibilityOnDelete",
            "forceMatchAllConditionsVisibilityAction"
        );

        URLResolverFactory urlResolverFactory = new URLResolverFactory();
        urlResolverFactory.setCacheService((EhCacheProvider) cacheProvider);

        actions.forEach(action -> {
            FlushCacheOnNodeBackgroundAction flushCacheOnNodeBackgroundAction = getAction(action, urlResolverFactory);
            Dictionary properties = getProperties(action);
            bundleContext.registerService(BackgroundAction.class, flushCacheOnNodeBackgroundAction, properties);
        });

    }

    private static FlushCacheOnNodeBackgroundAction getAction(String action, URLResolverFactory urlResolverFactory) {
        FlushCacheOnNodeBackgroundAction flushCacheOnNodeBackgroundAction = new FlushCacheOnNodeBackgroundAction();
        flushCacheOnNodeBackgroundAction.setName(action);
        flushCacheOnNodeBackgroundAction.setCacheProvider(ModuleCacheProvider.getInstance());
        flushCacheOnNodeBackgroundAction.setUrlResolverFactory(urlResolverFactory);
        flushCacheOnNodeBackgroundAction.setEventMessage("visibilityChange");
        switch (action) {
            case "flushVisibilityOnDeleteAll":
            case "forceMatchAllConditionsVisibilityAction":
                flushCacheOnNodeBackgroundAction.setStartLevel(0);
                flushCacheOnNodeBackgroundAction.setLevelsUp(1);
                break;
            case "flushVisibilityOnDelete":
                flushCacheOnNodeBackgroundAction.setStartLevel(1);
                flushCacheOnNodeBackgroundAction.setLevelsUp(1);
                break;
            default:
                flushCacheOnNodeBackgroundAction.setStartLevel(2);
                flushCacheOnNodeBackgroundAction.setLevelsUp(1);
        }
        return flushCacheOnNodeBackgroundAction;
    }

    private static Dictionary<String, Object> getProperties(String action) {
        Dictionary<String, Object> properties = new Hashtable<>();
        properties.put("service.description", MessageFormat.format("Flushes output caches for the node and its parents when visibility changes ({0})", action));
        properties.put("service.vendor", "Jahia Solutions Group");
        properties.put("service.ranking", 100);
        properties.put("service.pid", "org.jahia.modules.jcontent.visibility.action." + action.substring(0, 1).toUpperCase() + action.substring(1));
        return properties;
    }
}
