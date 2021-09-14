import org.jahia.services.content.JCRCallback
import org.jahia.services.content.JCRNodeWrapper
import org.jahia.services.content.JCRSessionWrapper
import org.jahia.services.content.JCRTemplate

import javax.jcr.RepositoryException

JCRTemplate.getInstance().doExecuteWithSystemSessionAsUser(null, "default", Locale.ENGLISH, new JCRCallback<Object>() {
    @Override
    Object doInJCR(JCRSessionWrapper session) throws RepositoryException {


        // contentEditorTestContents should already exist when executing this script
        // If not you need to execute initData.groovy
        JCRNodeWrapper testContentFolder = session.getNode("/sites/SITEKEY/contents/contentEditorTestContents")
        JCRNodeWrapper location = testContentFolder.addNode("myNewLocation", "qant:location")
        location.setProperty("jcr:title", "myNewLocation")
        location.setProperty("jcr:description", "description for myNewLocation")
        JCRNodeWrapper location2 = testContentFolder.addNode("myOtherLocation", "qant:location")
        location2.setProperty("jcr:title", "myOtherLocation")
        JCRNodeWrapper location3 = testContentFolder.addNode("myLocation", "qant:location")
        location3.setProperty("jcr:title", "myLocation")

        System.out.println("Created content: myLocation, myNewLocation and myOtherLocation")

        session.save()
        return null
    }
})