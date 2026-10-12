package org.jahia.modules.contenteditor.graphql.extensions;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;
import graphql.annotations.annotationTypes.GraphQLNonNull;
import graphql.annotations.annotationTypes.GraphQLTypeExtension;
import org.jahia.modules.contenteditor.utils.ChildrenOrderingUtils;
import org.jahia.modules.graphql.provider.dxm.DataFetchingException;
import org.jahia.modules.graphql.provider.dxm.node.GqlJcrNodeMutation;
import org.jahia.modules.graphql.provider.dxm.node.GqlJcrWrongInputException;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.nodetypes.ExtendedPropertyDefinition;

import javax.jcr.Node;
import javax.jcr.NodeIterator;
import javax.jcr.Property;
import javax.jcr.PropertyIterator;
import javax.jcr.RepositoryException;
import javax.jcr.Value;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * Content Editor JCR Node mutation extension
 */
@GraphQLTypeExtension(GqlJcrNodeMutation.class)
public class JCRNodeMutationContentEditorExtensions {

    private static final String RESIDUAL = "*";

    private final GqlJcrNodeMutation mutation;

    public JCRNodeMutationContentEditorExtensions(GqlJcrNodeMutation mutation) {
        this.mutation = mutation;
    }

    @GraphQLField
    @GraphQLName("reorderMovableChildren")
    @GraphQLDescription("Reorders the children in the requested order. A child that the current user cannot move keeps its position, and the other children fill the remaining positions. Fails when the current user cannot write the node, or cannot read one of the children that the ordering list of the edit form shows.")
    public boolean reorderMovableChildren(@GraphQLName("names") @GraphQLNonNull @GraphQLDescription("Names of the children, in the requested order") List<String> names) {
        try {
            ChildrenOrderingUtils.reorderMovableChildren(mutation.jcrNode, names);
            return true;
        } catch (IllegalArgumentException e) {
            throw new GqlJcrWrongInputException(e.getMessage() + " under " + mutation.jcrNode.getPath());
        } catch (RepositoryException e) {
            throw new DataFetchingException(e);
        }
    }

    /**
     * Removes then adds mixins, and keeps the value of every property the node still defines
     * afterwards, in every language.
     *
     * <p>Removing a mixin deletes the properties no remaining type defines, on the node and on each
     * translation node. When a mixin added next defines one of them again -- two mixins sharing a
     * supertype, or a mixin replaced by one it extends -- its values would otherwise be gone in
     * every language the caller does not write back. A value the removal deleted is restored when
     * the node defines the property by name through the same declaring type as before, over the
     * default an autocreated definition has put back. A property two mixins each declare on their
     * own is two properties, as it is to the editor form (see Field#getKey), so it is not carried.
     * Adding first is no alternative: adding a mixin the node already is a type of does nothing.
     */
    @GraphQLField
    @GraphQLDescription("Removes then adds mixin types on the current node, keeping the values of the properties the node still defines")
    public Collection<String> switchMixins(
        @GraphQLName("remove") @GraphQLNonNull @GraphQLDescription("The mixin type names to remove") Collection<String> remove,
        @GraphQLName("add") @GraphQLNonNull @GraphQLDescription("The mixin type names to add") Collection<String> add) {
        JCRNodeWrapper node = mutation.jcrNode;
        try {
            List<StoredProperty> stored = remove.isEmpty() ? new ArrayList<>() : storedProperties(node);
            mutation.removeMixins(remove);
            List<StoredProperty> deleted = new ArrayList<>();
            for (StoredProperty property : stored) {
                if (!property.exists()) {
                    deleted.add(property);
                }
            }
            Collection<String> mixins = mutation.addMixins(add);
            for (StoredProperty property : deleted) {
                property.restore(node);
            }
            return mixins;
        } catch (RepositoryException e) {
            throw new DataFetchingException(e);
        }
    }

    private static List<StoredProperty> storedProperties(JCRNodeWrapper node) throws RepositoryException {
        List<StoredProperty> stored = new ArrayList<>();
        // The real node, because node.getProperties() also merges in the session language's translated properties.
        Node realNode = node.getRealNode();
        for (PropertyIterator properties = realNode.getProperties(); properties.hasNext(); ) {
            Property property = properties.nextProperty();
            if (!property.getDefinition().isProtected()) {
                addIfNamed(stored, node, realNode, property);
            }
        }
        for (NodeIterator translations = node.getI18Ns(); translations.hasNext(); ) {
            Node translation = translations.nextNode();
            for (PropertyIterator properties = translation.getProperties(); properties.hasNext(); ) {
                Property property = properties.nextProperty();
                // A translation node's own named properties (jcr:language...) are never removed.
                if (RESIDUAL.equals(property.getDefinition().getName())) {
                    addIfNamed(stored, node, translation, property);
                }
            }
        }
        return stored;
    }

    private static void addIfNamed(List<StoredProperty> stored, JCRNodeWrapper node, Node holder, Property property) throws RepositoryException {
        ExtendedPropertyDefinition definition = namedDefinition(node, property.getName(), property.getType(), property.isMultiple());
        if (definition != null) {
            stored.add(new StoredProperty(holder, property, definition.getDeclaringNodeType().getName()));
        }
    }

    /**
     * The definition the node gives a property by name, or null when only a residual definition
     * (or none) matches it.
     */
    private static ExtendedPropertyDefinition namedDefinition(JCRNodeWrapper node, String name, int type, boolean multiple) throws RepositoryException {
        ExtendedPropertyDefinition definition = node.getApplicablePropertyDefinition(name, type, multiple);
        return definition != null && !RESIDUAL.equals(definition.getName()) ? definition : null;
    }

    /**
     * One property value, on the node or on one of its translation nodes, with the type that
     * declared it.
     */
    private static final class StoredProperty {
        private final Node holder;
        private final String name;
        private final int type;
        private final boolean multiple;
        private final String declaringType;
        private final Value value;
        private final Value[] values;

        private StoredProperty(Node holder, Property property, String declaringType) throws RepositoryException {
            this.holder = holder;
            this.name = property.getName();
            this.type = property.getType();
            this.multiple = property.isMultiple();
            this.declaringType = declaringType;
            this.value = multiple ? null : property.getValue();
            this.values = multiple ? property.getValues() : null;
        }

        boolean exists() throws RepositoryException {
            return holder.hasProperty(name);
        }

        void restore(JCRNodeWrapper node) throws RepositoryException {
            ExtendedPropertyDefinition definition = namedDefinition(node, name, type, multiple);
            if (definition == null || !definition.getDeclaringNodeType().getName().equals(declaringType)) {
                return;
            }
            if (multiple) {
                holder.setProperty(name, values);
            } else {
                holder.setProperty(name, value);
            }
        }
    }
}
