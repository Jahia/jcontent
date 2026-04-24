import org.jahia.services.content.JCRCallback
import org.jahia.services.content.JCRSessionWrapper
import org.jahia.services.content.JCRTemplate

import javax.jcr.RepositoryException
import javax.jcr.Value

PERMISSION = "jContentAccordions"
PROP = "j:permissionNames"
CHILD = "currentSite-access"

/**
 * Remove a value from a multi-valued property if present.
 * Does nothing if the property is missing or the value isn't there.
 * Returns true if a change was made.
 */
boolean removeValueFromMultiProp(node, String propName, String valueToRemove) {
    if (!node.hasProperty(propName)) {
        return false
    }
    Value[] current = node.getProperty(propName).getValues()
    String[] kept = current.findAll { it.getString() != valueToRemove }*.getString() as String[]
    if (kept.length < current.length) {
        node.setProperty(propName, kept)
        return true
    }

    return false
}

/**
 * Ensure a value exists in a multi-valued property. Returns true if added.
 */
def ensureValueInMultiProp(node, String propName, String valueToAdd) {
    if (node.hasProperty(propName)) {
        def values = node.getProperty(propName).getValues()
        if (values.any { it.getString() == valueToAdd }) {
            return false
        }
        node.getProperty(propName).addValue(valueToAdd)
    } else {
        node.setProperty(propName, [valueToAdd] as String[])
    }
    return true
}

def fixAccordionPermissionLocation() {
    JCRTemplate.getInstance().doExecuteWithSystemSession(new JCRCallback<Void>() {

        @Override
        Void doInJCR(JCRSessionWrapper session) throws RepositoryException {
            log.info("Fixing misplaced ${PERMISSION} permission on roles...")
            def roleNames = List.of("editor", "reviewer", "translator")
            boolean anyChange = false

            roleNames.forEach(roleName -> {
                try {
                    def rolePath = "/roles/" + roleName
                    if (!session.nodeExists(rolePath)) {
                        log.warn("Role node not found: " + rolePath)
                        return
                    }
                    def role = session.getNode(rolePath)

                    // 1. Remove from the role node itself (wrong location)
                    if (removeValueFromMultiProp(role, PROP, PERMISSION)) {
                        log.info("Removed misplaced ${PERMISSION} from role node: ${roleName}")
                        anyChange = true
                    }

                    // 2. Ensure it's on currentSite-access (correct location)
                    if (!role.hasNode(CHILD)) {
                        log.warn("${CHILD} child not found under role: " + roleName + " — cannot relocate permission")
                        return
                    }
                    def siteAccess = role.getNode(CHILD)
                    if (ensureValueInMultiProp(siteAccess, PROP, PERMISSION)) {
                        log.info("Added ${PERMISSION} to ${roleName}/${CHILD}")
                        anyChange = true
                    } else {
                        log.info("${PERMISSION} already present on ${roleName}/${CHILD} — no change")
                    }
                } catch (RepositoryException e) {
                    log.error("Error fixing permissions for role: " + roleName, e)
                }
            })

            if (anyChange) {
                session.save()
                log.info("Permission relocation patch applied.")
            } else {
                log.info("No changes required — permissions already in correct location.")
            }
            return null
        }
    })
}

fixAccordionPermissionLocation()
