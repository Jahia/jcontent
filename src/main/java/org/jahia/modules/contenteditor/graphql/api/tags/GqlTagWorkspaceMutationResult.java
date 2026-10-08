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
import org.jahia.modules.contenteditor.tags.TagManagerMutationService;

import java.util.List;

/**
 * Lightweight summary of a tag mutation applied to a single JCR workspace.
 *
 * <p>The result intentionally avoids carrying full {@code GqlJcrNode} objects for updated nodes.
 * Returning a potentially unbounded list of heavy node instances for the success path would load
 * large amounts of data into memory on sites with many tagged nodes, while providing little value
 * to callers — the UI only needs a count to display "X nodes updated". A separate query using the
 * returned {@link #getFailedPaths()} can fetch full node details on demand when recovery action
 * is needed.
 *
 * <p>For the failure path, at most {@value TagManagerMutationService#MAX_REPORTED_FAILURES} node paths are included in the
 * payload. The total count is always available via {@link #getFailedCount()}. Callers that need to
 * display or process more failures should paginate using a follow-up tagged-content query.
 */
@GraphQLName("JContentTagWorkspaceMutationResult")
@GraphQLDescription("The result of a tag mutation for one workspace")
public class GqlTagWorkspaceMutationResult {

    private final String workspace;
    private final int processedCount;
    private final int failedCount;
    private final List<String> failedPaths;

    public GqlTagWorkspaceMutationResult(String workspace, int processedCount, int failedCount, List<String> failedPaths) {
        this.workspace = workspace;
        this.processedCount = processedCount;
        this.failedCount = failedCount;
        this.failedPaths = failedPaths;
    }

    @GraphQLField
    @GraphQLNonNull
    @GraphQLDescription("The workspace that was updated")
    public String getWorkspace() {
        return workspace;
    }

    @GraphQLField
    @GraphQLNonNull
    @GraphQLDescription("Number of nodes successfully updated in this workspace")
    public Integer getProcessedCount() {
        return processedCount;
    }

    @GraphQLField
    @GraphQLNonNull
    @GraphQLDescription("Total number of nodes that failed to update in this workspace (may exceed the size of failedPaths)")
    public Integer getFailedCount() {
        return failedCount;
    }

    @GraphQLField
    @GraphQLNonNull
    @GraphQLDescription("JCR paths of nodes that failed to update, capped at " + TagManagerMutationService.MAX_REPORTED_FAILURES +
            ". Use a follow-up taggedContent query with these paths for full node details.")
    public List<String> getFailedPaths() {
        return failedPaths;
    }
}
