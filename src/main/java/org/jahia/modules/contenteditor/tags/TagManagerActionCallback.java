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
package org.jahia.modules.contenteditor.tags;

import org.jahia.modules.contenteditor.graphql.api.tags.GqlTagWorkspaceMutationResult;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.JCRSessionWrapper;
import org.jahia.services.tags.TagActionCallback;

import javax.jcr.RepositoryException;
import java.util.ArrayList;
import java.util.List;

class TagManagerActionCallback implements TagActionCallback<GqlTagWorkspaceMutationResult> {
    private static final int SAVE_BATCH_SIZE = 100;

    private final JCRSessionWrapper session;
    private final String workspace;
    private final List<String> failedPaths = new ArrayList<>();
    private int processedCount;
    private int failedCount;

    TagManagerActionCallback(JCRSessionWrapper session, String workspace) {
        this.session = session;
        this.workspace = workspace;
    }

    @Override
    public void afterTagAction(JCRNodeWrapper node) throws RepositoryException {
        processedCount++;
        if (processedCount % SAVE_BATCH_SIZE == 0) {
            session.save();
        }

        TagManagerMutationService.flushNodeCaches(node.getPath());
    }

    /**
     * Counts a node that was left untouched because the caller may not write it. The path is
     * deliberately not reported: the caller has no right to read it either.
     */
    void onSkipped() {
        failedCount++;
    }

    @Override
    public void onError(JCRNodeWrapper node, RepositoryException e) throws RepositoryException {
        failedCount++;
        if (failedPaths.size() < TagManagerMutationService.MAX_REPORTED_FAILURES) {
            failedPaths.add(node.getPath());
        }
    }

    @Override
    public GqlTagWorkspaceMutationResult end() throws RepositoryException {
        session.save();
        return new GqlTagWorkspaceMutationResult(workspace, processedCount, failedCount, failedPaths);
    }
}
