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
package org.jahia.modules.contenteditor.graphql.api.tags;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;
import graphql.annotations.annotationTypes.GraphQLNonNull;

import java.util.List;

@GraphQLName("JContentTagMutationResult")
@GraphQLDescription("The result of a tag mutation")
public class GqlTagMutationResult {
    private final String tag;
    private final String nodeId;
    private final List<GqlTagWorkspaceMutationResult> workspaceResults;

    public GqlTagMutationResult(String tag, String nodeId, List<GqlTagWorkspaceMutationResult> workspaceResults) {
        this.tag = tag;
        this.nodeId = nodeId;
        this.workspaceResults = workspaceResults;
    }

    @GraphQLField
    @GraphQLNonNull
    @GraphQLDescription("The processed tag")
    public String getTag() {
        return tag;
    }

    @GraphQLField
    @GraphQLDescription("The impacted node identifier when the mutation targets a specific node")
    public String getNodeId() {
        return nodeId;
    }

    @GraphQLField
    @GraphQLNonNull
    @GraphQLDescription("Per-workspace mutation results")
    public List<GqlTagWorkspaceMutationResult> getWorkspaceResults() {
        return workspaceResults;
    }
}
