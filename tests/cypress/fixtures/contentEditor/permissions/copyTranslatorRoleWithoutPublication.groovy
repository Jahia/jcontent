import org.jahia.services.content.JCRTemplate
import javax.jcr.Node
import javax.jcr.NodeIterator
import javax.jcr.Property
import javax.jcr.PropertyIterator

// Copy the "translator" role to "translator-copy" and remove the "publication-start" permission
// from the copied role and its sub-roles, so a user granted the copied role cannot publish.
//
// Role names are global and must stay unique. A plain deep Workspace.copy of /roles/translator
// would momentarily persist sub-roles named exactly like the real ones (translator-en,
// translator-fr, ...), which corrupts those real roles in Jahia's role registry. To avoid that we
// build translator-copy explicitly and copy each sub-role DIRECTLY to its final, unique, grantable
// name (translator-en -> translator-copy-translator-en), mirroring what the role manager UI does.
def copyMixinsAndProperties(Node src, Node dest) {
    src.getMixinNodeTypes().each { mixin ->
        if (!dest.isNodeType(mixin.getName())) {
            dest.addMixin(mixin.getName())
        }
    }
    PropertyIterator props = src.getProperties()
    while (props.hasNext()) {
        Property p = props.nextProperty()
        if (p.getDefinition().isProtected() || p.getName().startsWith('jcr:')) {
            continue
        }
        try {
            if (p.isMultiple()) {
                dest.setProperty(p.getName(), p.getValues())
            } else {
                dest.setProperty(p.getName(), p.getValue())
            }
        } catch (Exception ignored) {
            // Skip properties that cannot be copied (e.g. constrained/auto-created)
        }
    }
}

def stripPublicationStart(Node role) {
    if (role.hasProperty('j:permissionNames')) {
        List<String> perms = role.getProperty('j:permissionNames').getValues().collect { it.getString() }
        if (perms.remove('publication-start')) {
            role.setProperty('j:permissionNames', perms as String[])
        }
    }
}

JCRTemplate.getInstance().doExecuteWithSystemSession { session ->
    Node roles = session.getNode('/roles')
    Node translator = session.getNode('/roles/translator')

    if (!session.nodeExists('/roles/translator-copy')) {
        Node copy = roles.addNode('translator-copy', translator.getPrimaryNodeType().getName())
        copyMixinsAndProperties(translator, copy)
        // Persist the parent so Workspace.copy can target it below.
        session.save()
    }
    stripPublicationStart(session.getNode('/roles/translator-copy'))

    // Copy each sub-role straight to its unique grantable name, then strip publication-start.
    NodeIterator subRoles = translator.getNodes()
    while (subRoles.hasNext()) {
        Node sub = subRoles.nextNode()
        if (sub.isNodeType('jnt:role')) {
            String targetPath = '/roles/translator-copy/translator-copy-' + sub.getName()
            if (!session.nodeExists(targetPath)) {
                session.getWorkspace().copy(sub.getPath(), targetPath)
                session.refresh(false)
            }
            stripPublicationStart(session.getNode(targetPath))
        }
    }
    session.save()
}
