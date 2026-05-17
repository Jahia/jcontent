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
import org.apache.commons.lang.StringUtils;
import org.jahia.modules.contenteditor.api.forms.EditorFormServiceImpl;
import org.jahia.modules.graphql.provider.dxm.user.GqlUser;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.decorator.JCRSiteNode;
import org.jahia.services.content.decorator.JCRUserNode;
import org.jahia.services.content.nodetypes.ExtendedNodeType;
import org.jahia.services.content.nodetypes.ExtendedPropertyDefinition;
import org.jahia.services.history.HistoryEntry;
import org.jahia.services.usermanager.JahiaUserManagerService;
import org.jahia.utils.LanguageCodeConverters;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.RepositoryException;
import java.lang.reflect.Method;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * GraphQL representation of a content history entry
 */
@GraphQLDescription("Represents a content change event entry")
public class GqlContentHistoryEntry {

    private static final Logger logger = LoggerFactory.getLogger(GqlContentHistoryEntry.class);

    /**
     * Cached reflection accessor for {@code HistoryEntry.getChildNodeType()}.
     * {@code null} means the method is not present in this Jahia version.
     */
    private static final Method GET_CHILD_NODE_TYPE;

    /**
     * Cached reflection accessor for {@code HistoryEntry.getSubNodeName()}.
     * {@code null} means the method is not present in this Jahia version.
     */
    private static final Method GET_SUB_NODE_NAME;

    /**
     * Matches ACE node names: {@code {GRANT|DENY}_u_{name}} or {@code {GRANT|DENY}_g_{name}}.
     * Group 1 = verb (GRANT/DENY), group 2 = type (u/g), group 3 = principal name.
     */
    private static final Pattern ACE_NAME_PATTERN = Pattern.compile("^(GRANT|DENY)_(u|g)_(.+)$");

    static {
        Method cnt = null;
        Method snn = null;
        try {
            cnt = HistoryEntry.class.getMethod("getChildNodeType");
        } catch (NoSuchMethodException e) {
            // Older Jahia version — childNodeType is not available
        }
        try {
            snn = HistoryEntry.class.getMethod("getSubNodeName");
        } catch (NoSuchMethodException e) {
            // Older Jahia version — subNodeName is not available
        }
        GET_CHILD_NODE_TYPE = cnt;
        GET_SUB_NODE_NAME = snn;
    }

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
    @GraphQLDescription("The displayable name of the content node (uses jcr:title if set, otherwise the node name)")
    public String getNodeDisplayName() {
        if (node == null) {
            return null;
        }
        try {
            return node.getDisplayableName();
        } catch (Exception e) {
            if (logger.isDebugEnabled()) {
                logger.debug("Could not retrieve display name for node '{}'", historyEntry.getUuid(), e);
            }
            return null;
        }
    }

    @GraphQLField
    @GraphQLDescription("The category of the sub-node this entry belongs to. "
            + "Set only when the history was retrieved via the path-based API. "
            + "Possible values: MAIN, TRANSLATION, ACL, VISIBILITY, VANITY_URL, OTHER. "
            + "MAIN: the content node itself; "
            + "TRANSLATION: an i18n sub-node (jnt:translation) — see 'language' for the locale; "
            + "ACL: the j:acl container or one of its ACE children; "
            + "VISIBILITY: the j:conditionalVisibility node or a condition child; "
            + "VANITY_URL: the vanityUrlMapping container or an individual vanity URL child; "
            + "OTHER: any other direct child not matching a recognised category.")
    public String getChildNodeType() {
        if (GET_CHILD_NODE_TYPE == null) {
            return null;
        }
        try {
            Object type = GET_CHILD_NODE_TYPE.invoke(historyEntry);
            return type != null ? ((Enum<?>) type).name() : null;
        } catch (Exception e) {
            if (logger.isDebugEnabled()) {
                logger.debug("Could not retrieve childNodeType from HistoryEntry", e);
            }
            return null;
        }
    }

    @GraphQLField
    @GraphQLDescription("The name of the immediate ACL, vanity URL, or visibility sub-node for this entry. "
            + "Set for ACL, VANITY_URL, and VISIBILITY childNodeType values. "
            + "For ACL: the ACE node name (e.g. GRANT_u_anne). "
            + "For VANITY_URL: the vanity URL mapping node name. "
            + "For VISIBILITY: the condition node name. "
            + "Null for MAIN, TRANSLATION, OTHER, or older Jahia versions.")
    public String getSubNodeName() {
        if (GET_SUB_NODE_NAME == null) {
            return null;
        }
        try {
            return (String) GET_SUB_NODE_NAME.invoke(historyEntry);
        } catch (Exception e) {
            if (logger.isDebugEnabled()) {
                logger.debug("Could not retrieve subNodeName from HistoryEntry", e);
            }
            return null;
        }
    }

