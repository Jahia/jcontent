package org.jahia.modules.contenteditor.api.forms;

import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.nodetypes.ExtendedNodeType;

import javax.jcr.RepositoryException;
import java.util.Arrays;
import java.util.Collection;

/**
 * {@link NodeTypeResolver} backed by a live JCR node. Both {@link #getAppliedMixins()} and
 * {@link #isNodeType(String)} delegate directly to the underlying {@link JCRNodeWrapper},
 * so the form reflects the current state of a given node in the repository.
 */
public class JcrNodeTypeResolver implements NodeTypeResolver {

    private final JCRNodeWrapper node;

    JcrNodeTypeResolver(JCRNodeWrapper node) {
        this.node = node;
    }

    @Override
    public Collection<ExtendedNodeType> getAppliedMixins() throws RepositoryException {
        return Arrays.asList(node.getMixinNodeTypes());
    }

    @Override
    public boolean isNodeType(String typeName) throws RepositoryException {
        return node.isNodeType(typeName);
    }
}
