import org.jahia.services.content.JCRTemplate
import javax.jcr.Node

// Grant the viewUsagesTab permission to the editor role so that non-root
// test users can access the usages side panel tab.
JCRTemplate.getInstance().doExecuteWithSystemSession { session ->
    Node role = session.getNode('/roles/editor')
    String[] perms = role.hasProperty('j:permissionNames') ?
        role.getProperty('j:permissionNames').getValues().collect { it.getString() } as String[] :
        new String[0]
    if (!perms.contains('viewUsagesTab')) {
        List<String> updated = new ArrayList<>(perms.toList())
        updated.add('viewUsagesTab')
        role.setProperty('j:permissionNames', updated as String[])
        session.save()
    }
}
