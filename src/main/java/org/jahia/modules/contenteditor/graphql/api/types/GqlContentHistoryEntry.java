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
import graphql.annotations.annotationTypes.GraphQLNonNull;
import org.apache.commons.lang.StringEscapeUtils;
import org.apache.commons.lang.StringUtils;
import org.jahia.modules.graphql.provider.dxm.node.NodeHelper;
import org.jahia.modules.graphql.provider.dxm.user.GqlUser;
import org.jahia.services.content.JCRContentUtils;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.decorator.JCRSiteNode;
import org.jahia.services.content.decorator.JCRUserNode;
import org.jahia.services.content.nodetypes.ExtendedItemDefinition;
import org.jahia.services.content.nodetypes.ExtendedNodeType;
import org.jahia.services.content.nodetypes.ExtendedPropertyDefinition;
import org.jahia.services.history.HistoryEntry;
import org.jahia.services.usermanager.JahiaUserManagerService;
import org.jahia.utils.LanguageCodeConverters;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.ItemNotFoundException;
import javax.jcr.RepositoryException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

import static org.jahia.modules.contenteditor.api.forms.EditorFormServiceImpl.resolveResourceKey;

/**
 * GraphQL representation of a content history entry
 */
@GraphQLDescription("Represents a content change event entry")
public class GqlContentHistoryEntry {

    private static final Logger logger = LoggerFactory.getLogger(GqlContentHistoryEntry.class);

    private final HistoryEntry historyEntry;
    private final JCRNodeWrapper node;

    public GqlContentHistoryEntry(HistoryEntry historyEntry, JCRNodeWrapper node) {
        this.node = node;
        this.historyEntry = historyEntry;
    }

    @GraphQLField
    @GraphQLDescription("The unique identifier of the history entry")
    public String getId() {
        return historyEntry.getId();
    }

    @GraphQLField
    @GraphQLDescription("The timestamp of the history entry in ISO 8601 format")
    public String getDate() {
        if (historyEntry.getDate() == null) {
            return null;
        }
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
        return sdf.format(new Date(historyEntry.getDate()));
    }

    @GraphQLField
    @GraphQLDescription("The timestamp of the history entry as milliseconds since epoch")
    public Long getTimestamp() {
        return historyEntry.getDate();
    }

    @GraphQLField
    @GraphQLDescription("The path of the node at the time of the event")
    public String getPath() {
        return historyEntry.getPath();
    }

    @GraphQLField
    @GraphQLDescription("The UUID of the node")
    public String getUuid() {
        return historyEntry.getUuid();
    }

    @GraphQLField
    @GraphQLDescription("The action performed (e.g., created, updated, deleted, published)")
    public String getAction() {
        return historyEntry.getAction();
    }

    @GraphQLField
    @GraphQLDescription("The property name if the action was on a specific property")
    public String getPropertyName() {
        return historyEntry.getPropertyName();
    }

    @GraphQLField
    @GraphQLDescription("The user key who performed the action")
    public String getUserKey() {
        return historyEntry.getUserKey();
    }

    @GraphQLField
    @GraphQLDescription("The user who performed the action, resolved from the user key")
    public GqlUser getUser() {
        String userKey = historyEntry.getUserKey();
        if (userKey == null || userKey.trim().isEmpty()) {
            return null;
        }
        try {
            JCRUserNode userNode = JahiaUserManagerService.getInstance().lookupUser(userKey);
            if (userNode != null) {
                return new GqlUser(userNode.getJahiaUser());
            }
        } catch (Exception e) {
            if (logger.isDebugEnabled()) {
                logger.debug("Could not resolve user node for key '{}'", userKey, e);
            }
        }
        return null;
    }

    @GraphQLField
    @GraphQLDescription("Additional message about the event")
    public String getMessage() {
        return historyEntry.getMessage();
    }

    @GraphQLField
    @GraphQLName("language")
    @GraphQLDescription("The language code if the entry is for a language-specific node")
    public String getLanguage() {
        return historyEntry.getLocale() != null ? historyEntry.getLocale().toString() : null;
    }

