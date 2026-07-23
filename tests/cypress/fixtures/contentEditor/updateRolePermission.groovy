import org.jahia.services.content.JCRCallback
import org.jahia.services.content.JCRSessionWrapper
import org.jahia.services.content.JCRTemplate

import javax.jcr.NodeIterator
import javax.jcr.RepositoryException

final String roleName = 'ROLE'
final String action = 'ACTION'
final String permission = 'PERMISSION'
final String targetNodeName = 'TARGET_NODE'
final String propName = 'j:permissionNames'

def visit(node, Closure work) {
    work(node)
    NodeIterator children = node.getNodes()
    while (children.hasNext()) {
        visit(children.nextNode(), work)
    }
}

boolean ensureValueInMultiProp(node, String propertyName, String valueToAdd) {
    if (node.hasProperty(propertyName)) {
        def values = node.getProperty(propertyName).getValues()*.getString()
        if (values.contains(valueToAdd)) {
            return false
        }

        node.setProperty(propertyName, (values + valueToAdd) as String[])
        return true
    }

    node.setProperty(propertyName, [valueToAdd] as String[])
    return true
}

boolean removeValueFromMultiProp(node, String propertyName, String valueToRemove) {
    if (!node.hasProperty(propertyName)) {
        return false
    }

    def values = node.getProperty(propertyName).getValues()*.getString()
    if (!values.contains(valueToRemove)) {
        return false
    }

    def remainingValues = values.findAll { it != valueToRemove }
    if (remainingValues.isEmpty()) {
        node.getProperty(propertyName).remove()
    } else {
        node.setProperty(propertyName, remainingValues as String[])
    }

    return true
}

JCRTemplate.getInstance().doExecuteWithSystemSession(new JCRCallback<Void>() {
    @Override
    Void doInJCR(JCRSessionWrapper session) throws RepositoryException {
        def rolePath = '/roles/' + roleName
        if (!session.nodeExists(rolePath)) {
            throw new RepositoryException('Role not found: ' + rolePath)
        }

        def roleNode = session.getNode(rolePath)
        boolean changed = false

        if (action == 'remove') {
            visit(roleNode) { currentNode ->
                if (removeValueFromMultiProp(currentNode, propName, permission)) {
                    changed = true
                }
            }
        } else if (action == 'add') {
            boolean permissionAlreadyPresent = false
            visit(roleNode) { currentNode ->
                if (currentNode.hasProperty(propName) && currentNode.getProperty(propName).getValues()*.getString().contains(permission)) {
                    permissionAlreadyPresent = true
                }
            }

            if (!permissionAlreadyPresent) {
                def targetNode = roleNode.hasNode(targetNodeName) ? roleNode.getNode(targetNodeName) : roleNode
                changed = ensureValueInMultiProp(targetNode, propName, permission)
            }
        } else {
            throw new IllegalArgumentException('Unsupported ACTION value: ' + action)
        }

        if (changed) {
            session.save()
        }

        return null
    }
})