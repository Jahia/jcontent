/*
 * ==========================================================================================
 * =                   JAHIA'S DUAL LICENSING - IMPORTANT INFORMATION                       =
 * ==========================================================================================
 *
 *                                 http://www.jahia.com
 *
 *     Copyright (C) 2002-2019 Jahia Solutions Group SA. All rights reserved.
 *
 *     THIS FILE IS AVAILABLE UNDER TWO DIFFERENT LICENSES:
 *     1/GPL OR 2/JSEL
 *
 *     1/ GPL
 *     ==================================================================================
 *
 *     IF YOU DECIDE TO CHOOSE THE GPL LICENSE, YOU MUST COMPLY WITH THE FOLLOWING TERMS:
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 *
 *     2/ JSEL - Commercial and Supported Versions of the program
 *     ===================================================================================
 *
 *     IF YOU DECIDE TO CHOOSE THE JSEL LICENSE, YOU MUST COMPLY WITH THE FOLLOWING TERMS:
 *
 *     Alternatively, commercial and supported versions of the program - also known as
 *     Enterprise Distributions - must be used in accordance with the terms and conditions
 *     contained in a separate written agreement between you and Jahia Solutions Group SA.
 *
 *     If you are unsure which license is appropriate for your use,
 *     please contact the sales department at sales@jahia.com.
 */
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

/**
 * Content Manager URL Resolver Factory that transforms the CM URL to a valid DX url
 * Transforms /contentmanager/[siteKey]/[lang]/[browse | search | ..]/[path] to
 * /contentmanager/default/[lang]/[siteKey].content-manager.html
 */
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
