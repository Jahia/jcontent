import org.jahia.services.content.JCRTemplate
import javax.jcr.Node

// Create a copy of the editor role without the 'components' permission,
// so a user with this role may not use any access-controlled content type.
JCRTemplate.getInstance().doExecuteWithSystemSession { session ->
    if (!session.nodeExists('/roles/editor-without-components')) {
        Node editor = session.getNode('/roles/editor')
        Node role = session.getNode('/roles').addNode('editor-without-components', 'jnt:role')
        role.setProperty('j:permissionNames', editor.getProperty('j:permissionNames').getValues())
        role.setProperty('j:roleGroup', editor.getProperty('j:roleGroup').getString())
        role.setProperty('j:privilegedAccess', editor.getProperty('j:privilegedAccess').getBoolean())

        Node editorSiteAccess = editor.getNode('currentSite-access')
        Node siteAccess = role.addNode('currentSite-access', 'jnt:externalPermissions')
        siteAccess.setProperty('j:path', editorSiteAccess.getProperty('j:path').getString())
        List<String> perms = editorSiteAccess.getProperty('j:permissionNames').getValues().collect { it.getString() }
        perms.remove('components')
        siteAccess.setProperty('j:permissionNames', perms as String[])
        session.save()
    }
}
