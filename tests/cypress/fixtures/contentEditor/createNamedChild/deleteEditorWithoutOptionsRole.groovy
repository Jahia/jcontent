import org.jahia.services.content.JCRTemplate

JCRTemplate.getInstance().doExecuteWithSystemSession { session ->
    if (session.nodeExists('/roles/editor-without-options')) {
        session.getNode('/roles/editor-without-options').remove()
        session.save()
    }
}
