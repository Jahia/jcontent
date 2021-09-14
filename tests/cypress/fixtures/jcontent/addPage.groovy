import org.jahia.services.content.JCRCallback
import org.jahia.services.content.JCRNodeWrapper
import org.jahia.services.content.JCRSessionWrapper
import org.jahia.services.content.JCRTemplate

import javax.jcr.RepositoryException

JCRTemplate.getInstance().doExecuteWithSystemSessionAsUser(null, "default", Locale.ENGLISH, new JCRCallback<Object>() {
    @Override
    Object doInJCR(JCRSessionWrapper session) throws RepositoryException {

        // contentEditorTestContents site should already exist when executing this script
        // If not you need to execute initData.groovy
        JCRNodeWrapper homePage = session.getNode("/sites/SITEKEY/home")

        JCRNodeWrapper newPage1 = homePage.addNode("page-1", "jnt:page")
        newPage1.setProperty("jcr:title", "page1")
        newPage1.setProperty("j:templateName", "2-column")

        JCRNodeWrapper areaPage1 = newPage1.addNode("area-main", "jnt:contentList")

        JCRNodeWrapper newsPage1 = areaPage1.addNode("existingNews", "jnt:news")
        newsPage1.setProperty("jcr:title", "Existing news")

        session.save()
        return null
    }
})