import org.jahia.services.content.JCRCallback
import org.jahia.services.content.JCRSessionWrapper
import org.jahia.services.content.JCRTemplate

import javax.jcr.RepositoryException

JCRTemplate.getInstance().doExecuteWithSystemSessionAsUser(null, "default", Locale.ENGLISH, new JCRCallback<Object>() {
    @Override
    Object doInJCR(JCRSessionWrapper session) throws RepositoryException {

        // this remove contents created by addContentLocation.groovy
        session.getNode("/sites/SITEKEY/home/page-1").remove()

        session.save()
        return null
    }
})