    // Note: nodeName and nodeNameDisplay are intentional shortcuts on the entry rather than
    // delegating to the parent GqlJcrNode fields. With the extended history service
    // (PathBasedContentHistoryAdapter), entries can originate from different child nodes
    // (ACLs, vanities, translation sub-nodes, child content nodes), so a single displayName
    // on the parent GqlJcrNode would only ever reflect the root context node. Each entry must
    // resolve its own node name independently — `this.node` is resolved per-entry from the
    // entry's UUID by GqlContentHistory.resolveEntryNode (falling back to the root context node
    // when the UUID cannot be resolved, e.g. for deleted nodes).

    @GraphQLField
    @GraphQLDescription("The technical name of the node")
    public String getNodeName() {
        return node != null ? node.getName() : null;
    }

    @GraphQLField
    @GraphQLDescription("The localized display name of the node")
    public String getNodeNameDisplay(@GraphQLName("language") @GraphQLNonNull @GraphQLDescription("Language code for the display name") String language) {
        try {
            JCRNodeWrapper node = NodeHelper.getNodeInLanguage(this.node, language);
            return node.getDisplayableName();
        } catch (ItemNotFoundException e) {
            return null;
        } catch (RepositoryException e) {
            throw new RuntimeException(e);
        }
    }

    @GraphQLField
    @GraphQLDescription("The localized display name of the property if the action was on a specific property")
    public String getPropertyNameDisplay(@GraphQLName("language") @GraphQLNonNull @GraphQLDescription("Language code for the display name") String language) {
        String propertyName = historyEntry.getPropertyName();
        if (propertyName == null || propertyName.trim().isEmpty()) {
            return null;
        }
        if (node == null) {
            return propertyName;
        }
        try {
            Locale uiLocale = LanguageCodeConverters.languageCodeToLocale(language);
            JCRSiteNode site = node.getResolveSite();
            ExtendedNodeType primaryNodeType = node.getPrimaryNodeType();

            // Find property definition on primary type, then mixins
            ExtendedPropertyDefinition propertyDef = primaryNodeType.getPropertyDefinitionsAsMap().get(propertyName);
            if (propertyDef == null) {
                for (ExtendedNodeType mixin : node.getMixinNodeTypes()) {
                    propertyDef = mixin.getPropertyDefinitionsAsMap().get(propertyName);
                    if (propertyDef != null) {
                        break;
                    }
                }
            }
            if (propertyDef == null) {
                return propertyName;
            }

            // Mirrors Field.initializeLabel / initializeLabelFromItemDefinition resolution order:
            String label = null;
            // 1. Allow labels from primary node type
            label = resolveLabelFromDefinition(propertyDef, uiLocale, site, primaryNodeType, label);
            // 2. Looks for labels in declaring node type
            label = resolveLabelFromDefinition(propertyDef, uiLocale, site, propertyDef.getDeclaringNodeType(), label);
            // 3. Then in original overridden property
            ExtendedItemDefinition overriddenDef = propertyDef.getOverridenDefinition();
            if (overriddenDef != null) {
                label = resolveLabelFromDefinition(overriddenDef, uiLocale, site, overriddenDef.getDeclaringNodeType(), label);
            }
            // 4. Fallback on untranslated system name
            return StringUtils.isEmpty(label) ? JCRContentUtils.replaceColon(propertyDef.getName()) : label;

        } catch (RepositoryException e) {
            if (logger.isDebugEnabled()) {
                logger.debug("Could not resolve property display name for '{}' on node '{}'", propertyName, historyEntry.getUuid(), e);
            }
            return propertyName;
        }
    }

    private String resolveLabelFromDefinition(ExtendedItemDefinition definition, Locale uiLocale, JCRSiteNode site, ExtendedNodeType nodeType, String currentLabel) {
        if (definition == null || nodeType == null || !StringUtils.isEmpty(currentLabel)) {
            return currentLabel;
        }
        String prefix = nodeType.getTemplatePackage() != null ? nodeType.getTemplatePackage().getBundle().getSymbolicName() + ":" : "";
        String key = definition.getResourceBundleKey(nodeType);
        String resolved = StringEscapeUtils.unescapeHtml(resolveResourceKey(prefix + key, uiLocale, site));
        return StringUtils.isEmpty(resolved) ? currentLabel : resolved;
    }
}
