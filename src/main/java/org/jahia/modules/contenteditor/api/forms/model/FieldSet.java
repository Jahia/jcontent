package org.jahia.modules.contenteditor.api.forms.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.apache.commons.lang.StringEscapeUtils;
import org.apache.commons.lang.StringUtils;
import org.jahia.modules.contenteditor.api.forms.DefinitionRegistryItem;
import org.jahia.modules.contenteditor.api.forms.Ranked;
import org.jahia.services.content.JCRContentUtils;
import org.jahia.services.content.decorator.JCRSiteNode;
import org.jahia.services.content.nodetypes.ExtendedNodeType;
import org.jahia.services.content.nodetypes.NodeTypeRegistry;
import org.osgi.framework.Bundle;
import org.owasp.html.Sanitizers;

import javax.jcr.nodetype.NoSuchNodeTypeException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import static org.jahia.modules.contenteditor.api.forms.EditorFormServiceImpl.resolveResourceKey;

public class FieldSet implements DefinitionRegistryItem, Ranked {
    private String name;
    private ExtendedNodeType nodeType;
    private Condition condition;
    private String labelKey;
    private String descriptionKey;
    private String label;
    private String description;
    private String requiredPermission;
    private Boolean hide;
    private Boolean readOnly;
    private Boolean activatedOnCreate = false;
    private Double rank;
    private List<Field> fields = new ArrayList<>();
    private Double priority;
    private Bundle originBundle;

