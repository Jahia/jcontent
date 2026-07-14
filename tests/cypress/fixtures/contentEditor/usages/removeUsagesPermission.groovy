import org.jahia.services.content.JCRTemplate
import javax.jcr.Node

// Remove the viewUsagesTab permission from the editor role
// to restore the default state after tests.
JCRTemplate.getInstance().doExecuteWithSystemSession { session ->
    Node role = session.getNode('/roles/editor')
    if (role.hasProperty('j:permissionNames')) {
        List<String> perms = role.getProperty('j:permissionNames').getValues().collect { it.getString() }
        if (perms.contains('viewUsagesTab')) {
            perms.remove('viewUsagesTab')
            role.setProperty('j:permissionNames', perms as String[])
            session.save()
        }
    }
}
