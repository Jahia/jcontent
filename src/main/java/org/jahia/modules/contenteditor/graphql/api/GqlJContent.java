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
import org.jahia.api.Constants;
import org.jahia.modules.contenteditor.graphql.api.channels.GqlChannel;
import org.jahia.modules.contenteditor.graphql.api.tags.GqlTagManagerQuery;
import org.jahia.modules.contenteditor.graphql.api.types.GqlPrincipal;
import org.jahia.modules.graphql.provider.dxm.predicate.FieldEvaluator;
import org.jahia.modules.graphql.provider.dxm.predicate.FieldSorterInput;
import org.jahia.modules.graphql.provider.dxm.predicate.SorterHelper;
import org.jahia.modules.graphql.provider.dxm.relay.DXPaginatedData;
import org.jahia.modules.graphql.provider.dxm.relay.DXPaginatedDataConnectionFetcher;
import org.jahia.modules.graphql.provider.dxm.relay.PaginationHelper;
import org.jahia.services.channels.ChannelService;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.JCRSessionFactory;
import org.jahia.services.content.JCRSessionWrapper;
import org.jahia.services.sites.JahiaSitesService;

import javax.jcr.RepositoryException;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * The root class for the jContent API
 */
@GraphQLDescription("jContent API")
public class GqlJContent {

    private static final String JCONTENT_ACCESS = "jContentAccess";
    private static final String SITES_PATH = JahiaSitesService.SITES_JCR_PATH + "/";
    private static final String SYSTEM_SITE_PATH = SITES_PATH + JahiaSitesService.SYSTEM_SITE_KEY;


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
    public DXPaginatedData<GqlPrincipal> getUserSearch(
        @GraphQLName("siteKey") @GraphQLDescription("Key of the site the search runs for. The caller needs jContent access to that site. Without a key, the search runs for the system site") String siteKey,
        @GraphQLName("scopePath") @GraphQLDescription("Search scope: '/' (site + global), '/users' (global only) or '/sites/{site}/users' (site only)") String scopePath,
        @GraphQLName("searchTerm") @GraphQLDescription("Search term matched against all user properties; blank lists everything (up to the count limit)") String searchTerm,
        @GraphQLName("providers") @GraphQLDescription("Optional provider keys to restrict the search; null targets all providers") Collection<String> providers,
        @GraphQLName("fieldSorter") @GraphQLDescription("Sort by GraphQL field values") FieldSorterInput fieldSorter,
        DataFetchingEnvironment environment) {
        if (!canSearch(scopeSiteKey(scopePath, siteKey))) {
            return toPaginatedPrincipals(Collections.emptySet(), fieldSorter, environment);
        }
        String[] providerKeys = toProviderKeys(providers);
        Set<? extends JCRNodeWrapper> users = PrincipalViewHelper.getSearchResult(searchIn(searchTerm),
            resolveSiteKey(scopePath, siteKey), wrapWildcards(searchTerm), null, storedOn(providerKeys), providerKeys, includeGlobal(scopePath));
        return toPaginatedPrincipals(users, fieldSorter, environment);
    }

    @GraphQLField
    @GraphQLName("groupSearch")
    @GraphQLConnection(connectionFetcher = DXPaginatedDataConnectionFetcher.class)
    @GraphQLDescription("Search groups through Jahia group manager services. Provider-aware, unlike a raw 'SELECT * FROM [jnt:group]' query.")
    public DXPaginatedData<GqlPrincipal> getGroupSearch(
        @GraphQLName("siteKey") @GraphQLDescription("Key of the site the search runs for. The caller needs jContent access to that site. Without a key, the search runs for the system site") String siteKey,
        @GraphQLName("scopePath") @GraphQLDescription("Search scope: '/' (site + global), '/groups' (global only) or '/sites/{site}/groups' (site only)") String scopePath,
        @GraphQLName("searchTerm") @GraphQLDescription("Search term matched against all group properties; blank lists everything") String searchTerm,
        @GraphQLName("providers") @GraphQLDescription("Optional provider keys to restrict the search; null targets all providers") Collection<String> providers,
        @GraphQLName("fieldSorter") @GraphQLDescription("Sort by GraphQL field values") FieldSorterInput fieldSorter,
        DataFetchingEnvironment environment) {
        if (!canSearch(scopeSiteKey(scopePath, siteKey))) {
            return toPaginatedPrincipals(Collections.emptySet(), fieldSorter, environment);
        }
        String[] providerKeys = toProviderKeys(providers);
        Set<? extends JCRNodeWrapper> groups = PrincipalViewHelper.getGroupSearchResult(searchIn(searchTerm),
            resolveSiteKey(scopePath, siteKey), wrapWildcards(searchTerm), null, storedOn(providerKeys), providerKeys, includeGlobal(scopePath));
        return toPaginatedPrincipals(groups, fieldSorter, environment);
    }

