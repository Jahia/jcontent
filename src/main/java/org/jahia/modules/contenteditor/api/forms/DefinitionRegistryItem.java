package org.jahia.modules.contenteditor.api.forms;

import org.jahia.modules.contenteditor.api.forms.model.Condition;
import org.jahia.services.content.nodetypes.ExtendedNodeType;
import org.osgi.framework.Bundle;

import java.net.URL;

public interface DefinitionRegistryItem {
    Double getPriority();

    ExtendedNodeType getNodeType();

    Condition getCondition();

    Bundle getOriginBundle();

    URL getFileUrl();

    default String getConditionNodeTypeName() {
        if (getCondition() != null && getCondition().getNodeType() != null) {
            return getCondition().getNodeType();
        }

        if (getNodeType() != null) {
            return getNodeType().getName();
        }

        return null;
    }
}
