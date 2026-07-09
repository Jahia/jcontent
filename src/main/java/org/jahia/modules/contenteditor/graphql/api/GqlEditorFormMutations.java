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
import org.jahia.modules.contenteditor.api.forms.PublicationService;
import org.jahia.modules.contenteditor.api.lock.StaticEditorLockService;
import org.jahia.modules.graphql.provider.dxm.DataFetchingException;
import org.jahia.modules.graphql.provider.dxm.node.GqlJcrPropertyInput;
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
    public static final String J_CONDITIONAL_VISIBILITY = "j:conditionalVisibility";

    private PublicationService publicationService;

    private JCRSessionFactory jcrSessionFactory;

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
        @GraphQLName("uuid") @GraphQLNonNull @GraphQLDescription("UUID of the parent nodes for the visibility condition") String uuid,
        @GraphQLName("locale") @GraphQLNonNull @GraphQLDescription("A string representation of a locale, in IETF BCP 47 language tag format, ie en_US, en, fr, fr_CH, ...") String locale,
        @GraphQLName("newConditions") @GraphQLDescription("New visibility conditions to create") Collection<VisibilityConditionInput> newConditions,
        @GraphQLName("updatedConditions") @GraphQLDescription("Existing visibility conditions to update") Collection<VisibilityConditionInput> updatedConditions,
        @GraphQLName("removedConditions") @GraphQLDescription("UUIDs of visibility conditions to remove") Collection<String> removedConditions,
        @GraphQLName("isMatchingAllConditions") @GraphQLDefaultValue(GqlUtils.SupplierFalse.class) @GraphQLDescription("When true, all conditions must match for the node to be visible; when false, any single match is sufficient") Boolean isMatchingAllConditionsUpdate
    ) {
        try {
            JCRSessionWrapper session = jcrSessionFactory.getCurrentUserSession(Constants.EDIT_WORKSPACE, LanguageCodeConverters.languageCodeToLocale(locale));
            JCRNodeWrapper jcrNode = session.getNodeByUUID(uuid);
            JCRNodeWrapper conditions = getOrCreateConditionsNode(jcrNode);
            conditions.setProperty("j:forceMatchAllConditions", isMatchingAllConditionsUpdate);

            addNewConditions(conditions, newConditions);
            updateConditions(session, conditions, updatedConditions);
            removeConditions(session, conditions, removedConditions);

            if (session.hasPendingChanges()) {
                session.save();
                return true;
            }
            return false;
        } catch (RepositoryException e) {
            throw new DataFetchingException(e);
        }
    }

    /**
     * Return the j:conditionalVisibility child node holding the conditions, creating the
     * jmix:conditionalVisibility mixin and the child node on the fly if they are missing.
     */
    private JCRNodeWrapper getOrCreateConditionsNode(JCRNodeWrapper jcrNode) throws RepositoryException {
        if (!jcrNode.isNodeType("jmix:conditionalVisibility")) {
            jcrNode.addMixin("jmix:conditionalVisibility");
        }
        if (!jcrNode.hasNode(J_CONDITIONAL_VISIBILITY)) {
            jcrNode.addNode(J_CONDITIONAL_VISIBILITY, "jnt:conditionalVisibility");
        }
        return jcrNode.getNode(J_CONDITIONAL_VISIBILITY);
    }

    private void addNewConditions(JCRNodeWrapper conditions, Collection<VisibilityConditionInput> newConditions) throws RepositoryException {
        if (CollectionUtils.isEmpty(newConditions)) {
            return;
        }
        for (VisibilityConditionInput condition : newConditions) {
            String nodeName = JCRContentUtils.findAvailableNodeName(conditions, StringUtils.substringAfterLast(condition.getPrimaryType(), ":"));
            JCRNodeWrapper addedNode = conditions.addNode(nodeName, condition.getPrimaryType());
            // Track each condition's own modification/publication metadata (jcr:lastModified,
            // j:lastPublished, ...) so its individual publication status can be displayed.
            if (addedNode.canAddMixin("jmix:conditionPublicationInfo")) {
                addedNode.addMixin("jmix:conditionPublicationInfo");
            }
            applyProperties(addedNode, condition);
        }
    }

    private void updateConditions(JCRSessionWrapper session, JCRNodeWrapper conditions, Collection<VisibilityConditionInput> updatedConditions) throws RepositoryException {
        if (CollectionUtils.isEmpty(updatedConditions)) {
            return;
        }
        for (VisibilityConditionInput condition : updatedConditions) {
            JCRNodeWrapper updatedNode = session.getNodeByUUID(condition.getUuid());
            if (updatedNode.getParent().getIdentifier().equals(conditions.getIdentifier())) {
                applyProperties(updatedNode, condition);
            }
        }
    }

    private void removeConditions(JCRSessionWrapper session, JCRNodeWrapper conditions, Collection<String> removedConditions) throws RepositoryException {
        if (CollectionUtils.isEmpty(removedConditions)) {
            return;
        }
        for (String conditionUuid : removedConditions) {
            JCRNodeWrapper removedNode = session.getNodeByUUID(conditionUuid);
            if (removedNode.getParent().getIdentifier().equals(conditions.getIdentifier())) {
                removedNode.remove();
            }
        }
    }

    /**
     * Copy the condition input properties onto the given node, using the single value when set,
     * otherwise the multiple values.
     */
    private void applyProperties(JCRNodeWrapper node, VisibilityConditionInput condition) throws RepositoryException {
        for (GqlJcrPropertyInput property : condition.getProperties()) {
            if (property.getValue() != null) {
                node.setProperty(property.getName(), property.getValue());
            } else if (!CollectionUtils.isEmpty(property.getValues())) {
                node.setProperty(property.getName(), property.getValues().toArray(new String[0]));
            }
        }
    }
}
