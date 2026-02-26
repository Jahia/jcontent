package org.jahia.modules.contenteditor.graphql.api.definitions;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;


import java.util.List;

@GraphQLName("NodeTypeInfoResult")
@GraphQLDescription("GraphQL representation of node type information")
public class GqlNodeTypeInfoResult {

    private final String path;
    private final List<GqlNodeTypeInfo> nodeTypeInfos;

    public GqlNodeTypeInfoResult(String path, List<GqlNodeTypeInfo> nodeTypeInfos) {
        this.path = path;
        this.nodeTypeInfos = nodeTypeInfos;
    }

    @GraphQLField
    @GraphQLDescription("Returns node type infos")
    public List<GqlNodeTypeInfo> getNodeTypeInfos() {
        return nodeTypeInfos;
    }

    @GraphQLField
    @GraphQLDescription("Returns path")
    public String getPath() {
        return path;
    }
}
