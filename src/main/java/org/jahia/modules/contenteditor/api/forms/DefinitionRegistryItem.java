package org.jahia.modules.contenteditor.api.forms;

import org.jahia.services.content.nodetypes.ExtendedNodeType;
import org.osgi.framework.Bundle;

import javax.jcr.nodetype.NoSuchNodeTypeException;

public interface DefinitionRegistryItem {
    Double getPriority();

    ExtendedNodeType getNodeType();

    Bundle getOriginBundle();
}
