package org.jahia.modules.contenteditor.utils;

import org.jahia.services.content.JCRCallback;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.JCRSessionWrapper;
import org.jahia.services.content.JCRTemplate;

import javax.jcr.RepositoryException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Reorders the children of a node for the current user, and tells which children the current user can move or see.
 */
public final class ChildrenOrderingUtils {

    // Jackrabbit checks MODIFY_CHILD_NODE_COLLECTION on the moved child, and Jahia maps it to these two privileges
    private static final String[] REORDER_PRIVILEGES = {"jcr:addChildNodes", "jcr:removeChildNodes"};
    private static final String WRITE_PERMISSION = "jcr:write";

    private ChildrenOrderingUtils() {
    }

    /**
     * Tells whether the current user can move this child among its siblings.
     *
     * @param child a child node, read with the session of the current user
     * @return true when {@code orderBefore} accepts this child as its source
     */
    public static boolean canBeReordered(JCRNodeWrapper child) {
        for (String privilege : REORDER_PRIVILEGES) {
            if (!child.hasPermission(privilege)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Puts the children in the requested order. A child that the current user cannot move keeps its position,
     * and the other requested children fill the remaining positions.
     *
     * @param parent the parent node, read with the session of the current user
     * @param names  names of the children, in the requested order
     * @throws IllegalArgumentException when a name is unknown or repeated
     */
    public static void reorderMovableChildren(JCRNodeWrapper parent, List<String> names) throws RepositoryException {
        List<String> current = new ArrayList<>();
        Set<String> locked = new HashSet<>();
        for (JCRNodeWrapper child : parent.getNodes()) {
            current.add(child.getName());
            if (!canBeReordered(child)) {
                locked.add(child.getName());
            }
        }
        List<String> target = ChildrenReorderPlanner.targetOrder(current, names, locked);
        for (ChildrenReorderPlanner.Move move : ChildrenReorderPlanner.plan(current, target, locked)) {
            parent.orderBefore(move.getSource(), move.getDestination());
        }
    }

    /**
     * Counts the children of the given types that the current user cannot read.
     *
     * @param parent the parent node, read with the session of the current user
     * @param types  node types of the children to count
     * @return the number of such children, or 0 when the current user cannot write the parent
     */
    public static int countHiddenChildren(JCRNodeWrapper parent, List<String> types) throws RepositoryException {
        if (!parent.hasPermission(WRITE_PERMISSION)) {
            return 0;
        }
        JCRSessionWrapper userSession = parent.getSession();
        return JCRTemplate.getInstance().doExecuteWithSystemSessionAsUser(null, userSession.getWorkspace().getName(), userSession.getLocale(),
            (JCRCallback<Integer>) systemSession -> {
                int count = 0;
                for (JCRNodeWrapper child : systemSession.getNodeByIdentifier(parent.getIdentifier()).getNodes()) {
                    if (isOfType(child, types) && !userSession.itemExists(child.getPath())) {
                        count++;
                    }
                }
                return count;
            });
    }

    private static boolean isOfType(JCRNodeWrapper child, List<String> types) throws RepositoryException {
        for (String type : types) {
            if (child.isNodeType(type)) {
                return true;
            }
        }
        return false;
    }
}
