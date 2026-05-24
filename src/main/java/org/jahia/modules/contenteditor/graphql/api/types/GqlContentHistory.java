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
package org.jahia.modules.contenteditor.graphql.api.types;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;
import org.jahia.modules.contenteditor.graphql.api.types.history.ContentHistoryAdapter;
import org.jahia.modules.graphql.provider.dxm.node.GqlJcrNode;
import org.jahia.modules.graphql.provider.dxm.security.GraphQLRequiresPermission;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.JCRSessionWrapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.RepositoryException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * GraphQL wrapper for content history operations.
 * Delegates to ContentHistoryAdapter which handles version-specific implementations.
 */
@GraphQLDescription("Content history information for a node")
public class GqlContentHistory {

    private static final Logger logger = LoggerFactory.getLogger(GqlContentHistory.class);

    private final JCRNodeWrapper node;
    private static final int MAX_ENTRIES  = 100;

    public GqlContentHistory(GqlJcrNode node) {
        this.node = node.getNode();
    }

    @GraphQLField
    @GraphQLRequiresPermission("viewHistoryTab")
    @GraphQLDescription("Get paginated content history entries for the node, the maximum number of returned entries is 100")
    public List<GqlContentHistoryEntry> getEntries(
            @GraphQLName("withLanguageNodes") @GraphQLDescription("Include language-specific nodes in the result (default: false)") Boolean withLanguageNodes,
            @GraphQLName("action") @GraphQLDescription("Filter entries by action (e.g., 'published', 'created', 'updated', 'deleted')") String action,
            @GraphQLName("offset") @GraphQLDescription("Number of entries to skip (default: 0)") Integer offset,
            @GraphQLName("limit") @GraphQLDescription("Maximum number of entries to return (default: 20)") Integer limit) {

        boolean withLang = withLanguageNodes != null ? withLanguageNodes : false;
        int offsetValue = offset != null ? offset : 0;
        int limitValue = limit != null ? Math.min(limit, MAX_ENTRIES) : 20;

        if (offsetValue < 0 || limitValue < 0) {
            throw new IllegalArgumentException("Offset or Limit cannot be negative");
        }

        JCRSessionWrapper session;
        try {
            session = node.getSession();
        } catch (RepositoryException e) {
            throw new RuntimeException(e);
        }

        return ContentHistoryAdapter.getHistory(node, withLang, action, offsetValue, limitValue)
                .stream()
                .map(entry -> new GqlContentHistoryEntry(entry, resolveEntryNode(session, entry.getUuid())))
                .collect(Collectors.toList());
    }

    @GraphQLField
    @GraphQLRequiresPermission("viewHistoryTab")
    @GraphQLDescription("Get total count of history entries for the node")
    public int getCount(
            @GraphQLName("withLanguageNodes") @GraphQLDescription("Include language-specific nodes in the count (default: false)") Boolean withLanguageNodes,
            @GraphQLName("action") @GraphQLDescription("Filter count by action (e.g., 'published', 'created', 'updated', 'deleted')") String action) {

        boolean withLang = withLanguageNodes != null ? withLanguageNodes : false;
        return ContentHistoryAdapter.getHistoryCount(node, withLang, action);
    }

    // Resolve the actual node targeted by an entry. With PathBasedContentHistoryAdapter,
    // entries may originate from child nodes (ACLs, vanities, j:translation_*, child content);
    // looking the node up by UUID guarantees nodeName/property-definition resolution operates
    // on the right node instead of the root context. Falls back to the root node on any failure.
    private JCRNodeWrapper resolveEntryNode(JCRSessionWrapper session, String uuid) {
        if (uuid == null || uuid.isEmpty()) {
            return node;
        }
        try {
            return session.getNodeByIdentifier(uuid);
        } catch (RepositoryException e) {
            if (logger.isDebugEnabled()) {
                logger.debug("Could not resolve entry node by uuid '{}', falling back to root context node '{}'", uuid, node.getPath(), e);
            }
            return node;
        }
    }
}
