package org.jahia.modules.contenteditor.graphql.api.definitions;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;
import org.jahia.modules.graphql.provider.dxm.DataFetchingException;
import org.jahia.services.content.JCRContentUtils;
import org.jahia.services.content.nodetypes.ExtendedNodeType;

import javax.jcr.RepositoryException;
import java.util.Locale;

@GraphQLName("NodeTypeInfo")
@GraphQLDescription("GraphQL representation of node type information")
public class GqlNodeTypeInfo {

    private final String label;
    private final String name;
    private final String iconUrl;

    public GqlNodeTypeInfo(ExtendedNodeType nodeType, Locale locale) {
        this.name = nodeType.getName();
        this.label = nodeType.getLabel(locale);
        try {
            this.iconUrl = JCRContentUtils.getIconWithContext(nodeType) + ".png";
        } catch (RepositoryException e) {
            throw new DataFetchingException("Failed to create icon url", e);
        }
    }

    @GraphQLField
    @GraphQLDescription("Returns the localized label of the node type")
    public String getLabel() {
        return label;
    }

    @GraphQLField
    @GraphQLDescription("Returns the name of the node type")
    public String getName() {
        return name;
    }

    @GraphQLField
    @GraphQLDescription("Returns icon url of the node type")
    public String getIconUrl() {
        return iconUrl;
    }
}
