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
package org.jahia.modules.contenteditor.graphql.api;

import graphql.annotations.annotationTypes.*;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang.StringUtils;
import org.jahia.api.Constants;
import org.jahia.modules.contenteditor.api.forms.EditorFormException;
import org.jahia.modules.contenteditor.api.forms.EditorFormService;
import org.jahia.modules.contenteditor.api.forms.PublicationService;
import org.jahia.modules.contenteditor.api.lock.StaticEditorLockService;
import org.jahia.modules.graphql.provider.dxm.DataFetchingException;
import org.jahia.modules.graphql.provider.dxm.osgi.annotations.GraphQLOsgiService;
import org.jahia.services.content.JCRContentUtils;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.JCRSessionFactory;
import org.jahia.services.content.JCRSessionWrapper;
import org.jahia.utils.LanguageCodeConverters;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.jcr.RepositoryException;
import java.util.Collection;

/**
 * The root class for the GraphQL form mutations API
 */
public class GqlEditorFormMutations {
    private static final Logger logger = LoggerFactory.getLogger(GqlEditorFormMutations.class);

    private EditorFormService editorFormService;
    private PublicationService publicationService;

    private JCRSessionFactory jcrSessionFactory;

    @Inject
    @GraphQLOsgiService
    public void setEditorFormService(EditorFormService editorFormService) {
        this.editorFormService = editorFormService;
    }

    @Inject
    @GraphQLOsgiService
    public void setPublicationService(PublicationService publicationService) {
        this.publicationService = publicationService;
    }

    @Inject
    @GraphQLOsgiService
    public void setJcrSessionFactory(JCRSessionFactory jcrSessionFactory) {
        this.jcrSessionFactory = jcrSessionFactory;
    }

    /**
     * Unlock the given node for edition, if the node is locked.
     * In case the node was not locked, it should not fail.
     *
     * @throws EditorFormException In case of any error during the unlocking
     */
    @GraphQLField
    @GraphQLDescription("Unlock the given node for edition, if the node is locked.")
    @GraphQLName("unlockEditor")
    public boolean unlockEditor(
        @GraphQLName("editorID") @GraphQLNonNull @GraphQLDescription("An ID generated client side used to identify the lock") String editorID
    ) throws EditorFormException {
        try {
            logger.info("Request for lock release {}", editorID);
            StaticEditorLockService.unlock(editorID);
            return true;
        } catch (RepositoryException e) {
            throw new EditorFormException("Unable to unlock content editor", e);
        }
    }

    @GraphQLField
    @GraphQLDescription("Publish the edited node with the associated technical sub nodes (visibility conditions, vanity urls, ACLs)")
    public boolean publishForm(
        @GraphQLName("uuidOrPath") @GraphQLNonNull @GraphQLDescription("UUID or path of the edited node.") String uuidOrPath,
        @GraphQLName("locale") @GraphQLNonNull @GraphQLDescription("A string representation of a locale, in IETF BCP 47 language tag format, ie en_US, en, fr, fr_CH, ...") String locale
    ) {
        try {
            return publicationService.publish(LanguageCodeConverters.getLocaleFromCode(locale), uuidOrPath);
        } catch (EditorFormException e) {
            throw new DataFetchingException(e);
        }
    }

    @GraphQLField
    @GraphQLDescription("Save the visibility condition for the given node")
    public boolean saveVisibilityCondition(
        @GraphQLName("uuid") @GraphQLNonNull @GraphQLDescription("UUID of the parent nodes ofr teh visibility condition") String uuid,
        @GraphQLName("locale") @GraphQLNonNull @GraphQLDescription("A string representation of a locale, in IETF BCP 47 language tag format, ie en_US, en, fr, fr_CH, ...") String locale,
        @GraphQLName("newConditions") Collection<VisibilityConditionInput> newConditions,
        @GraphQLName("updatedConditions") Collection<VisibilityConditionInput> updatedConditions,
        @GraphQLName("removedConditions") Collection<String> removedConditions,
        @GraphQLName("isMatchingAllConditions") @GraphQLDefaultValue(GqlUtils.SupplierFalse.class) Boolean isMatchingAllConditionsUpdate
    ) {
        try {
            JCRSessionWrapper session = jcrSessionFactory.getCurrentUserSession(Constants.EDIT_WORKSPACE, LanguageCodeConverters.languageCodeToLocale(locale));
            JCRNodeWrapper jcrNode = session.getNodeByUUID(uuid);
            // Ensure node is jmix:conditionalVisibility
            if (!jcrNode.isNodeType("jmix:conditionalVisibility")) {
                jcrNode.addMixin("jmix:conditionalVisibility");
            }
            // get the children named j:conditionalVisibility if not available add it
            if (!jcrNode.hasNode("j:conditionalVisibility")) {
                jcrNode.addNode("j:conditionalVisibility", "jnt:conditionalVisibility");
            }
            JCRNodeWrapper conditions = jcrNode.getNode("j:conditionalVisibility");
            conditions.setProperty("j:forceMatchAllConditions", isMatchingAllConditionsUpdate);
            // deal with the new conditions
            newConditions.forEach(condition -> {
                try {
                    JCRNodeWrapper addedNode = conditions.addNode(JCRContentUtils.findAvailableNodeName(conditions, StringUtils.substringAfterLast(condition.getPrimaryType(), ":")), condition.getPrimaryType());
                    condition.getProperties().forEach(property -> {
                        try {
                            if (property.getValue() != null) {
                                addedNode.setProperty(property.getName(), property.getValue());
                            } else if (!CollectionUtils.isEmpty(property.getValues())) {
                                addedNode.setProperty(property.getName(), property.getValues().toArray(new String[0]));
                            }
                        } catch (RepositoryException e) {
                            throw new DataFetchingException(e);
                        }
                    });
                } catch (RepositoryException e) {
                    throw new DataFetchingException(e);
                }
            });
            // deal with the updated condition
            updatedConditions.forEach(condition -> {
                try {
                    JCRNodeWrapper updatedNode = session.getNodeByUUID(condition.getUuid());
                    if (updatedNode.getParent().getIdentifier().equals(conditions.getIdentifier())) {
                        condition.getProperties().forEach(property -> {
                            try {
                                if (property.getValue() != null) {
                                    updatedNode.setProperty(property.getName(), property.getValue());
                                } else if (!CollectionUtils.isEmpty(property.getValues())) {
                                    updatedNode.setProperty(property.getName(), property.getValues().toArray(new String[0]));
                                }
                            } catch (RepositoryException e) {
                                throw new DataFetchingException(e);
                            }
                        });
                    }
                } catch (RepositoryException e) {
                    throw new DataFetchingException(e);
                }
            });
            // deal with the removed conditions
            removedConditions.forEach(condition -> {
                try {
                    JCRNodeWrapper removedNode = session.getNodeByUUID(condition);
                    if (removedNode.getParent().getIdentifier().equals(conditions.getIdentifier())) {
                        removedNode.remove();
                    }
                } catch (RepositoryException e) {
                    throw new DataFetchingException(e);
                }
            });
            session.save();
        } catch (RepositoryException e) {
            throw new DataFetchingException(e);
        }
        return false;
    }
}
