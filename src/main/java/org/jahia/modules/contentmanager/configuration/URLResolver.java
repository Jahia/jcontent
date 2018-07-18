package org.jahia.modules.contentmanager.configuration;

import net.sf.ehcache.Ehcache;
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

public class URLResolver extends org.jahia.services.render.URLResolver {

    private static Logger logger = LoggerFactory.getLogger(URLResolver.class);

    private static final String SYSTEM_SITE_PATH = "/sites/systemsite";

    private String sitePath = SYSTEM_SITE_PATH;
    private Locale locale;

    public URLResolver(String urlPathInfo, String serverName, HttpServletRequest request, Ehcache nodePathCache, Ehcache siteInfoCache) {
        super(urlPathInfo, serverName, request, nodePathCache, siteInfoCache);
        initResolver();
    }

    public URLResolver(String pathInfo, String serverName, String workspace, HttpServletRequest request, Ehcache nodePathCache, Ehcache siteInfoCache) {
        super(pathInfo, serverName, workspace, request, nodePathCache, siteInfoCache);
        initResolver();
    }

    public URLResolver(String url, RenderContext context, Ehcache nodePathCache, Ehcache siteInfoCache) {
        super(url, context, nodePathCache, siteInfoCache);
        initResolver();
    }

    private void initResolver() {
        String[] pathParts = getPath().split("/");
        if (pathParts.length > 1) {
            sitePath = "/sites/" + pathParts[1];
        } else {
            logger.warn("Couldn't resolve site key properly, defaulting to system site");
        }
        if (pathParts.length > 2) {
            locale = verifyLanguage(pathParts[2]);
        }
    }

    @Override
    public Locale getLocale() {
        if (locale == null) {
            return super.getLocale();
        } else {
            return locale;
        }
    }

    @Override
    public JCRNodeWrapper resolveNode(String workspace, Locale locale, String path) throws RepositoryException {
        return JCRSessionFactory.getInstance().getCurrentUserSession(workspace,locale).getNode(path);
    }

    @Override
    protected Resource resolveResource(String workspace, Locale locale, String path) throws RepositoryException {
        // remove mode from the path
        return new Resource(resolveNode(Constants.EDIT_WORKSPACE, Locale.ENGLISH, sitePath), "html", "default", Resource.CONFIGURATION_PAGE);
    }
}
