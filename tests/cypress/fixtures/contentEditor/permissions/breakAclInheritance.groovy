import org.jahia.services.content.JCRTemplate

JCRTemplate.getInstance().doExecuteWithSystemSession { session ->
    session.getNode('NODE_PATH').setAclInheritanceBreak(true)
    session.save()
}
