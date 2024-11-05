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
package org.jahia.modules.contenteditor.api.forms;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.jahia.modules.contenteditor.api.forms.model.*;
import org.jahia.modules.contenteditor.utils.ContentEditorUtils;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.decorator.JCRSiteNode;
import org.jahia.services.content.nodetypes.ExtendedNodeType;
import org.jahia.services.content.nodetypes.NodeTypeRegistry;
import org.osgi.framework.Bundle;
import org.osgi.framework.BundleContext;
import org.osgi.framework.BundleEvent;
import org.osgi.framework.SynchronousBundleListener;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.RepositoryException;
import javax.jcr.nodetype.NoSuchNodeTypeException;
import java.io.IOException;
import java.net.URL;
import java.util.*;
import java.util.stream.Collectors;

@Component(immediate = true, service = StaticDefinitionsRegistry.class)
public class StaticDefinitionsRegistry implements SynchronousBundleListener {

    private static final Logger logger = LoggerFactory.getLogger(StaticDefinitionsRegistry.class);

    private final Map<Bundle, List<Form>> formsByBundle = new LinkedHashMap<>();
    private final List<Form> forms = new ArrayList<>();
    private final Map<Bundle, List<FieldSet>> fieldSetsByBundle = new LinkedHashMap<>();
    private final List<FieldSet> fieldSets = new ArrayList<>();

    private final ObjectMapper objectMapper = new ObjectMapper();
    private BundleContext bundleContext;

    @Activate
    public void activate(BundleContext bundleContext, Map<String, Object> properties) {
        this.bundleContext = bundleContext;
        for (Bundle bundle : bundleContext.getBundles()) {
            if (bundle.getBundleContext() != null) {
                registerForm(bundle);
                registerFieldSets(bundle);
            }
        }
        bundleContext.addBundleListener(this);
    }

    @Deactivate
    public void deactivate() {
        bundleContext.removeBundleListener(this);
    }

    @Override
    public void bundleChanged(BundleEvent event) {
        switch (event.getType()) {
            case BundleEvent.STARTED:
                registerForm(event.getBundle());
                registerFieldSets(event.getBundle());
                break;
            case BundleEvent.STOPPED:
                unregisterForms(event.getBundle());
                unregisterFieldSets(event.getBundle());
        }
    }

    /**
     * Retrieve all forms definition for the given type.
     *
     * @param type to look at
     * @param site
     * @return form definitions that match the type
     */
    public Collection<Form> getFormsForType(ExtendedNodeType type, JCRSiteNode site, Collection<ExtendedNodeType> nodeTypes) {
        return forms.stream()
            .filter(definition -> definition.getConditionNodeTypeName() != null)
            .filter(definition -> type.isNodeType(definition.getConditionNodeTypeName()) &&
                (definition.getCondition() == null || matchCondition(definition.getCondition(), type, site)))
            .filter(definition -> checkMixinCondition(definition.getCondition(), nodeTypes))
            .collect(Collectors.toCollection(ArrayList::new));
    }

    /**
     * Retrieve all fields set definition for the given name.
     *
     * @param type to look at
     * @return form definitions that match the type
     */
    public Collection<FieldSet> getFieldSetsForType(ExtendedNodeType type, JCRSiteNode site, Collection<ExtendedNodeType> nodeTypes) {
        return fieldSets.stream()
            .filter(definition -> definition.getConditionNodeTypeName() != null)
            .filter(definition -> type.isNodeType(definition.getConditionNodeTypeName()) &&
                (definition.getCondition() == null || matchCondition(definition.getCondition(), type, site)))
            .filter(definition -> checkMixinCondition(definition.getCondition(), nodeTypes))
            .collect(Collectors.toCollection(ArrayList::new));
    }

    public boolean checkMixinCondition(Condition condition, Collection<ExtendedNodeType> nodeTypes) {
        // step 1 - check if we have condition
        if (condition == null) return true;

        String conditionType = condition.getNodeType();
        if (conditionType == null) return true;

        // step 2 - get definition from name
        ExtendedNodeType conditionTypeDefinition;
        try {
            conditionTypeDefinition = NodeTypeRegistry.getInstance().getNodeType(conditionType);
        } catch (NoSuchNodeTypeException e) {
            return true;
        }

        // step 3 - check if the condition node is a mixin
        if (!conditionTypeDefinition.isMixin()) return true;

        // step 4 - check if nodetypes has the mixin
        return nodeTypes.stream().anyMatch(m -> m.getName().equals(conditionType));
    }

    public boolean matchCondition(Condition condition, ExtendedNodeType type, JCRSiteNode site) {
        return (condition.getOrderable() == null || type.hasOrderableChildNodes()) &&
            (condition.getWithPermission() == null || site.hasPermission(condition.getWithPermission())) &&
            (condition.getWithoutPermission() == null || !site.hasPermission(condition.getWithoutPermission()));
    }

    private void registerForm(Bundle bundle) {
        if (bundle.getBundleContext() == null) {
            return;
        }
        Enumeration<URL> editorFormURLs = bundle.findEntries("META-INF/jahia-content-editor-forms/forms", "*.json", true);
        if (editorFormURLs == null) {
            return;
        }
        while (editorFormURLs.hasMoreElements()) {
            registerForm(editorFormURLs.nextElement(), bundle);
        }
    }

