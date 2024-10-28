/*
 * MIT License
 *
 * Copyright (c) 2002 - 2022 Jahia Solutions Group. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
package org.jahia.modules.contenteditor.graphql.api;

import graphql.annotations.annotationTypes.*;
import org.jahia.modules.graphql.provider.dxm.DataFetchingException;
import org.jahia.services.cache.CacheHelper;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.JCRSessionFactory;

import javax.jcr.RepositoryException;

/**
 * The root class for the jContent mutation API
 */
@GraphQLDescription("jContent API")
public class GqlJContentMutations {


    @GraphQLField
    @GraphQLName("flushPageCache")
    @GraphQLDescription("Flushes cache for a page, checks permission and node type")
    public Boolean flushPageCache(@GraphQLName("pagePath") @GraphQLDescription("Page path") String pagePath) {
        JCRNodeWrapper node = null;

        try {
            node = JCRSessionFactory.getInstance().getCurrentUserSession().getNode(pagePath);

            if (node.hasPermission("adminCache") && node.isNodeType("jnt:page")) {
                CacheHelper.flushOutputCachesForPath(pagePath, true);
                return true;
            }
        } catch (RepositoryException e) {
            throw new DataFetchingException(e);
        }

        return false;
    }

    @GraphQLField
    @GraphQLName("flushSiteCache")
    @GraphQLDescription("Flushes cache for a site, checks permission and node type")
    public Boolean flushSiteCache(@GraphQLName("sitePath") @GraphQLDescription("Site path") String sitePath) {
        JCRNodeWrapper node = null;

        try {
            node = JCRSessionFactory.getInstance().getCurrentUserSession().getNode(sitePath);

            if (node.hasPermission("adminCache") && node.isNodeType("jnt:virtualsite")) {
                CacheHelper.flushOutputCachesForPath(sitePath, true);
                return true;
            }
        } catch (RepositoryException e) {
            throw new DataFetchingException(e);
        }

        return false;
    }
}
