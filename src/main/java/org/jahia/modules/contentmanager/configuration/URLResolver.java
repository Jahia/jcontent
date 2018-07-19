package org.jahia.modules.contentmanager.configuration;

import net.sf.ehcache.Ehcache;
import org.apache.commons.lang.StringUtils;
import org.jahia.api.Constants;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.JCRSessionFactory;
import org.jahia.services.render.RenderContext;
import org.jahia.services.render.Resource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.RepositoryException;
import javax.servlet.http.HttpServletRequest;
import java.util.Locale;

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
