import org.jahia.services.content.JCRCallback
import org.jahia.services.content.JCRSessionWrapper
import org.jahia.services.content.JCRTemplate

import javax.jcr.RepositoryException

def updateAccordionPermissions() {
    JCRTemplate.getInstance().doExecuteWithSystemSession(new JCRCallback<Void>() {

        @Override
        Void doInJCR(JCRSessionWrapper jcrSessionWrapper) throws RepositoryException {
            log.info("Updating permissions for jContentAccordions...")
            def roleNames = List.of("editor", "reviewer", "translator")
            roleNames.forEach(roleName -> {
                try {
                    def rolePath = "/roles/" + roleName
                    if (!jcrSessionWrapper.nodeExists(rolePath)) {
                        log.warn("Role node not found: " + rolePath)
                        return
                    }
                    def role = jcrSessionWrapper.getNode(rolePath)
                    if (!role.hasNode("currentSite-access")) {
                        log.warn("currentSite-access child not found under role: " + roleName)
                        return
                    }
                    def siteAccess = role.getNode("currentSite-access")
                    log.info("Adding jContentAccordions permission to role: " + roleName + " (currentSite-access)")
                    if (siteAccess.hasProperty("j:permissionNames")) {
                        siteAccess.getProperty("j:permissionNames").addValue("jContentAccordions")
                    } else {
                        siteAccess.setProperty("j:permissionNames", ["jContentAccordions"] as String[])
                    }
                } catch (RepositoryException e) {
                    log.error("Error updating permissions for role: " + roleName, e)
                }
            })
            jcrSessionWrapper.save()
            return null
        }
    })
}

updateAccordionPermissions()
