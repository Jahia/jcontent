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
package org.jahia.modules.contenteditor.api.forms.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.jahia.modules.contenteditor.api.forms.DefinitionRegistryItem;
import org.jahia.services.content.nodetypes.ExtendedNodeType;
import org.jahia.services.content.nodetypes.NodeTypeRegistry;
import org.osgi.framework.Bundle;

import javax.jcr.nodetype.NoSuchNodeTypeException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Stream;

/**
 * Represents the definition of an editor form, including the ordering of sections
 */
public class Form implements DefinitionRegistryItem {
    private String nodeTypeName;
    private ExtendedNodeType nodeType;
    private Condition condition;
    private String labelKey;
    private String descriptionKey;
    private String label;
    private String description;
    private Boolean hasPreview;
    private Boolean showAdvancedMode;
    private List<Section> sections = new ArrayList<>();

    // Registry form
    private Double priority;
    private Bundle originBundle;
    private URL fileUrl;

    // Merged form
    private List<DefinitionRegistryItem> mergedItems;

    public Form() {
    }

    public Form(List<DefinitionRegistryItem> mergedItems) {
        this.mergedItems = mergedItems;

        for (DefinitionRegistryItem current : mergedItems) {
            mergeWith(current);
        }
    }

    public ExtendedNodeType getNodeType() {
        if (nodeType == null) {
            try {
                nodeType = NodeTypeRegistry.getInstance().getNodeType(nodeTypeName);
            } catch (NoSuchNodeTypeException e) {
                // Not found
            }
        }

        return nodeType;
    }

    public String getNodeTypeName() {
        return nodeTypeName;
    }

    public void setNodeType(String nodeTypeName) {
        this.nodeTypeName = nodeTypeName;
    }

    @Override
    public Condition getCondition() {
        return condition;
    }

    public void setCondition(Condition condition) {
        this.condition = condition;
    }

    public String getLabelKey() {
        return labelKey;
    }

    public void setLabelKey(String labelKey) {
        this.labelKey = labelKey;
    }

    public String getDescriptionKey() {
        return descriptionKey;
    }

