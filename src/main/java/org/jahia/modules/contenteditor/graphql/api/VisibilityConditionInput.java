package org.jahia.modules.contenteditor.graphql.api;

import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;
import org.jahia.modules.graphql.provider.dxm.node.GqlJcrPropertyInput;

import java.util.Collection;

@GraphQLName("VisibilityConditionInput")
public class VisibilityConditionInput {
    @GraphQLField
    @GraphQLName("type")
    private String primaryType;

    @GraphQLField
    @GraphQLName("uuid")
    private String uuid;

    @GraphQLField
    @GraphQLName("properties")
    private Collection<GqlJcrPropertyInput> properties;

    public VisibilityConditionInput(@GraphQLName("type") String primaryType, @GraphQLName("uuid") String uuid, @GraphQLName("properties") Collection<GqlJcrPropertyInput> properties) {
        this.primaryType = primaryType;
        this.uuid = uuid;
        this.properties = properties;
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
}
