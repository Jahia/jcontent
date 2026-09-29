import org.jahia.services.content.JCRTemplate

// A copy of the editor role without viewOptionsTab. A user with this role gets no options section
// in the form, so the system name field is not in the form.
JCRTemplate.getInstance().doExecuteWithSystemSession { session ->
    if (!session.nodeExists('/roles/editor-without-options')) {
        def editor = session.getNode('/roles/editor')
        def role = session.getNode('/roles').addNode('editor-without-options', 'jnt:role')
        ['j:permissionNames', 'j:privilegedAccess', 'j:roleGroup'].each { name ->
            def property = editor.getProperty(name)
            if (property.isMultiple()) {
                role.setProperty(name, property.getValues())
            } else {
                role.setProperty(name, property.getValue())
            }
        }

        def permissions = editor.getNode('currentSite-access').getProperty('j:permissionNames').getValues()
            .collect { it.getString() } - 'viewOptionsTab'
        def access = role.addNode('currentSite-access', 'jnt:externalPermissions')
        access.setProperty('j:path', 'currentSite')
        access.setProperty('j:permissionNames', permissions as String[])
        session.save()
    }
}
