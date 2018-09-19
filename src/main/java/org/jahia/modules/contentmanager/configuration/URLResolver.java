package org.jahia.modules.contentmanager.configuration;

import javax.servlet.http.HttpServletRequest;

import org.jahia.services.render.RenderContext;

import net.sf.ehcache.Ehcache;

/**
 * URL Resolver Wrapper to access protected method from the constructor ..
 */
class URLResolver extends org.jahia.services.render.URLResolver {

    URLResolver(String urlPathInfo, String serverName, HttpServletRequest request, Ehcache nodePathCache, Ehcache siteInfoCache) {
        super(urlPathInfo, serverName, request, nodePathCache, siteInfoCache);
    }

    URLResolver(String pathInfo, String serverName, String workspace, HttpServletRequest request, Ehcache nodePathCache, Ehcache siteInfoCache) {
        super(pathInfo, serverName, workspace, request, nodePathCache, siteInfoCache);
    }

    URLResolver(String url, RenderContext context, Ehcache nodePathCache, Ehcache siteInfoCache) {
        super(url, context, nodePathCache, siteInfoCache);
    }
}