    public void registerForm(URL editorFormURL, Bundle bundle) {
        try {
            Form form = objectMapper.readValue(editorFormURL, Form.class);
            form.setFileUrl(editorFormURL);
            form.setOriginBundle(bundle);
            if (form.getPriority() == null) {
                form.setPriority(1.);
            }

            for (Section section : form.getSections()) {
                for (FieldSet fieldSet : section.getFieldSets()) {
                    initFieldSet(fieldSet, bundle);
                }

                section.setLabelKey(ContentEditorUtils.getLabelKey(section.getLabelKey(), bundle));
                section.setDescriptionKey(ContentEditorUtils.getLabelKey(section.getDescriptionKey(), bundle));
            }

            form.setLabelKey(ContentEditorUtils.getLabelKey(form.getLabelKey(), bundle));
            form.setDescriptionKey(ContentEditorUtils.getLabelKey(form.getDescriptionKey(), bundle));

            forms.add(form);
            formsByBundle.computeIfAbsent(bundle, b -> new ArrayList<>()).add(form);
            logger.info("Successfully loaded static form for name {} from {}", form.getNodeTypeName(), editorFormURL);
        } catch (IOException | StaticDefinitionsRegistryException e) {
            logger.warn("Error loading editor form from {} : {}", editorFormURL, e.getMessage());
        }
    }

    private void unregisterForms(Bundle bundle) {
        List<Form> bundleForms = formsByBundle.remove(bundle);
        if (bundleForms == null) {
            return;
        }
        forms.removeAll(bundleForms);
    }

    public void registerFieldSets(Bundle bundle) {
        if (bundle.getBundleContext() == null) {
            return;
        }
        Enumeration<URL> editorFieldSetsURLs = bundle.findEntries("META-INF/jahia-content-editor-forms/fieldsets", "*.json", true);
        if (editorFieldSetsURLs == null) {
            return;
        }
        while (editorFieldSetsURLs.hasMoreElements()) {
            registerFieldSet(editorFieldSetsURLs.nextElement(), bundle);
        }
    }

    public void registerFieldSet(URL editorFormURL, Bundle bundle) {
        try {
            FieldSet fieldSet = objectMapper.readValue(editorFormURL, FieldSet.class);
            fieldSet.setOriginBundle(bundle);
            fieldSet.setFileUrl(editorFormURL);
            initFieldSet(fieldSet, bundle);

            fieldSets.add(fieldSet);
            fieldSetsByBundle.computeIfAbsent(bundle, b -> new ArrayList<>()).add(fieldSet);
            logger.info("Successfully loaded static fieldSets for name {} from {}", fieldSet.getName(), editorFormURL);
        } catch (IOException | StaticDefinitionsRegistryException e) {
            logger.warn("Error loading editor fieldset from {} : {}", editorFormURL, e.getMessage());
        }
    }

    private void unregisterFieldSets(Bundle bundle) {
        List<FieldSet> fieldSets = fieldSetsByBundle.remove(bundle);
        if (fieldSets == null) {
            return;
        }
        this.fieldSets.removeAll(fieldSets);
    }

    private static void initFieldSet(FieldSet fieldSet, Bundle originBundle) throws StaticDefinitionsRegistryException {
        if (fieldSet.getPriority() == null) {
            fieldSet.setPriority(1.);
        }

        fieldSet.setLabelKey(ContentEditorUtils.getLabelKey(fieldSet.getLabelKey(), originBundle));
        fieldSet.setDescriptionKey(ContentEditorUtils.getLabelKey(fieldSet.getDescriptionKey(), originBundle));

        for (Field field : fieldSet.getFields()) {
            try {
                if (field.getDeclaringNodeType() != null) {
                    ExtendedNodeType declaringNodeType = NodeTypeRegistry.getInstance().getNodeType(field.getDeclaringNodeType());
                    field.setExtendedPropertyDefinition(declaringNodeType.getPropertyDefinitionsAsMap().get(field.getName()));
                }
            } catch (NoSuchNodeTypeException e) {
                throw new StaticDefinitionsRegistryException("Error while loading field " + field.getName() + " from fieldset " + fieldSet.getName() + ": " + e.getMessage(), e);
            }

            field.setLabelKey(ContentEditorUtils.getLabelKey(field.getLabelKey(), originBundle));
            field.setDescriptionKey(ContentEditorUtils.getLabelKey(field.getDescriptionKey(), originBundle));
            field.setErrorMessageKey(ContentEditorUtils.getLabelKey(field.getErrorMessageKey(), originBundle));

            if (field.getValueConstraints() != null) {
                for (FieldValueConstraint valueConstraint : field.getValueConstraints()) {
                    valueConstraint.setDisplayValueKey(ContentEditorUtils.getLabelKey(valueConstraint.getDisplayValueKey(), originBundle));
                }
            }
        }
    }

    private static class StaticDefinitionsRegistryException extends Throwable {
        public StaticDefinitionsRegistryException(String message, Exception exception) {
            super(message, exception);
        }
    }
}