    private static String[] toProviderKeys(Collection<String> providers) {
        return (providers == null || providers.isEmpty()) ? null : providers.toArray(new String[0]);
    }

    private static String searchIn(String searchTerm) {
        // null tells PrincipalViewHelper to list everything; "allProps" performs a full search on the term
        return (searchTerm == null || searchTerm.trim().isEmpty()) ? null : "allProps";
    }

    private static String wrapWildcards(String searchTerm) {
        // PrincipalViewHelper appends a single trailing '*', which yields prefix matching only.
        // Wrap with leading + trailing '*' so the underlying SQL2 LIKE behaves like the legacy
        // contains-style search the picker used before this endpoint existed.
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return searchTerm;
        }
        String trimmed = searchTerm.trim();
        StringBuilder sb = new StringBuilder(trimmed.length() + 2);
        if (!trimmed.startsWith("*")) {
            sb.append('*');
        }
        sb.append(trimmed);
        if (!trimmed.endsWith("*")) {
            sb.append('*');
        }
        return sb.toString();
    }

    private static String storedOn(String[] providerKeys) {
        return providerKeys == null ? "everywhere" : "providers";
    }

    private static String resolveSiteKey(String scopePath, String fallbackSiteKey) {
        if (scopePath != null && scopePath.startsWith(SITES_PATH)) {
            String[] segments = scopePath.split("/");
            if (segments.length >= 3) {
                return segments[2];
            }
        }
        // "/" means current site + global users; a bare "/users" or "/groups" means global only
        return (scopePath == null || "/".equals(scopePath)) ? fallbackSiteKey : null;
    }

    private static String scopeSiteKey(String scopePath, String siteKey) {
        return (scopePath != null && scopePath.startsWith(SITES_PATH)) ? resolveSiteKey(scopePath, null) : siteKey;
    }

    /**
     * The search is available to a caller who has jContent access to the site it runs for. Without a site, as in
     * the category manager, it is available to a caller who has jContent access to the system site or manages
     * its categories.
     */
    private static boolean canSearch(String siteKey) {
        if (siteKey == null || siteKey.isEmpty()) {
            return hasPermission(SYSTEM_SITE_PATH, JCONTENT_ACCESS) || hasPermission(SYSTEM_SITE_PATH + "/categories", "categoryManager");
        }
        return !siteKey.contains("/") && isSite(SITES_PATH + siteKey) && hasPermission(SITES_PATH + siteKey, JCONTENT_ACCESS);
    }

    private static boolean isSite(String path) {
        try {
            JCRSessionWrapper session = JCRSessionFactory.getInstance().getCurrentUserSession(Constants.EDIT_WORKSPACE);
            return session.nodeExists(path) && session.getNode(path).isNodeType("jnt:virtualsite");
        } catch (RepositoryException e) {
            // A key that is not a valid path segment names no site
            return false;
        }
    }

    private static boolean hasPermission(String path, String permission) {
        try {
            JCRSessionWrapper session = JCRSessionFactory.getInstance().getCurrentUserSession(Constants.EDIT_WORKSPACE);
            return session.nodeExists(path) && session.getNode(path).hasPermission(permission);
        } catch (RepositoryException e) {
            return false;
        }
    }

    private static boolean includeGlobal(String scopePath) {
        return scopePath == null || !scopePath.startsWith(SITES_PATH);
    }

    private static DXPaginatedData<GqlPrincipal> toPaginatedPrincipals(Set<? extends JCRNodeWrapper> principals, FieldSorterInput fieldSorter, DataFetchingEnvironment environment) {
        Stream<GqlPrincipal> stream = principals.stream().map(GqlPrincipal::new);
        if (fieldSorter != null) {
            stream = stream.sorted(SorterHelper.getFieldComparator(fieldSorter, FieldEvaluator.forConnection(environment)));
        }
        PaginationHelper.Arguments arguments = PaginationHelper.parseArguments(environment);
        return PaginationHelper.paginate(stream, principal -> PaginationHelper.encodeCursor(principal.getUuid()), arguments);
    }

    @GraphQLField
    @GraphQLName("tagManager")
    @GraphQLDescription("Tag manager queries for a site, requires the tagManager permission on the site")
    public GqlTagManagerQuery getTagManager(@GraphQLNonNull @GraphQLName("siteKey") @GraphQLDescription("The site key") String siteKey) {
        return new GqlTagManagerQuery(siteKey);
    }
}
