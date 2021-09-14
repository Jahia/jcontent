import org.jahia.api.Constants
import org.jahia.services.content.JCRCallback
import org.jahia.services.content.JCRSessionWrapper
import org.jahia.services.content.JCRTemplate

import javax.jcr.RepositoryException

def cleanupData(workspace) {
    JCRTemplate.getInstance().doExecuteWithSystemSessionAsUser(null, workspace, null, new JCRCallback<Object>() {
        @Override
        Object doInJCR(JCRSessionWrapper session) throws RepositoryException {

            ["/contents/contentEditorTestContents", "/files/contentEditorTestFiles"].each {
                if (session.nodeExists("/sites/SITEKEY" + it)) {
                    session.getNode("/sites/SITEKEY" + it).remove()
                }
            }

            if (session.nodeExists("/sites/SITEKEY/home/area-main")) {
                session.getNode("/sites/SITEKEY/home/area-main").remove()
            }

            if (session.nodeExists("/sites/SITEKEY/home/content-list-ordering-page")) {
                session.getNode("/sites/SITEKEY/home/content-list-ordering-page").remove()
            }

            session.save()
            return null;
        }
    })
}


def static deleteCategory(String categoryName, session) {
    if (session.nodeExists("/sites/systemsite/categories/" + categoryName)) {
        session.getNode("/sites/systemsite/categories/" + categoryName).remove();
    }
    return null
}

cleanupData(Constants.EDIT_WORKSPACE)
cleanupData(Constants.LIVE_WORKSPACE)
