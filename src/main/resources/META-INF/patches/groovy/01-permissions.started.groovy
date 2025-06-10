import org.jahia.services.content.JCRCallback
import org.jahia.services.content.JCRSessionWrapper
import org.jahia.services.content.JCRTemplate

import javax.jcr.RepositoryException

def updateAccordionPermissions() {
    JCRTemplate.getInstance().doExecuteWithSystemSession (new JCRCallback<Void>(){

        @Override
        Void doInJCR(JCRSessionWrapper jcrSessionWrapper) throws RepositoryException {
            log.info("Updating permissions for jContentAccordions...");
            def roleNames = List.of("editor", "reviewer", "translator");
            roleNames.stream().forEach(roleName -> {
                try {
                    def role = jcrSessionWrapper.getNode("/roles/" + roleName);
                    if (role != null) {
                        log.info("Adding jContentAccordions permission to role: " + roleName);
                        role.getProperty("j:permissionNames").addValue("jContentAccordions");
                    }
                } catch (RepositoryException e) {
                    log.error("Error updating permissions for role: " + roleName, e);
                }
            });
            jcrSessionWrapper.save();
            return null;
        }
    });
}

updateAccordionPermissions();