    private boolean dynamic = false;
    private boolean hasEnableSwitch = false;
    private boolean activated = true;
    private boolean visible = true;
    // Fieldset will be included in section even if it is invisible
    private Boolean alwaysPresent;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    @Deprecated
    public void setDisplayName(String displayName) {
        this.label = displayName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDescriptionKey() {
        return descriptionKey;
    }

    public void setDescriptionKey(String descriptionKey) {
        this.descriptionKey = descriptionKey;
    }

    public String getRequiredPermission() {
        return requiredPermission;
    }

    public void setRequiredPermission(String requiredPermission) {
        this.requiredPermission = requiredPermission;
    }

    public Boolean isHide() {
        return hide;
    }

    public void setHide(Boolean hide) {
        this.hide = hide;
    }

    @Deprecated
    public void setRemoved(Boolean removed) {
        this.hide = removed;
    }

    public Boolean isReadOnly() {
        return readOnly;
    }

    public void setReadOnly(Boolean readOnly) {
        this.readOnly = readOnly;
    }

    public Boolean isActivatedOnCreate() {
        return activatedOnCreate;
    }

    public void setActivatedOnCreate(Boolean activatedOnCreate) {
        this.activatedOnCreate = activatedOnCreate;
    }

    public Double getRank() {
        return rank;
    }

    public void setRank(Double rank) {
        this.rank = rank;
    }

    public List<Field> getFields() {
        return fields;
    }

    public void setFields(List<Field> fields) {
        this.fields = fields;
    }

    @Override
    public Double getPriority() {
        return priority;
    }

    public void setPriority(Double priority) {
        this.priority = priority;
    }

    @JsonIgnore
    public Bundle getOriginBundle() {
        return originBundle;
    }

    public void setOriginBundle(Bundle originBundle) {
        this.originBundle = originBundle;
    }

    @JsonIgnore
    public boolean isDynamic() {
        return dynamic;
    }

    public void setDynamic(boolean dynamic) {
        this.dynamic = dynamic;
    }

    @JsonIgnore
    public boolean isHasEnableSwitch() {
        return hasEnableSwitch;
    }

    public void setHasEnableSwitch(boolean hasEnableSwitch) {
        this.hasEnableSwitch = hasEnableSwitch;
    }

    @JsonIgnore
    public boolean isActivated() {
        return activated;
    }

    public void setActivated(boolean activated) {
        this.activated = activated;
    }

    public boolean isVisible() {
        return visible;
    }

    public void setVisible(boolean visible) {
        this.visible = visible;
    }

    public Boolean isAlwaysPresent() {
        return alwaysPresent;
    }

    public void setAlwaysPresent(Boolean alwaysPresent) {
        this.alwaysPresent = alwaysPresent;
    }

    @JsonIgnore
    public ExtendedNodeType getNodeType() {
        if (nodeType == null) {
            try {
                nodeType = NodeTypeRegistry.getInstance().getNodeType(name);
            } catch (NoSuchNodeTypeException e) {
                // Not found
            }
        }

        return nodeType;
    }

    public void initializeLabel(Locale uiLocale, JCRSiteNode site) {
        label = label == null && labelKey != null ? resolveResourceKey(labelKey, uiLocale, site) : label;
        description = description == null && descriptionKey != null ? resolveResourceKey(descriptionKey, uiLocale, site) : description;

        ExtendedNodeType nodeType = getNodeType();
        if (nodeType != null) {
            String prefix = nodeType.getTemplatePackage() != null ? nodeType.getTemplatePackage().getBundle().getSymbolicName() + ":" : "";
            String key =  JCRContentUtils.replaceColon(nodeType.getName());
            label = StringUtils.isEmpty(label) ? StringEscapeUtils.unescapeHtml(resolveResourceKey(prefix + key, uiLocale, site)) : label;
            description = StringUtils.isEmpty(description) ? Sanitizers.FORMATTING.sanitize(resolveResourceKey(prefix + key + ".ui.tooltip", uiLocale, site)) : description;

            label = StringUtils.isEmpty(label) ? StringUtils.substringAfter(nodeType.getName(), ":") : label;
            description = StringUtils.isEmpty(description) ? Sanitizers.FORMATTING.sanitize(resolveResourceKey(prefix + key + "_description", uiLocale, site)) : description;
        }
    }


    private Field addField() {
        Field f = new Field();
        fields.add(f);
        f.setRank((double) fields.size());
        return f;
    }

    public void mergeWith(FieldSet otherFieldSet, Form form) {
        setName(name == null ? (otherFieldSet.getName().equals("<main>") ? form.getNodeTypeName() : otherFieldSet.getName()) : name);

        setLabel(otherFieldSet.getLabelKey() != null || otherFieldSet.getLabel() != null ? otherFieldSet.getLabel() : label);
        setLabelKey(otherFieldSet.getLabelKey() != null || otherFieldSet.getLabel() != null ? otherFieldSet.getLabelKey() : labelKey);
        setDescription(otherFieldSet.getDescriptionKey() != null || otherFieldSet.getDescription() != null ? otherFieldSet.getDescription() : description);
        setDescriptionKey(otherFieldSet.getDescriptionKey() != null || otherFieldSet.getDescription() != null ? otherFieldSet.getDescriptionKey() : descriptionKey);
        setRequiredPermission(otherFieldSet.getRequiredPermission() != null ? otherFieldSet.getRequiredPermission() : requiredPermission);
        setHide(otherFieldSet.isHide() != null ? otherFieldSet.isHide() : hide);
        setReadOnly(otherFieldSet.isReadOnly() != null ? otherFieldSet.isReadOnly() : readOnly);
        setActivatedOnCreate(otherFieldSet.isActivatedOnCreate() != null ? otherFieldSet.isActivatedOnCreate() : activatedOnCreate);
        setRank(otherFieldSet.getRank() != null ? otherFieldSet.getRank() : rank);
        setAlwaysPresent(otherFieldSet.isAlwaysPresent() != null ? otherFieldSet.isAlwaysPresent() : alwaysPresent);
        mergeFields(otherFieldSet.getFields(), form);
    }

    private void mergeFields(List<Field> otherFields, Form form) {
        for (Field otherField : otherFields) {
            Field existingField = form.findAndRemoveField(otherField).orElseGet(this::addField);
            existingField.mergeWith(otherField);
            if (!fields.contains(existingField)) {
                fields.add(existingField);
            }
        }
    }

}
