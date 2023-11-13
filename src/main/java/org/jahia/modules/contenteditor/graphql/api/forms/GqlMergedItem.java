package org.jahia.modules.contenteditor.graphql.api.forms;

import graphql.annotations.annotationTypes.GraphQLField;
import org.jahia.modules.contenteditor.api.forms.DefinitionRegistryItem;
import org.jahia.modules.contenteditor.api.forms.model.FieldSet;
import org.jahia.modules.contenteditor.api.forms.model.Form;

public class GqlMergedItem {
    private final DefinitionRegistryItem item;

    public GqlMergedItem(DefinitionRegistryItem item) {
        this.item = item;
    }

    @GraphQLField
    public String getFilename() {
        return item.getFileUrl().getFile();
    }

    @GraphQLField
    public String getBundleName() {
        return item.getOriginBundle().getSymbolicName();
    }


    @GraphQLField
    public double getPriority() {
        return item.getPriority();
    }

    @GraphQLField
    public GqlCondition getCondition() {
        return new GqlCondition();
    }

    @GraphQLField
    public GqlEditorForm getForm() {
        if (item instanceof Form) {
            return new GqlEditorForm((Form)item);
        }

        return null;
    }

    @GraphQLField
    public GqlEditorFormFieldSet getFieldSet() {
        if (item instanceof FieldSet) {
            return new GqlEditorFormFieldSet((FieldSet)item);
        }

        return null;
    }

    public class GqlCondition {
        @GraphQLField
        public String getNodeType() {
            return item.getConditionNodeTypeName();
        }

        @GraphQLField
        public String getWithPermission() {
            return item.getCondition() != null ? item.getCondition().getWithPermission() : null;
        }

        @GraphQLField
        public String getWithoutPermission() {
            return item.getCondition() != null ? item.getCondition().getWithoutPermission() : null;
        }

        @GraphQLField
        public Boolean getOrderable() {
            return item.getCondition() != null ? item.getCondition().getOrderable() : null;
        }

    }
}
