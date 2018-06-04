package org.jahia.modules.contentmanager.configuration;

import net.sf.ehcache.Ehcache;
import org.jahia.services.cache.ehcache.EhCacheProvider;
import org.jahia.services.render.RenderContext;

import javax.servlet.http.HttpServletRequest;

public class URLResolverFactory extends org.jahia.services.render.URLResolverFactory {

    private Ehcache nodePathCache;
    private Ehcache siteInfoCache;

    private static final String NODE_PATH_CACHE = "urlResolverNodePath";
    private static final String SITE_INFO_CACHE = "urlResolverSiteInfo";

    public void setCacheService(EhCacheProvider cacheService) {
        super.setCacheService(cacheService);
        nodePathCache = cacheService.getCacheManager().addCacheIfAbsent(NODE_PATH_CACHE);
        siteInfoCache = cacheService.getCacheManager().addCacheIfAbsent(SITE_INFO_CACHE);
    }

    public URLResolver createURLResolver(String urlPathInfo, String serverName, String workspace, HttpServletRequest request) {
        return new URLResolver(urlPathInfo, serverName, workspace, request, nodePathCache, siteInfoCache);
    }

    public URLResolver createURLResolver(String urlPathInfo, String serverName, HttpServletRequest request) {
        return new URLResolver(urlPathInfo, serverName, request, nodePathCache, siteInfoCache);
    }

    public URLResolver createURLResolver(String url, RenderContext context) {
        return new URLResolver(url, context, nodePathCache, siteInfoCache);
    }

}
