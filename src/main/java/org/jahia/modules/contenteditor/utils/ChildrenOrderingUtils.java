package org.jahia.modules.contenteditor.utils;

import org.jahia.api.Constants;
import org.jahia.services.content.JCRCallback;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.JCRSessionWrapper;
import org.jahia.services.content.JCRTemplate;

import javax.jcr.AccessDeniedException;
import javax.jcr.ItemNotFoundException;
import javax.jcr.RepositoryException;
import java.util.ArrayList;
import java.util.Arrays;
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
    private static final String MANUALLY_ORDERABLE_MIXIN = "jmix:manuallyOrderable";
    // The types that the ordering list of the edit form shows, as childrenFilterTypes in ContentEditor.constants.js
    // and useEditFormDefinition.js list them: a page lists its sub-pages and menu items only
    private static final List<String> LISTED_TYPES = Arrays.asList(Constants.JAHIANT_CONTENT, MANUALLY_ORDERABLE_MIXIN, Constants.JAHIANT_PAGE, Constants.JAHIAMIX_NAVMENUITEM);
    private static final List<String> LISTED_PAGE_TYPES = Arrays.asList(Constants.JAHIANT_PAGE, Constants.JAHIAMIX_NAVMENUITEM);

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
     * @throws AccessDeniedException    when the current user cannot write the parent, or cannot read one of the
     *                                  children that the ordering list shows, whose position a move cannot keep
     */
    public static void reorderMovableChildren(JCRNodeWrapper parent, List<String> names) throws RepositoryException {
        if (!parent.hasPermission(WRITE_PERMISSION)) {
            throw new AccessDeniedException("The current user cannot write " + parent.getPath());
        }
        if (countUnreadableChildren(parent) > 0) {
            throw new AccessDeniedException("Some children of " + parent.getPath() + " are hidden from the current user, so a reorder cannot keep their positions");
        }
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
     * Counts the children that the ordering list would show, and that the current user cannot read.
     *
     * @param parent the parent node, read with the session of the current user
     * @return the number of such children, or 0 when the children of the parent have no order or when the current
     * user cannot write the parent
     */
    public static int countHiddenChildren(JCRNodeWrapper parent) throws RepositoryException {
        if (!parent.getPrimaryNodeType().hasOrderableChildNodes() || !parent.hasPermission(WRITE_PERMISSION)) {
            return 0;
        }
        return countUnreadableChildren(parent);
    }

    private static int countUnreadableChildren(JCRNodeWrapper parent) throws RepositoryException {
        JCRSessionWrapper userSession = parent.getSession();
        List<String> listedTypes = parent.isNodeType(Constants.JAHIANT_PAGE) ? LISTED_PAGE_TYPES : LISTED_TYPES;
        return JCRTemplate.getInstance().doExecuteWithSystemSessionAsUser(null, userSession.getWorkspace().getName(), userSession.getLocale(),
            (JCRCallback<Integer>) systemSession -> {
                int count = 0;
                for (JCRNodeWrapper child : systemSession.getNodeByIdentifier(parent.getIdentifier()).getNodes()) {
                    // A pending rename of the parent changes the paths of its children in the user session, so
                    // the identifier is what both sessions share
                    if (isListed(child, listedTypes) && !canRead(userSession, child.getIdentifier())) {
                        count++;
                    }
                }
                return count;
            });
    }

    private static boolean isListed(JCRNodeWrapper child, List<String> listedTypes) throws RepositoryException {
        for (String type : listedTypes) {
            if (child.isNodeType(type)) {
                return true;
            }
        }
        return false;
    }

    private static boolean canRead(JCRSessionWrapper userSession, String identifier) throws RepositoryException {
        try {
            userSession.getNodeByIdentifier(identifier);
            return true;
        } catch (ItemNotFoundException | AccessDeniedException e) {
            return false;
        }
    }
}
