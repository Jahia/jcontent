package org.jahia.modules.visibility.graphql.type;

import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;
import org.jahia.modules.graphql.provider.dxm.node.GqlJcrNode;

public class VisibilityConditionEvaluationResult {

    private final GqlJcrNode conditionNode;
    private final boolean matches;

    public VisibilityConditionEvaluationResult(GqlJcrNode conditionNode, boolean matches) {
        this.conditionNode = conditionNode;
        this.matches = matches;
    }

    @GraphQLField
    @GraphQLName("conditionNode")
    public GqlJcrNode getConditionNode() {
        return conditionNode;
    }

    @GraphQLField
    @GraphQLName("matches")
    public boolean isMatches() {
        return matches;
    }
}
