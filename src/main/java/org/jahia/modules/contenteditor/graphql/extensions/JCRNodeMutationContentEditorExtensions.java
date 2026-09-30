/*
 * MIT License
 *
 * Copyright (c) 2002 - 2022 Jahia Solutions Group. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
package org.jahia.modules.contenteditor.graphql.extensions;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;
import graphql.annotations.annotationTypes.GraphQLNonNull;
import graphql.annotations.annotationTypes.GraphQLTypeExtension;
import org.jahia.modules.contenteditor.utils.ChildrenReorderPlanner;
import org.jahia.modules.graphql.provider.dxm.DataFetchingException;
import org.jahia.modules.graphql.provider.dxm.node.GqlJcrNodeMutation;
import org.jahia.modules.graphql.provider.dxm.node.GqlJcrWrongInputException;
import org.jahia.services.content.JCRNodeWrapper;

import javax.jcr.RepositoryException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Content Editor JCR Node mutation extension
 */
@GraphQLTypeExtension(GqlJcrNodeMutation.class)
public class JCRNodeMutationContentEditorExtensions {

    private static final String MOVE_PERMISSION = "jcr:removeNode";

    private final GqlJcrNodeMutation mutation;

    public JCRNodeMutationContentEditorExtensions(GqlJcrNodeMutation mutation) {
        this.mutation = mutation;
    }

    @GraphQLField
    @GraphQLName("reorderMovableChildren")
    @GraphQLDescription("Reorders the children in the requested order. A child that the current user cannot move keeps its position, and the other children fill the remaining positions.")
    public boolean reorderMovableChildren(@GraphQLName("names") @GraphQLNonNull @GraphQLDescription("Names of the children, in the requested order") List<String> names) {
        JCRNodeWrapper node = mutation.jcrNode;
        try {
            List<String> current = new ArrayList<>();
            Set<String> locked = new HashSet<>();
            for (JCRNodeWrapper child : node.getNodes()) {
                current.add(child.getName());
                if (!child.hasPermission(MOVE_PERMISSION)) {
                    locked.add(child.getName());
                }
            }
            List<String> target = ChildrenReorderPlanner.targetOrder(current, names, locked);
            for (ChildrenReorderPlanner.Move move : ChildrenReorderPlanner.plan(current, target, locked)) {
                node.orderBefore(move.getSource(), move.getDestination());
            }
            return true;
        } catch (IllegalArgumentException e) {
            throw new GqlJcrWrongInputException(e.getMessage() + " under " + node.getPath());
        } catch (RepositoryException e) {
            throw new DataFetchingException(e);
        }
    }
}
