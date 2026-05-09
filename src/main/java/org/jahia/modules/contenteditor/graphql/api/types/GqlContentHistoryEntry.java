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
import org.jahia.modules.graphql.provider.dxm.user.GqlUser;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.decorator.JCRUserNode;
import org.jahia.services.content.nodetypes.ExtendedNodeType;
import org.jahia.services.content.nodetypes.ExtendedPropertyDefinition;
import org.jahia.services.history.HistoryEntry;
import org.jahia.services.usermanager.JahiaUserManagerService;
import org.jahia.utils.LanguageCodeConverters;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.RepositoryException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

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

    @GraphQLField
    @GraphQLDescription("The localized display name of the property if the action was on a specific property")
    public String getPropertyNameDisplay(@GraphQLName("language") @GraphQLDescription("Language code for the display name") String language) {
        String propertyName = historyEntry.getPropertyName();
        if (propertyName == null || propertyName.trim().isEmpty()) {
            return null;
        }

        try {

            if (node == null) {
                return propertyName;
            }

            // Get the node type
            ExtendedNodeType nodeType = node.getPrimaryNodeType();

            // Get the property definition
            ExtendedPropertyDefinition propertyDef = nodeType.getPropertyDefinitionsAsMap().get(propertyName);

            if (propertyDef == null) {
                // Try to find in mixins
                for (ExtendedNodeType mixin : node.getMixinNodeTypes()) {
                    propertyDef = mixin.getPropertyDefinitionsAsMap().get(propertyName);
                    if (propertyDef != null) {
                        nodeType = mixin;
                        break;
                    }
                }
            }

            if (propertyDef != null) {
                Locale locale = language != null ? LanguageCodeConverters.languageCodeToLocale(language) : Locale.ENGLISH;
                return propertyDef.getLabel(locale, nodeType);
            }

            return propertyName;
        } catch (RepositoryException e) {
            if (logger.isDebugEnabled()) {
                logger.debug("Could not resolve property display name for property '{}' on node '{}'", propertyName, historyEntry.getUuid(), e);
            }
            return propertyName;
        }
    }
}