    @GraphQLField
    @GraphQLDescription("The ACL principal (user or group) for ACE-level history entries. "
            + "Uses subNodeName when available (path-based API), otherwise parses from path. "
            + "Returns null for j:acl container entries, non-ACL entries, or unparseable node names.")
    public GqlAcePrincipal getAcePrincipal() {
        // Use subNodeName when available — the service already extracted the ACE node name
        String aceName = getSubNodeName();

        if (aceName == null) {
            // Fall back to path parsing for older Jahia versions
            String path = historyEntry.getPath();
            if (path == null) {
                return null;
            }
            // Jahia stores property-level ACE history with the property name appended to the path:
            //   ACE node event:     …/j:acl/GRANT_u_anne
            //   ACE property event: …/j:acl/GRANT_u_anne/j:roles
            // Try the last segment first; if it does not match, try the second-to-last.
            int lastSlash = path.lastIndexOf('/');
            aceName = lastSlash >= 0 ? path.substring(lastSlash + 1) : path;
            if (!ACE_NAME_PATTERN.matcher(aceName).matches() && lastSlash > 0) {
                int secondLastSlash = path.lastIndexOf('/', lastSlash - 1);
                aceName = secondLastSlash >= 0
                        ? path.substring(secondLastSlash + 1, lastSlash)
                        : path.substring(0, lastSlash);
            }
        }

        Matcher matcher = ACE_NAME_PATTERN.matcher(aceName);
        if (!matcher.matches()) {
            return null;
        }

        String verb = matcher.group(1);
        boolean isUser = "u".equals(matcher.group(2));
        String principalType = isUser ? "USER" : "GROUP";
        String principalName = matcher.group(3);

        GqlUser user = null;
        if (isUser) {
            try {
                JCRUserNode userNode = JahiaUserManagerService.getInstance().lookupUser(principalName);
                if (userNode != null) {
                    user = new GqlUser(userNode.getJahiaUser());
                }
            } catch (Exception e) {
                if (logger.isDebugEnabled()) {
                    logger.debug("Could not resolve ACE principal user '{}'", principalName, e);
                }
            }
        }

        return new GqlAcePrincipal(verb, principalType, principalName, user);
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
                // Mirror Field.initializeLabelFromItemDefinition: use declaring node type with resolveResourceKey
                // so that inherited mixin properties (e.g. jmix:tagged / j:tagList) resolve their label
                // from the site's full template-package chain rather than only the core types bundle.
                JCRSiteNode site = node.getResolveSite();
                String label = resolveLabelViaResourceKey(propertyDef, locale, site, nodeType);
                return StringUtils.isEmpty(label) ? propertyDef.getLabel(locale, nodeType) : label;
            }

            return propertyName;
        } catch (RepositoryException e) {
            if (logger.isDebugEnabled()) {
                logger.debug("Could not resolve property display name for property '{}' on node '{}'", propertyName, historyEntry.getUuid(), e);
            }
            return propertyName;
        }
    }

    /**
     * Resolves a property definition label via the site's template-package resource bundle chain,
     * exactly as {@link org.jahia.modules.contenteditor.api.forms.model.Field#initializeLabelFromItemDefinition} does.
     * First tries the primary/context node type, then the declaring node type.
     */
    private static String resolveLabelViaResourceKey(ExtendedPropertyDefinition propertyDef,
            Locale locale, JCRSiteNode site, ExtendedNodeType contextNodeType) {
        // Try context node type first (allows per-node-type label overrides)
        String label = lookupLabelForType(propertyDef, locale, site, contextNodeType);
        if (StringUtils.isEmpty(label)) {
            // Fall back to declaring node type (e.g. jmix:tagged for j:tagList)
            label = lookupLabelForType(propertyDef, locale, site, propertyDef.getDeclaringNodeType());
        }
        return label;
    }

    private static String lookupLabelForType(ExtendedPropertyDefinition propertyDef,
            Locale locale, JCRSiteNode site, ExtendedNodeType nodeType) {
        String prefix = nodeType.getTemplatePackage() != null
                ? nodeType.getTemplatePackage().getBundle().getSymbolicName() + ":" : "";
        String key = propertyDef.getResourceBundleKey(nodeType);
        return EditorFormServiceImpl.resolveResourceKey(prefix + key, locale, site);
    }
}
