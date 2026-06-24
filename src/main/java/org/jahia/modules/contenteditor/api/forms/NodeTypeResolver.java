package org.jahia.modules.contenteditor.api.forms;

import org.jahia.services.content.nodetypes.ExtendedNodeType;

import javax.jcr.RepositoryException;
import java.util.Collection;

/**
 * Strategy for resolving applied mixin types and performing node-type checks during form
 * generation. Providing a custom implementation gives callers full control over which mixins
 * are considered active and how type membership is evaluated, decoupling form structure
 * from the current state of any particular JCR node.
 *
 * <p>The default implementation, {@link JcrNodeTypeResolver}, delegates directly to a
 * {@code JCRNodeWrapper} and reflects the current state of the node in the repository.
 * External modules can supply alternative implementations and pass them via
 * {@link EditorFormService#getEditorForm}.
 */
public interface NodeTypeResolver {

    /**
     * Returns the mixin types that should be treated as applied for this context.
     * Mirrors {@code JCRNodeWrapper.getMixinNodeTypes()} — returns directly applied mixins only,
     * not their supertypes.
     */
    Collection<ExtendedNodeType> getAppliedMixins() throws RepositoryException;

    /**
     * Returns {@code true} if the resolved type set includes {@code typeName} or any of its
     * supertypes. Mirrors {@code JCRNodeWrapper.isNodeType(String)}.
     *
     * @param typeName the name of a node type.
     */
    boolean isNodeType(String typeName) throws RepositoryException;
}
