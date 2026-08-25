package org.jahia.modules.contenteditor.graphql.api;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;
import org.jahia.modules.graphql.provider.dxm.node.GqlJcrPropertyInput;

import java.util.Collection;

@GraphQLName("VisibilityConditionInput")
@GraphQLDescription("Input type representing a visibility condition to be saved on a node")
public class VisibilityConditionInput {
    @GraphQLField
    @GraphQLName("type")
    @GraphQLDescription("The primary node type of the visibility condition")
    private String primaryType;

    @GraphQLField
    @GraphQLName("uuid")
    @GraphQLDescription("The UUID of an existing visibility condition node, null for new conditions")
    private String uuid;

    @GraphQLField
    @GraphQLName("properties")
    @GraphQLDescription("The properties to set on the visibility condition node")
    private Collection<GqlJcrPropertyInput> properties;

    @GraphQLField
    @GraphQLName("deletedProperties")
    @GraphQLDescription("The names of properties to remove from an existing visibility condition node")
    private Collection<String> deletedProperties;

    public VisibilityConditionInput(@GraphQLName("type") String primaryType, @GraphQLName("uuid") String uuid, @GraphQLName("properties") Collection<GqlJcrPropertyInput> properties, @GraphQLName("deletedProperties") Collection<String> deletedProperties) {
        this.primaryType = primaryType;
        this.uuid = uuid;
        this.properties = properties;
        this.deletedProperties = deletedProperties;
    }

    public String getPrimaryType() {
        return primaryType;
    }

    public String getUuid() {
        return uuid;
    }

    public Collection<GqlJcrPropertyInput> getProperties() {
        return properties;
    }

    public Collection<String> getDeletedProperties() {
        return deletedProperties;
    }
}