    public void setDescriptionKey(String descriptionKey) {
        this.descriptionKey = descriptionKey;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean hasPreview() {
        return hasPreview;
    }

    public void setHasPreview(Boolean hasPreview) {
        this.hasPreview = hasPreview;
    }

    public List<Section> getSections() {
        return sections;
    }

    public void setSections(List<Section> sections) {
        this.sections = sections;
    }

    public Double getPriority() {
        return priority;
    }

    public void setPriority(Double priority) {
        this.priority = priority;
    }

    public Boolean getShowAdvancedMode() {
        return showAdvancedMode;
    }

    public void setShowAdvancedMode(Boolean showAdvancedMode) {
        this.showAdvancedMode = showAdvancedMode;
    }

    @JsonIgnore
    public Bundle getOriginBundle() {
        return originBundle;
    }

    public void setOriginBundle(Bundle originBundle) {
        this.originBundle = originBundle;
    }

    @JsonIgnore
    public URL getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(URL fileUrl) {
        this.fileUrl = fileUrl;
    }

    public List<DefinitionRegistryItem> getMergedItems() {
        return mergedItems;
    }

    public void initializeLabel(Locale uiLocale) {
        ExtendedNodeType nodeType = getNodeType();
        label = label == null ? nodeType.getLabel(uiLocale) : label;
        description = description == null ? nodeType.getDescription(uiLocale) : descriptionKey;
    }

    public void mergeWith(DefinitionRegistryItem item) {
        if (item instanceof Form) {
            mergeWith((Form) item);
        } else if (item instanceof FieldSet) {
            mergeWith((FieldSet) item);
        }
    }

    public void mergeWith(Form otherForm) {
        setNodeType(nodeTypeName == null ? otherForm.getNodeTypeName() : nodeTypeName);

        setHasPreview(otherForm.hasPreview() != null ? otherForm.hasPreview() : hasPreview);
        setShowAdvancedMode(otherForm.getShowAdvancedMode() != null ? otherForm.getShowAdvancedMode() : showAdvancedMode);
        mergeSections(otherForm.getSections());
    }

    public void mergeWith(FieldSet otherFieldSet) {
        for (Section section : sections) {
            for (FieldSet fieldSet : section.getFieldSets()) {
                // Merge with all field set with matching name
                if (fieldSet.getName().equals(otherFieldSet.getName())) {
                    fieldSet.mergeWith(otherFieldSet, this);
                }
            }
        }
    }

    private void mergeSections(List<Section> otherSections) {
        for (Section otherSection : otherSections) {
            Section mergedSection = sections.stream().filter(section -> section.getName().equals(otherSection.getName())).findFirst().orElseGet(Section::new);
            mergedSection.mergeWith(otherSection, this);
            if (!sections.contains(mergedSection)) {
                sections.add(mergedSection);
            }
        }
    }

    /**
     * Finds a field already placed somewhere in this form and takes it out, so the caller can
     * re-home it in the fieldset being merged. A property redefined further down a hierarchy is
     * the same field as the one already placed and has to move, rather than appear twice.
     *
     * <p>One case has to be left alone: two fieldsets that are both contributed by mixins
     * extending the edited type. Those are the dynamic fieldsets a reader switches on and off, and
     * sibling mixins routinely inherit the same property from a shared supertype -- same declaring
     * type, same name, so {@link Field#getKey()} is identical for each of them. Taking that field
     * out of one sibling to hand it to the next leaves every sibling but one missing a field it
     * genuinely carries, which is #2746. Siblings keep their own copy instead.
     *
     * <p>The exception is deliberately no wider than that. A static form definition still claims a
     * field from a dynamic fieldset, which is how the SEO fieldset gathers the jmix:seoHtmlHead
     * properties instead of them showing up twice.
     *
     * <p>Only a generated field can be a sibling's own inherited copy, and a generated field is one
     * that carries a JCR property definition. A field arriving from a static form definition
     * carries none: it is an override looking for the generated field to settle on, and it names
     * the section it wants that field to end up in. Refusing it the field it is overriding does not
     * leave the form unchanged -- the caller falls back to a blank {@code new Field()}, so the form
     * ends up with the real field in its generated section AND a twin in the section the definition
     * asked for, carrying nothing but the override. That twin has no property definition, no
     * required type and no value constraints, which is what took the editor down on a content
     * folder: jcontent's own jmix:contributeMode definition re-homes j:contributeTypes into the
     * listOrdering section, and the twin left behind had no constraint list for the selector to
     * read. So the protection applies only to a generated field claiming another generated field.
     *
     * @param target the fieldset the field is being merged into. Never protected from itself, so
     *               merging a static definition into a dynamic fieldset still updates the field in
     *               place instead of duplicating it.
     */
    public Optional<Field> findAndRemoveField(Field otherField, FieldSet target) {
        boolean incomingIsGenerated = otherField.getExtendedPropertyDefinition() != null;
        return sections.stream().flatMap(section ->
            section.getFieldSets().stream()
                .filter(fieldSet -> fieldSet == target || !(incomingIsGenerated && keepsItsOwnFields(fieldSet) && keepsItsOwnFields(target)))
                .flatMap(fieldSet -> {
                Optional<Field> foundField = fieldSet.getFields().stream().filter(field -> otherField.getExtendedPropertyDefinition() != null ? field.getKey().equals(otherField.getKey()) : field.getName().equals(otherField.getName())).findFirst();
                if (foundField.isPresent()) {
                    fieldSet.getFields().remove(foundField.get());
                    return Stream.of(foundField.get());
                }
                return Stream.of();
        })).findFirst();
    }

    /**
     * Whether a fieldset holds on to the fields it was generated with, rather than lending them to
     * whoever merges next. True of a fieldset generated from a mixin that extends another type --
     * the same test EditorFormServiceImpl uses to decide a fieldset is dynamic.
     */
    private static boolean keepsItsOwnFields(FieldSet fieldSet) {
        ExtendedNodeType fieldSetNodeType = fieldSet.getNodeType();
        return fieldSetNodeType != null && !fieldSetNodeType.getMixinExtends().isEmpty();
    }
}
