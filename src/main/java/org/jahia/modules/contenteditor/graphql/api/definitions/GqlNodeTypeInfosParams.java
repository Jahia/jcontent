package org.jahia.modules.contenteditor.graphql.api.definitions;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;

import java.util.List;

@GraphQLName("NodeTypeInfosParams")
@GraphQLDescription("Input parameters for retrieving node type infos")
public class GqlNodeTypeInfosParams {

    @GraphQLField
    @GraphQLDescription("Path of the node")
    private String path;
    @GraphQLField
    @GraphQLDescription("List of types to retrieve")
    private List<String> nodeTypes;

    public GqlNodeTypeInfosParams(@GraphQLName("path") String path, @GraphQLName("nodeTypes") List<String> nodeTypes) {
        this.path = path;
        this.nodeTypes = nodeTypes;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public List<String> getNodeTypes() {
        return nodeTypes;
    }

    public void setNodeTypes(List<String> nodeTypes) {
        this.nodeTypes = nodeTypes;
    }
}
