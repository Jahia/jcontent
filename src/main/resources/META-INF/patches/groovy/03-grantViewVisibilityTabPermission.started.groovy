import org.jahia.services.content.JCRCallback
import org.jahia.services.content.JCRSessionWrapper
import org.jahia.services.content.JCRTemplate

import javax.jcr.NodeIterator
import javax.jcr.RepositoryException

SOURCE_PERMISSION = "viewSeoTab"
TARGET_PERMISSION = "viewVisibilityTab"
PROP = "j:permissionNames"
ROLES_ROOT = "/roles"

def hasPermission(node, String propName, String value) {
    if (!node.hasProperty(propName)) {
        return false
    }
    return node.getProperty(propName).getValues().any { it.getString() == value }
}

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

def visit(node, Closure work) {
    work(node)
    NodeIterator it = node.getNodes()
    while (it.hasNext()) {
        visit(it.nextNode(), work)
    }
}

def grantViewVisibilityWhereSeoExists() {
    JCRTemplate.getInstance().doExecuteWithSystemSession(new JCRCallback<Void>() {

        @Override
        Void doInJCR(JCRSessionWrapper session) throws RepositoryException {
            if (!session.nodeExists(ROLES_ROOT)) {
                log.warn("${ROLES_ROOT} not found — skipping ${TARGET_PERMISSION} migration")
                return null
            }
            log.info("Granting ${TARGET_PERMISSION} to every role node that has ${SOURCE_PERMISSION}...")
            int changed = 0
            visit(session.getNode(ROLES_ROOT)) { node ->
                try {
                    if (hasPermission(node, PROP, SOURCE_PERMISSION)
                            && ensureValueInMultiProp(node, PROP, TARGET_PERMISSION)) {
                        log.info("Added ${TARGET_PERMISSION} to ${node.getPath()}")
                        changed++
                    }
                } catch (RepositoryException e) {
                    log.error("Error processing node: ${node.getPath()}", e)
                }
            }
            if (changed > 0) {
                session.save()
                log.info("${TARGET_PERMISSION} migration applied to ${changed} node(s).")
            } else {
                log.info("No nodes needed updating — ${TARGET_PERMISSION} already aligned with ${SOURCE_PERMISSION}.")
            }
            return null
        }
    })
}

grantViewVisibilityWhereSeoExists()
