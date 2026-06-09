import org.jahia.services.content.JCRTemplate
import javax.jcr.Node

// Remove the viewHistoryTab permission from editor-in-chief role
// to restore the default state after tests.
JCRTemplate.getInstance().doExecuteWithSystemSession { session ->
    Node role = session.getNode('/roles/editor')
    if (role.hasProperty('j:permissionNames')) {
        List<String> perms = role.getProperty('j:permissionNames').getValues().collect { it.getString() }
        if (perms.contains('viewHistoryTab')) {
            perms.remove('viewHistoryTab')
            role.setProperty('j:permissionNames', perms as String[])
            session.save()
        }
    }
}
