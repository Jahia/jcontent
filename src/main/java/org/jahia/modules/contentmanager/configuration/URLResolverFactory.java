package org.jahia.modules.contentmanager.configuration;

import net.sf.ehcache.Ehcache;
import org.apache.commons.lang.StringUtils;
import org.jahia.api.Constants;
import org.jahia.exceptions.JahiaRuntimeException;
import org.jahia.registries.ServicesRegistry;
import org.jahia.services.cache.ehcache.EhCacheProvider;
import org.jahia.services.render.RenderContext;
import org.jahia.services.sites.JahiaSite;

import javax.servlet.http.HttpServletRequest;

public class URLResolverFactory extends org.jahia.services.render.URLResolverFactory {

    private Ehcache nodePathCache;
    private Ehcache siteInfoCache;

    private static final String NODE_PATH_CACHE = "urlResolverNodePath";
    private static final String SITE_INFO_CACHE = "urlResolverSiteInfo";

    private static final int CM_SERVLET_IDX = 0;
    private static final int SITE_KEY_IDX = 1;
    private static final int LANG_KEY_IDX = 2;

    private static final String TEMPLATE = "content-manager";
    private static final String TEMPLATE_TYPE = "html";


    public void setCacheService(EhCacheProvider cacheService) {
        super.setCacheService(cacheService);
        nodePathCache = cacheService.getCacheManager().addCacheIfAbsent(NODE_PATH_CACHE);
        siteInfoCache = cacheService.getCacheManager().addCacheIfAbsent(SITE_INFO_CACHE);
    }

    public URLResolver createURLResolver(String urlPathInfo, String serverName, String workspace, HttpServletRequest request) {
        return new URLResolver(convertPathinfo(urlPathInfo), serverName, workspace, request, nodePathCache, siteInfoCache);
    }

    public URLResolver createURLResolver(String urlPathInfo, String serverName, HttpServletRequest request) {
        return new URLResolver(convertPathinfo(urlPathInfo), serverName, request, nodePathCache, siteInfoCache);
    }

    public URLResolver createURLResolver(String url, RenderContext context) {
        // this constructor is only used in the render chain, not use in the content manager
        return new URLResolver(url, context, nodePathCache, siteInfoCache);
    }

    private String convertPathinfo(String pathInfo) {
        // rebuild the pathInfo with Content manager url
        String sitePath, language, servlet;
        String[] pathParts = StringUtils.split(pathInfo, "/");

        try {
            servlet =  pathParts[CM_SERVLET_IDX];
            JahiaSite jahiaSite = ServicesRegistry.getInstance().getJahiaSitesService().getSiteByKey(pathParts[SITE_KEY_IDX]);
            if (jahiaSite == null) {
                throw new Exception("unable to resolve site " + pathParts[SITE_KEY_IDX]);
            }
            sitePath = jahiaSite.getJCRLocalPath();
            language = pathParts[LANG_KEY_IDX];
        } catch (Exception e) {
            throw new JahiaRuntimeException("Couldn't resolve site key and language properly from " + pathInfo, e);
        }
        // build path
        return "/" + servlet + "/" + Constants.EDIT_WORKSPACE + "/" + language + sitePath + "." + TEMPLATE + "." + TEMPLATE_TYPE;
    }

}
