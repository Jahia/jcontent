import org.jahia.services.content.JCRTemplate

// Remove the copied "translator-copy" role created for the test.
// Roles live under the system /roles tree, which the JCR GraphQL API is not allowed to
// mutate (returns 403), hence this system-session groovy script.
JCRTemplate.getInstance().doExecuteWithSystemSession { session ->
    if (session.nodeExists('/roles/translator-copy')) {
        session.getNode('/roles/translator-copy').remove()
        session.save()
    }
}
