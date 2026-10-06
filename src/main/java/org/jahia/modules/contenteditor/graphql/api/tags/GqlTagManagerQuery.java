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
package org.jahia.modules.contenteditor.graphql.api.tags;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;
import graphql.annotations.annotationTypes.GraphQLNonNull;
import graphql.annotations.connection.GraphQLConnection;
import graphql.schema.DataFetchingEnvironment;
import org.jahia.api.Constants;
import org.jahia.modules.graphql.provider.dxm.DataFetchingException;
import org.jahia.modules.graphql.provider.dxm.node.GqlJcrNode;
import org.jahia.modules.graphql.provider.dxm.osgi.annotations.GraphQLOsgiService;
import org.jahia.modules.graphql.provider.dxm.relay.DXPaginatedData;
import org.jahia.modules.graphql.provider.dxm.relay.DXPaginatedDataConnectionFetcher;
import org.jahia.modules.graphql.provider.dxm.predicate.FieldSorterInput;
import org.jahia.modules.contenteditor.tags.TagManagerReadService;
import org.jahia.services.content.JCRSessionFactory;

import javax.inject.Inject;
import javax.jcr.RepositoryException;

@GraphQLName("JContentTagManager")
@GraphQLDescription("Tag manager queries for a site")
public class GqlTagManagerQuery {
    private final String siteKey;

    @Inject
    @GraphQLOsgiService
    private TagManagerReadService tagManagerReadService;

    public GqlTagManagerQuery(String siteKey) {
        this.siteKey = siteKey;
        try {
            if (!JCRSessionFactory.getInstance().getCurrentUserSession(Constants.EDIT_WORKSPACE)
                    .getNode("/sites/" + siteKey).hasPermission("tagManager")) {
                throw new DataFetchingException("Permission denied");
            }
        } catch (RepositoryException e) {
            throw new DataFetchingException(e);
        }
    }

    @GraphQLField
    @GraphQLConnection(connectionFetcher = DXPaginatedDataConnectionFetcher.class)
    @GraphQLDescription("List tags used under the site")
    public DXPaginatedData<GqlManagedTag> tags(@GraphQLName("fieldSorter") @GraphQLDescription("Sort by graphQL fields values") FieldSorterInput fieldSorter,
                                               DataFetchingEnvironment environment) {
        return tagManagerReadService.getTags(siteKey, fieldSorter, environment);
    }

    @GraphQLField
    @GraphQLConnection(connectionFetcher = DXPaginatedDataConnectionFetcher.class)
    @GraphQLDescription("List content items using a specific tag")
    public DXPaginatedData<GqlJcrNode> taggedContent(@GraphQLName("tag") @GraphQLDescription("The tag to inspect") @GraphQLNonNull String tag,
                                                     DataFetchingEnvironment environment) {
        return tagManagerReadService.getTaggedContent(siteKey, tag, environment);
    }
}
