import org.jahia.services.content.JCRCallback
import org.jahia.services.content.JCRSessionWrapper
import org.jahia.services.content.JCRTemplate

import javax.jcr.RepositoryException

JCRTemplate.getInstance().doExecuteWithSystemSessionAsUser(null, "default", Locale.ENGLISH, new JCRCallback<Object>() {
    @Override
    Object doInJCR(JCRSessionWrapper session) throws RepositoryException {

        // this remove contents created by addContentLocation.groovy
        session.getNode("/sites/SITEKEY/contents/contentEditorTestContents/myNewLocation").remove()
        session.getNode("/sites/SITEKEY/contents/contentEditorTestContents/myOtherLocation").remove()
        session.getNode("/sites/SITEKEY/contents/contentEditorTestContents/myLocation").remove()

        System.out.println("Removed content: myLocation, myNewLocation and myOtherLocation")

        session.save()
        return null
    }
})