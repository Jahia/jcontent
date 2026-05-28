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
import graphql.annotations.connection.GraphQLConnection;
import graphql.schema.DataFetchingEnvironment;
import org.jahia.ajax.gwt.helper.DiffHelper;
import org.jahia.data.viewhelper.principal.PrincipalViewHelper;
import org.jahia.modules.contenteditor.graphql.api.channels.GqlChannel;
import org.jahia.modules.graphql.provider.dxm.DataFetchingException;
import org.jahia.modules.graphql.provider.dxm.node.GqlJcrNode;
import org.jahia.modules.graphql.provider.dxm.node.SpecializedTypesHandler;
import org.jahia.modules.graphql.provider.dxm.predicate.FieldEvaluator;
import org.jahia.modules.graphql.provider.dxm.predicate.FieldSorterInput;
import org.jahia.modules.graphql.provider.dxm.predicate.SorterHelper;
import org.jahia.modules.graphql.provider.dxm.relay.DXPaginatedData;
import org.jahia.modules.graphql.provider.dxm.relay.DXPaginatedDataConnectionFetcher;
import org.jahia.modules.graphql.provider.dxm.relay.PaginationHelper;
import org.jahia.services.channels.ChannelService;
import org.jahia.services.content.JCRNodeWrapper;

import javax.jcr.RepositoryException;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * The root class for the jContent API
 */
@GraphQLDescription("jContent API")
public class GqlJContent {


    @GraphQLField
    @GraphQLName("diffHtml")
    @GraphQLDescription("Returns html with marked differences")
    public String getDiffHtml(
        @GraphQLName("originalHtml") @GraphQLDescription("Original html") String originalHtml,
        @GraphQLName("newHtml") @GraphQLDescription("New html") String newHtml) {
        return new DiffHelper().getHighlighted(originalHtml, newHtml);
    }

    @GraphQLField
    @GraphQLName("channels")
    @GraphQLDescription("Returns all available channels")
    public List<GqlChannel> getChannels(

    ) {
        List<String> channels = ChannelService.getInstance().getAllChannels();
        return channels.stream().map(GqlChannel::new).collect(Collectors.toList());
    }

    @GraphQLField
    @GraphQLName("userSearch")
    @GraphQLConnection(connectionFetcher = DXPaginatedDataConnectionFetcher.class)
    @GraphQLDescription("Search users through Jahia user manager services. Provider-aware (incl. LDAP) and bounded by the configured jahiaJCRUserCountLimit, unlike a raw 'SELECT * FROM [jnt:user]' query.")
    public DXPaginatedData<GqlJcrNode> getUserSearch(
        @GraphQLName("siteKey") @GraphQLDescription("Site key used to resolve site-scoped users") String siteKey,
        @GraphQLName("scopePath") @GraphQLDescription("Search scope: '/' (site + global), '/users' (global only) or '/sites/{site}/users' (site only)") String scopePath,
        @GraphQLName("searchTerm") @GraphQLDescription("Search term matched against all user properties; blank lists everything (up to the count limit)") String searchTerm,
        @GraphQLName("providers") @GraphQLDescription("Optional provider keys to restrict the search; null targets all providers") Collection<String> providers,
        @GraphQLName("fieldSorter") @GraphQLDescription("Sort by GraphQL field values") FieldSorterInput fieldSorter,
        DataFetchingEnvironment environment) {
        String[] providerKeys = toProviderKeys(providers);
        Set<? extends JCRNodeWrapper> users = PrincipalViewHelper.getSearchResult(searchIn(searchTerm),
            resolveSiteKey(scopePath, siteKey), searchTerm, null, storedOn(providerKeys), providerKeys, includeGlobal(scopePath));
        return toPaginatedNodes(users, fieldSorter, environment);
    }

    @GraphQLField
    @GraphQLName("groupSearch")
    @GraphQLConnection(connectionFetcher = DXPaginatedDataConnectionFetcher.class)
    @GraphQLDescription("Search groups through Jahia group manager services. Provider-aware, unlike a raw 'SELECT * FROM [jnt:group]' query.")
    public DXPaginatedData<GqlJcrNode> getGroupSearch(
        @GraphQLName("siteKey") @GraphQLDescription("Site key used to resolve site-scoped groups") String siteKey,
        @GraphQLName("scopePath") @GraphQLDescription("Search scope: '/' (site + global), '/groups' (global only) or '/sites/{site}/groups' (site only)") String scopePath,
        @GraphQLName("searchTerm") @GraphQLDescription("Search term matched against all group properties; blank lists everything") String searchTerm,
        @GraphQLName("providers") @GraphQLDescription("Optional provider keys to restrict the search; null targets all providers") Collection<String> providers,
        @GraphQLName("fieldSorter") @GraphQLDescription("Sort by GraphQL field values") FieldSorterInput fieldSorter,
        DataFetchingEnvironment environment) {
        String[] providerKeys = toProviderKeys(providers);
        Set<? extends JCRNodeWrapper> groups = PrincipalViewHelper.getGroupSearchResult(searchIn(searchTerm),
            resolveSiteKey(scopePath, siteKey), searchTerm, null, storedOn(providerKeys), providerKeys, includeGlobal(scopePath));
        return toPaginatedNodes(groups, fieldSorter, environment);
    }

    private static String[] toProviderKeys(Collection<String> providers) {
        return (providers == null || providers.isEmpty()) ? null : providers.toArray(new String[0]);
    }

    private static String searchIn(String searchTerm) {
        // null tells PrincipalViewHelper to list everything; "allProps" performs a full search on the term
        return (searchTerm == null || searchTerm.trim().isEmpty()) ? null : "allProps";
    }

    private static String storedOn(String[] providerKeys) {
        return providerKeys == null ? "everywhere" : "providers";
    }

    private static String resolveSiteKey(String scopePath, String fallbackSiteKey) {
        if (scopePath != null && scopePath.startsWith("/sites/")) {
            String[] segments = scopePath.split("/");
            if (segments.length >= 3) {
                return segments[2];
            }
        }
        // "/" means current site + global users; a bare "/users" or "/groups" means global only
        return (scopePath == null || "/".equals(scopePath)) ? fallbackSiteKey : null;
    }

    private static boolean includeGlobal(String scopePath) {
        return scopePath == null || !scopePath.startsWith("/sites/");
    }

    private static DXPaginatedData<GqlJcrNode> toPaginatedNodes(Set<? extends JCRNodeWrapper> principals, FieldSorterInput fieldSorter, DataFetchingEnvironment environment) {
        Stream<GqlJcrNode> stream = principals.stream().map(node -> {
            try {
                return SpecializedTypesHandler.getNode(node);
            } catch (RepositoryException e) {
                throw new DataFetchingException(e);
            }
        });
        if (fieldSorter != null) {
            stream = stream.sorted(SorterHelper.getFieldComparator(fieldSorter, FieldEvaluator.forConnection(environment)));
        }
        PaginationHelper.Arguments arguments = PaginationHelper.parseArguments(environment);
        return PaginationHelper.paginate(stream, node -> PaginationHelper.encodeCursor(node.getUuid()), arguments);
    }

}
