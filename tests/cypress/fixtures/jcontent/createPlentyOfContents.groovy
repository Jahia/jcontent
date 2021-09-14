import org.jahia.services.content.JCRCallback
import org.jahia.services.content.JCRNodeWrapper
import org.jahia.services.content.JCRSessionWrapper
import org.jahia.services.content.JCRTemplate

import javax.jcr.RepositoryException

JCRTemplate.getInstance().doExecuteWithSystemSessionAsUser(null, "default", Locale.ENGLISH, new JCRCallback<Object>() {
    @Override
    Object doInJCR(JCRSessionWrapper session) throws RepositoryException {
        JCRNodeWrapper testContentFolder = session.getNode("/sites/SITEKEY/contents")
        JCRNodeWrapper testFilesFolder = session.getNode("/sites/SITEKEY/files")

//Infinite scroll data
        JCRNodeWrapper infiniteScrollContentFolder = testContentFolder.addNode("infiniteScrollFolder", "jnt:contentFolder")
        JCRNodeWrapper ContentsList60 = infiniteScrollContentFolder.addNode("contentsList60", "jnt:contentFolder")
        JCRNodeWrapper infiniteScrollFileFolder = testFilesFolder.addNode("infiniteScrollFolder", "jnt:folder")
        JCRNodeWrapper ImagesList60 = infiniteScrollFileFolder.addNode("imagesList60", "jnt:folder")

        JCRNodeWrapper jahiaChat = null;
        JCRNodeWrapper paysage = null;
        InputStream is = null
        try {
            is = new FileInputStream("SELENIUM_DOCUMENTS_PATH/jahiaChat.jpg")
            jahiaChat = infiniteScrollFileFolder.uploadFile("jahiaChat", is, "image/jpg")
            is = new FileInputStream("SELENIUM_DOCUMENTS_PATH/paysage.jpg")
            paysage = infiniteScrollFileFolder.uploadFile("paysage", is, "image/jpg")
            session.save()
        } finally {
            is.close()
        }
        1.upto(60, {
            JCRNodeWrapper textNode = ContentsList60.addNode("text-${it}", "jnt:text");
            textNode.setProperty("text", it % 2 == 0 ? "crevette" : "langoustime");
            def image = it % 2 == 0 ? jahiaChat : paysage;
            image.copy(ImagesList60.path, "${image.name}-${it}");
        });
        session.save()
    }
});
