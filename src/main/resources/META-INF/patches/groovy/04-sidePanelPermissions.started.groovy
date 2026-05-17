import org.jahia.services.content.JCRCallback
import org.jahia.services.content.JCRSessionWrapper
import org.jahia.services.content.JCRTemplate

import javax.jcr.NodeIterator
import javax.jcr.RepositoryException
import javax.jcr.Value

def newPermissions = ["canSeePreviewTab", "canSeeDetailsTab", "canSeeHistoryTab"]
def rootRoleNames = ["editor", "reviewer", "translator"]
def PROP = "j:permissionNames"
def CHILD = "currentSite-access"

/**
 * Ensure a value exists in a multi-valued property. Returns true if added.
 */
def ensureValueInMultiProp(node, String propName, String valueToAdd) {
    if (node.hasProperty(propName)) {
        Value[] values = node.getProperty(propName).getValues()
        if (values.any { it.getString() == valueToAdd }) {
            return false
        }
        node.getProperty(propName).addValue(valueToAdd)
    } else {
        node.setProperty(propName, [valueToAdd] as String[])
    }
    return true
}

/**
 * Recursively adds the given permissions to the currentSite-access child of a role node
 * and all of its child role nodes (sub-roles inherit from parent but each needs its own entry).
 */
def addPermissionsToRoleTree(roleNode, List<String> permissions, String prop, String child) {
    def rolePath = roleNode.getPath()

    // Add permissions to the currentSite-access child of this role
    if (roleNode.hasNode(child)) {
        def siteAccess = roleNode.getNode(child)
        permissions.forEach(permission -> {
            if (ensureValueInMultiProp(siteAccess, prop, permission)) {
                log.info("Added '${permission}' to ${rolePath}/${child}")
            } else {
                log.info("'${permission}' already present on ${rolePath}/${child} — skipped")
            }
        })
    } else {
        log.warn("'${child}' child not found under role: ${rolePath} — skipping")
    }

    // Recurse into child roles (sub-roles that extend this role)
    NodeIterator children = roleNode.getNodes()
    while (children.hasNext()) {
        def childNode = children.nextNode()
        if (childNode.getName() == child) {
            continue // skip the currentSite-access node itself
        }
        if (childNode.isNodeType("jnt:role")) {
            addPermissionsToRoleTree(childNode, permissions, prop, child)
        }
    }
}

def addSidePanelPermissions() {
    JCRTemplate.getInstance().doExecuteWithSystemSession(new JCRCallback<Void>() {

        @Override
        Void doInJCR(JCRSessionWrapper session) throws RepositoryException {
            log.info("Adding side panel tab permissions (${newPermissions.join(', ')}) to role trees: ${rootRoleNames.join(', ')}...")
            boolean anyChange = false

            rootRoleNames.forEach(roleName -> {
                try {
                    def rolePath = "/roles/" + roleName
                    if (!session.nodeExists(rolePath)) {
                        log.warn("Root role node not found: ${rolePath} — skipping")
                        return
                    }
                    addPermissionsToRoleTree(session.getNode(rolePath), newPermissions, PROP, CHILD)
                    anyChange = true
                } catch (RepositoryException e) {
                    log.error("Error updating side panel permissions for role: ${roleName}", e)
                }
            })

            if (anyChange) {
                session.save()
                log.info("Side panel permissions patch applied.")
            } else {
                log.info("No changes were made.")
            }
            return null
        }
    })
}

addSidePanelPermissions()
