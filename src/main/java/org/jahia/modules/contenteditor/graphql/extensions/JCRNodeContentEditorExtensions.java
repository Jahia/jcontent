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
package org.jahia.modules.contenteditor.graphql.extensions;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;
import graphql.annotations.annotationTypes.GraphQLNonNull;
import graphql.annotations.annotationTypes.GraphQLTypeExtension;
import org.jahia.modules.contenteditor.graphql.api.types.GqlContentHistory;
import org.jahia.modules.graphql.provider.dxm.DataFetchingException;
import org.jahia.modules.graphql.provider.dxm.node.GqlJcrNode;
import org.jahia.services.content.JCRCallback;
import org.jahia.services.content.JCRContentUtils;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.JCRSessionWrapper;
import org.jahia.services.content.JCRTemplate;
import org.jahia.services.content.nodetypes.ExtendedNodeType;
import org.jahia.services.content.nodetypes.NodeTypeRegistry;
import org.jahia.utils.LanguageCodeConverters;

import javax.jcr.AccessDeniedException;
import javax.jcr.RepositoryException;
import java.util.List;

/**
 * Content Editor JCR Node extension
 */
@GraphQLTypeExtension(GqlJcrNode.class)
public class JCRNodeContentEditorExtensions {

    private GqlJcrNode node;

    public JCRNodeContentEditorExtensions(GqlJcrNode node) {
        this.node = node;
    }

    @GraphQLField
    @GraphQLDescription("Returns edit lock status of the current node object")
    public boolean isLockedAndCannotBeEdited() {
        try {
            return JCRContentUtils.isLockedAndCannotBeEdited(node.getNode());
        } catch (RepositoryException e) {
            throw new DataFetchingException(e);
        }
    }

    @GraphQLField
    @GraphQLName("findAvailableNodeName")
    @GraphQLDescription("Returns the next available name for a node, appending if needed numbers.")
    public String findAvailableNodeName(@GraphQLName("nodeType") @GraphQLDescription("Node type used to generate the base name") String nodeTypeName, @GraphQLName("language") @GraphQLDescription("Language used to resolve the node type label") String language) {
        try {
            ExtendedNodeType nodeType = NodeTypeRegistry.getInstance().getNodeType(nodeTypeName);

            return JCRContentUtils.findAvailableNodeName(node.getNode(), JCRContentUtils.generateNodeName(nodeType.getLabel(
                LanguageCodeConverters.languageCodeToLocale(language))));
        } catch (RepositoryException e) {
            throw new DataFetchingException(e);
        }
    }

    @GraphQLField
    @GraphQLDescription("Returns content history for the node")
    public GqlContentHistory getHistory() {
        try {
            if (!node.getNode().hasPermission(HISTORY_PERMISSION)) {
                throw new AccessDeniedException("User does not have permission '" + HISTORY_PERMISSION + "' to view history for node " + node.getPath());
            }
        } catch (RepositoryException e) {
            throw new DataFetchingException(e);
        }
        return new GqlContentHistory(node);
    }

    @GraphQLField
    @GraphQLName("hiddenChildrenCount")
    @GraphQLDescription("Returns the number of children of the given types that the current user cannot read. Returns 0 when the current user cannot write the node.")
    public int getHiddenChildrenCount(@GraphQLName("types") @GraphQLNonNull @GraphQLDescription("Node types of the children to count") List<String> types) {
        JCRNodeWrapper userNode = node.getNode();
        try {
            if (!userNode.hasPermission(WRITE_PERMISSION)) {
                return 0;
            }
            JCRSessionWrapper userSession = userNode.getSession();
            return JCRTemplate.getInstance().doExecuteWithSystemSessionAsUser(null, userSession.getWorkspace().getName(), userSession.getLocale(),
                (JCRCallback<Integer>) systemSession -> {
                    int count = 0;
                    for (JCRNodeWrapper child : systemSession.getNodeByIdentifier(userNode.getIdentifier()).getNodes()) {
                        if (isOfType(child, types) && !userSession.itemExists(child.getPath())) {
                            count++;
                        }
                    }
                    return count;
                });
        } catch (RepositoryException e) {
            throw new DataFetchingException(e);
        }
    }

    private static boolean isOfType(JCRNodeWrapper child, List<String> types) throws RepositoryException {
        for (String type : types) {
            if (child.isNodeType(type)) {
                return true;
            }
        }
        return false;
    }

    private static final String HISTORY_PERMISSION = "viewHistoryTab";
    private static final String WRITE_PERMISSION = "jcr:write";
}
