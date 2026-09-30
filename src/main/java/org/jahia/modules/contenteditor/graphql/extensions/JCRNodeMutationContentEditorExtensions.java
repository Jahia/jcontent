package org.jahia.modules.contenteditor.graphql.extensions;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;
import graphql.annotations.annotationTypes.GraphQLNonNull;
import graphql.annotations.annotationTypes.GraphQLTypeExtension;
import org.jahia.modules.contenteditor.utils.ChildrenOrderingUtils;
import org.jahia.modules.graphql.provider.dxm.DataFetchingException;
import org.jahia.modules.graphql.provider.dxm.node.GqlJcrNodeMutation;
import org.jahia.modules.graphql.provider.dxm.node.GqlJcrWrongInputException;

import javax.jcr.RepositoryException;
import java.util.List;

/**
 * Content Editor JCR Node mutation extension
 */
@GraphQLTypeExtension(GqlJcrNodeMutation.class)
public class JCRNodeMutationContentEditorExtensions {

    private final GqlJcrNodeMutation mutation;

    public JCRNodeMutationContentEditorExtensions(GqlJcrNodeMutation mutation) {
        this.mutation = mutation;
    }

    @GraphQLField
    @GraphQLName("reorderMovableChildren")
    @GraphQLDescription("Reorders the children in the requested order. A child that the current user cannot move keeps its position, and the other children fill the remaining positions.")
    public boolean reorderMovableChildren(@GraphQLName("names") @GraphQLNonNull @GraphQLDescription("Names of the children, in the requested order") List<String> names) {
        try {
            ChildrenOrderingUtils.reorderMovableChildren(mutation.jcrNode, names);
            return true;
        } catch (IllegalArgumentException e) {
            throw new GqlJcrWrongInputException(e.getMessage() + " under " + mutation.jcrNode.getPath());
        } catch (RepositoryException e) {
            throw new DataFetchingException(e);
        }
    }
}
