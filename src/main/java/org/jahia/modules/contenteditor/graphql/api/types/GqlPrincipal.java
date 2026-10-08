package org.jahia.modules.contenteditor.graphql.api.types;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.decorator.JCRSiteNode;
import org.jahia.services.content.decorator.JCRUserNode;

import javax.jcr.RepositoryException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * A user or a group listed by a principal search, reduced to the values a picker displays.
 */
@GraphQLName("JContentPrincipal")
@GraphQLDescription("A user or a group listed by a principal search")
public class GqlPrincipal {

    private static final Pattern PROVIDER_FOLDER = Pattern.compile("/providers/([^/]+)/");
    private static final String DEFAULT_PROVIDER = "default";

    private final String uuid;
    private final String path;
    private final String name;
    private final String displayName;
    private final String nodeTypeName;
    private final String firstName;
    private final String lastName;
    private final String provider;
    private final Site site;

    private GqlPrincipal(JCRNodeWrapper node) throws RepositoryException {
        uuid = node.getIdentifier();
        path = node.getPath();
        name = node.getName();
        displayName = node.getDisplayableName();
        nodeTypeName = node.getPrimaryNodeTypeName();
        boolean isUser = node instanceof JCRUserNode;
        firstName = isUser ? node.getPropertyAsString("j:firstName") : null;
        lastName = isUser ? node.getPropertyAsString("j:lastName") : null;
        Matcher matcher = PROVIDER_FOLDER.matcher(path);
        provider = matcher.find() ? matcher.group(1) : DEFAULT_PROVIDER;
        JCRSiteNode resolvedSite = node.getResolveSite();
        site = resolvedSite != null ? new Site(resolvedSite.getSiteKey(), resolvedSite.getDisplayableName()) : null;
    }

    public static GqlPrincipal from(JCRNodeWrapper node) throws RepositoryException {
        return new GqlPrincipal(node);
    }

    @GraphQLField
    @GraphQLDescription("Identifier of the principal node")
    public String getUuid() {
        return uuid;
    }

    @GraphQLField
    @GraphQLDescription("Path of the principal node")
    public String getPath() {
        return path;
    }

    @GraphQLField
    @GraphQLDescription("Name of the principal")
    public String getName() {
        return name;
    }

    @GraphQLField
    @GraphQLDescription("Displayable name of the principal")
    public String getDisplayName() {
        return displayName;
    }

    @GraphQLField
    @GraphQLDescription("Primary node type of the principal node: jnt:user or jnt:group")
    public String getNodeTypeName() {
        return nodeTypeName;
    }

    @GraphQLField
    @GraphQLDescription("First name of a user, null for a group")
    public String getFirstName() {
        return firstName;
    }

    @GraphQLField
    @GraphQLDescription("Last name of a user, null for a group")
    public String getLastName() {
        return lastName;
    }

    @GraphQLField
    @GraphQLDescription("Key of the provider that stores the principal")
    public String getProvider() {
        return provider;
    }

    @GraphQLField
    @GraphQLDescription("Site the principal resolves to")
    public Site getSite() {
        return site;
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
