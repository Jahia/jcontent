package org.jahia.modules.contenteditor.graphql.api.forms;

import graphql.annotations.annotationTypes.GraphQLDeprecate;
import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import org.jahia.modules.contenteditor.api.forms.DefinitionRegistryItem;
import org.jahia.modules.contenteditor.api.forms.model.FieldSet;
import org.jahia.modules.contenteditor.api.forms.model.Form;

@GraphQLDescription("Override item")
public class GqlMergedItem {
    private final DefinitionRegistryItem item;

    public GqlMergedItem(DefinitionRegistryItem item) {
        this.item = item;
    }

    @GraphQLField
    @GraphQLDescription("File name and path")
    public String getFilename() {
        return item.getFileUrl().getFile();
    }

    @GraphQLField
    @GraphQLDescription("Name of the bundle owning this file")
    public String getBundleName() {
        return item.getOriginBundle().getSymbolicName();
    }


    @GraphQLField
    @GraphQLDescription("Override priority")
    public double getPriority() {
        return item.getPriority();
    }

    @GraphQLField
    @GraphQLDescription("Conditions set on this form/fieldset")
    public GqlCondition getCondition() {
        return new GqlCondition();
    }

    @GraphQLField
    @GraphQLDescription("Get form detail, if item is a form")
    public GqlEditorForm getForm() {
        if (item instanceof Form) {
            return new GqlEditorForm((Form)item);
        }

        return null;
    }

    @GraphQLField
    @GraphQLDescription("Get field set detail, if item is a field set")
    public GqlEditorFormFieldSet getFieldSet() {
        if (item instanceof FieldSet) {
            return new GqlEditorFormFieldSet((FieldSet)item);
        }

        return null;
    }

    @GraphQLDescription("Condition for override item")
    public class GqlCondition {
        @GraphQLField
        @GraphQLDescription("Item will apply only on this nodetype")
        public String getNodeType() {
            return item.getConditionNodeTypeName();
        }

        @GraphQLField
        @GraphQLDescription("Item will apply only if user has permissions")
        public String getWithPermission() {
            return item.getCondition() != null ? item.getCondition().getWithPermission() : null;
        }

        @GraphQLField
        @GraphQLDescription("Item will apply only if user has not permissions")
        public String getWithoutPermission() {
            return item.getCondition() != null ? item.getCondition().getWithoutPermission() : null;
        }

        @GraphQLField
        @GraphQLDescription("Item will apply only if node has orderable children")
        public Boolean getOrderable() {
            return item.getCondition() != null ? item.getCondition().getOrderable() : null;
        }

    }
}
