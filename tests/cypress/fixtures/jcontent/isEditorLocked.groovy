import org.jahia.services.content.*

import javax.jcr.RepositoryException

JCRTemplate.getInstance().doExecuteWithUserSession("USER_KEY", "default", new JCRCallback<Object>() {
    @Override
    Object doInJCR(JCRSessionWrapper session) throws RepositoryException {
        JCRNodeWrapper node = session.getNode("NODE_PATH")
        result.put("locked", JCRContentUtils.isLockedAndCannotBeEdited(node))
        return null
    }
})