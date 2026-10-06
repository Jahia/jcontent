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
import org.jahia.api.Constants;
import org.jahia.modules.graphql.provider.dxm.DataFetchingException;
import org.jahia.modules.graphql.provider.dxm.osgi.annotations.GraphQLOsgiService;
import org.jahia.modules.contenteditor.tags.TagManagerMutationService;
import org.jahia.services.content.JCRSessionFactory;

import javax.inject.Inject;
import javax.jcr.RepositoryException;

@GraphQLName("JContentTagManagerMutation")
@GraphQLDescription("Tag manager mutations for a site")
public class GqlTagManagerMutation {
    private final String siteKey;

    private TagManagerMutationService tagManagerMutationService;

    @Inject
    @GraphQLOsgiService
    public void setTagManagerMutationService(TagManagerMutationService tagManagerMutationService) {
        this.tagManagerMutationService = tagManagerMutationService;
    }

    public GqlTagManagerMutation(String siteKey) {
        this.siteKey = siteKey;
        try {
            if (!JCRSessionFactory.getInstance().getCurrentUserSession(Constants.EDIT_WORKSPACE)
                    .getNode("/sites/" + siteKey).hasPermission("tagManager")) {
                throw new DataFetchingException("Permission denied");
            }
        } catch (RepositoryException e) {
            throw new DataFetchingException(e);
        }
    }

    @GraphQLField
    @GraphQLDescription("Rename a tag on all tagged content under the site")
    public GqlTagMutationResult renameTag(@GraphQLName("tag") @GraphQLDescription("The tag to rename") @GraphQLNonNull String tag,
                                          @GraphQLName("newName") @GraphQLDescription("The new tag name") @GraphQLNonNull String newName) {
        return tagManagerMutationService.renameTag(siteKey, tag, newName);
    }

    @GraphQLField
    @GraphQLDescription("Delete a tag from all tagged content under the site")
    public GqlTagMutationResult deleteTag(@GraphQLName("tag") @GraphQLDescription("The tag to delete") @GraphQLNonNull String tag) {
        return tagManagerMutationService.deleteTag(siteKey, tag);
    }

    @GraphQLField
    @GraphQLDescription("Delete a tag from a specific content item")
    public GqlTagMutationResult deleteTagOnNode(@GraphQLName("tag") @GraphQLDescription("The tag to delete") @GraphQLNonNull String tag,
                                                @GraphQLName("nodeId") @GraphQLDescription("The node identifier") @GraphQLNonNull String nodeId) {
        return tagManagerMutationService.deleteTagOnNode(siteKey, tag, nodeId);
    }

    @GraphQLField
    @GraphQLDescription("Rename a tag on a specific content item")
    public GqlTagMutationResult renameTagOnNode(@GraphQLName("tag") @GraphQLDescription("The tag to rename") @GraphQLNonNull String tag,
                                                @GraphQLName("newName") @GraphQLDescription("The new tag name") @GraphQLNonNull String newName,
                                                @GraphQLName("nodeId") @GraphQLDescription("The node identifier") @GraphQLNonNull String nodeId) {
        return tagManagerMutationService.renameTagOnNode(siteKey, tag, newName, nodeId);
    }
}
