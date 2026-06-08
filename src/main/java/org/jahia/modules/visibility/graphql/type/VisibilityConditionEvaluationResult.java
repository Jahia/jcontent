package org.jahia.modules.visibility.graphql.type;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;
import org.jahia.modules.graphql.provider.dxm.node.GqlJcrNode;

@GraphQLDescription("Result of evaluating a single visibility condition on a node")
public class VisibilityConditionEvaluationResult {

    private final GqlJcrNode conditionNode;
    private final boolean matches;

    public VisibilityConditionEvaluationResult(GqlJcrNode conditionNode, boolean matches) {
        this.conditionNode = conditionNode;
        this.matches = matches;
    }

    @GraphQLField
    @GraphQLName("conditionNode")
    @GraphQLDescription("The JCR node representing the visibility condition")
    public GqlJcrNode getConditionNode() {
        return conditionNode;
    }

    @GraphQLField
    @GraphQLName("matches")
    @GraphQLDescription("True if the visibility condition matches for the current context")
    public boolean isMatches() {
        return matches;
    }
}
