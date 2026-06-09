import org.jahia.services.content.JCRTemplate
import javax.jcr.Node

// Ensure the editor-in-chief role grants the viewHistoryTab permission
// so that non-root test users can access the content history side panel tab.
JCRTemplate.getInstance().doExecuteWithSystemSession { session ->
    Node role = session.getNode('/roles/editor')
    String[] perms = role.hasProperty('j:permissionNames') ?
        role.getProperty('j:permissionNames').getValues().collect { it.getString() } as String[] :
        new String[0]
    if (!perms.contains('viewHistoryTab')) {
        List<String> updated = new ArrayList<>(perms.toList())
        updated.add('viewHistoryTab')
        role.setProperty('j:permissionNames', updated as String[])
        session.save()
    }
}
