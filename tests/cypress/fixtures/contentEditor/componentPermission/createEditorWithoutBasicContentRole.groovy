import org.apache.jackrabbit.core.security.JahiaPrivilegeRegistry
import org.jahia.services.content.JCRTemplate
import javax.jcr.Node

// Create a copy of the editor role without the 'component-jmix_basicContent' permission,
// so a user with this role may not use jnt:text but may still use the other access-controlled types.
JCRTemplate.getInstance().doExecuteWithSystemSession { session ->
    if (!session.nodeExists('/roles/editor-without-basic-content')) {
        Node editor = session.getNode('/roles/editor')
        Node role = session.getNode('/roles').addNode('editor-without-basic-content', 'jnt:role')
        role.setProperty('j:permissionNames', editor.getProperty('j:permissionNames').getValues())
        role.setProperty('j:roleGroup', editor.getProperty('j:roleGroup').getString())
        role.setProperty('j:privilegedAccess', editor.getProperty('j:privilegedAccess').getBoolean())

        Node editorSiteAccess = editor.getNode('currentSite-access')
        Node siteAccess = role.addNode('currentSite-access', 'jnt:externalPermissions')
        siteAccess.setProperty('j:path', editorSiteAccess.getProperty('j:path').getString())
        Set<String> perms = editorSiteAccess.getProperty('j:permissionNames').getValues().collect { it.getString() } as Set
        // 'components' grants every component-<mixin> permission, so grant them one by one instead
        perms.remove('components')
        perms.addAll(JahiaPrivilegeRegistry.getRegisteredPrivilegeNames().findAll { it.startsWith('component-') })
        perms.remove('component-jmix_basicContent')
        siteAccess.setProperty('j:permissionNames', perms as String[])
        session.save()
    }
}
