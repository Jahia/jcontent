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
package visibility.graphql.extensions;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;
import graphql.annotations.annotationTypes.GraphQLTypeExtension;
import org.jahia.modules.graphql.provider.dxm.DataFetchingException;
import org.jahia.modules.graphql.provider.dxm.node.GqlJcrNode;
import org.jahia.modules.graphql.provider.dxm.node.GqlJcrNodeImpl;
import org.jahia.osgi.BundleUtils;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.visibility.VisibilityService;
import visibility.graphql.type.VisibilityConditionEvaluationResult;

import javax.jcr.RepositoryException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Content Editor JCR Node extension
 */
@GraphQLTypeExtension(GqlJcrNode.class)
public class JCRNodeVisibilityConditionExtensions {

    private GqlJcrNode node;

    public JCRNodeVisibilityConditionExtensions(GqlJcrNode node) {
        this.node = node;
    }

    @GraphQLField
    @GraphQLName("isVisible")
    @GraphQLDescription("Returns true if the node is visible according to the visibility conditions defined for its type.")
    public boolean isVisible() throws DataFetchingException {
        VisibilityService visibilityService = BundleUtils.getOsgiService(VisibilityService.class, null);
        if (visibilityService != null) {
            return visibilityService.matchesConditions(node.getNode());
        }
        return true;
    }

    @GraphQLField
    @GraphQLName("visibilityDetails")
    @GraphQLDescription("Returns the details of the visibility conditions evaluation for the node.")
    public List<VisibilityConditionEvaluationResult> getVisibilityDetails() throws DataFetchingException {
        VisibilityService visibilityService = BundleUtils.getOsgiService(VisibilityService.class, null);
        if (visibilityService != null) {
            Map<JCRNodeWrapper, Boolean> conditionMatchesDetails = visibilityService.getConditionMatchesDetails(node.getNode());
            return conditionMatchesDetails.entrySet().stream().map(entry -> new VisibilityConditionEvaluationResult(new GqlJcrNodeImpl(entry.getKey()), entry.getValue())).collect(Collectors.toList());
        }
        return Collections.emptyList();
    }

    @GraphQLField
    @GraphQLName("isConditionMatching")
    @GraphQLDescription("Return if a node of type jnt:condition is matching for the current node.")
    public boolean isConditionMatching() throws DataFetchingException {
        VisibilityService visibilityService = BundleUtils.getOsgiService(VisibilityService.class, null);
        try {
            if (visibilityService != null && node.getNode().isNodeType("jnt:condition")) {
                try {
                    if (visibilityService.getConditions().containsKey(node.getNode().getPrimaryNodeTypeName())) {
                        return visibilityService.getConditions().get(node.getNode().getPrimaryNodeTypeName()).matches(node.getNode());
                    }
                } catch (Exception e) {
                    throw new DataFetchingException("Error evaluating the visibility condition matching for the node " + node.getNode().getParent().getParent().getPath() + " with the condition node " + node.getNode(), e);
                }
            } else {
                throw new DataFetchingException("The node " + node.getNode().getPath() + " is not of type jnt:condition or the visibility service is not available");
            }
        } catch (RepositoryException e) {
            throw new DataFetchingException(e);
        }
        return false;
    }

}
