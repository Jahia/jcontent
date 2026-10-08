package org.jahia.modules.contenteditor.graphql.api.types;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;
import org.apache.commons.lang.StringUtils;
import org.jahia.modules.graphql.provider.dxm.DataFetchingException;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.JCRSessionFactory;
import org.jahia.services.content.decorator.JCRGroupNode;
import org.jahia.services.content.decorator.JCRSiteNode;
import org.jahia.services.content.decorator.JCRUserNode;
import org.jahia.utils.LanguageCodeConverters;

import javax.jcr.RepositoryException;
import javax.jcr.Value;
import java.util.Locale;

/**
 * A user or a group listed by a principal search, reduced to the values a picker displays.
 */
@GraphQLName("JContentPrincipal")
@GraphQLDescription("A user or a group listed by a principal search")
public class GqlPrincipal {

    private static final String PUBLIC_PROPERTIES = "j:publicProperties";

    // Read with the rights of the search; never handed to the schema.
    private final JCRNodeWrapper node;

    public GqlPrincipal(JCRNodeWrapper node) {
        this.node = node;
    }

    @GraphQLField
    @GraphQLDescription("Identifier of the principal node")
    public String getUuid() {
        try {
            return node.getIdentifier();
        } catch (RepositoryException e) {
            throw new DataFetchingException(e);
        }
    }

    @GraphQLField
    @GraphQLDescription("Path of the principal node")
    public String getPath() {
        return node.getPath();
    }

    @GraphQLField
    @GraphQLDescription("Name of the principal")
    public String getName() {
        return node.getName();
    }

    @GraphQLField
    @GraphQLDescription("Displayable name of the principal")
    public String getDisplayName(@GraphQLName("language") @GraphQLDescription("Language of the displayable name") String language) {
        Locale locale = StringUtils.isEmpty(language) ? null : LanguageCodeConverters.languageCodeToLocale(language);
        if (node instanceof JCRUserNode) {
            return ((JCRUserNode) node).getDisplayableName(locale);
        }
        if (node instanceof JCRGroupNode) {
            return ((JCRGroupNode) node).getDisplayableName(locale);
        }
        return node.getDisplayableName();
    }

    @GraphQLField
    @GraphQLDescription("Primary node type of the principal node: jnt:user or jnt:group")
    public String getNodeTypeName() {
        try {
            return node.getPrimaryNodeTypeName();
        } catch (RepositoryException e) {
            throw new DataFetchingException(e);
        }
    }

    @GraphQLField
    @GraphQLDescription("First name of a user, when the user made it public or the caller may read it; null for a group")
    public String getFirstName() {
        return readUserProperty("j:firstName");
    }

    @GraphQLField
    @GraphQLDescription("Last name of a user, when the user made it public or the caller may read it; null for a group")
    public String getLastName() {
        return readUserProperty("j:lastName");
    }

    @GraphQLField
    @GraphQLDescription("Key of the provider that stores the principal")
    public String getProvider() {
        if (node instanceof JCRUserNode) {
            return ((JCRUserNode) node).getProviderName();
        }
        if (node instanceof JCRGroupNode) {
            return ((JCRGroupNode) node).getProviderName();
        }
        return node.getProvider().getKey();
    }

    @GraphQLField
    @GraphQLDescription("Site the principal resolves to")
    public Site getSite() {
        try {
            JCRSiteNode site = node.getResolveSite();
            return site != null ? new Site(site.getSiteKey(), site.getDisplayableName()) : null;
        } catch (RepositoryException e) {
            throw new DataFetchingException(e);
        }
    }

    /**
     * A user property is returned when the caller's own session may read it, or when the user lists it in
     * j:publicProperties.
     */
    private String readUserProperty(String name) {
        if (!(node instanceof JCRUserNode)) {
            return null;
        }
        try {
            return JCRSessionFactory.getInstance().getCurrentUserSession().getNodeByIdentifier(node.getIdentifier()).getPropertyAsString(name);
        } catch (RepositoryException e) {
            return isPublic(name) ? node.getPropertyAsString(name) : null;
        }
    }

    private boolean isPublic(String name) {
        try {
            if (!node.hasProperty(PUBLIC_PROPERTIES)) {
                return false;
            }
            for (Value value : node.getProperty(PUBLIC_PROPERTIES).getValues()) {
                if (name.equals(value.getString())) {
                    return true;
                }
            }
            return false;
        } catch (RepositoryException e) {
            return false;
        }
    }

    @GraphQLName("JContentPrincipalSite")
    @GraphQLDescription("Site a principal resolves to")
    public static class Site {
        private final String siteKey;
        private final String displayName;

        Site(String siteKey, String displayName) {
            this.siteKey = siteKey;
            this.displayName = displayName;
        }

        @GraphQLField
        @GraphQLDescription("Key of the site")
        public String getSiteKey() {
            return siteKey;
        }

        @GraphQLField
        @GraphQLDescription("Displayable name of the site")
        public String getDisplayName() {
            return displayName;
        }
    }
}
