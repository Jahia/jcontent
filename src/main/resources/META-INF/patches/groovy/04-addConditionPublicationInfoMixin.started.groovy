import org.jahia.services.content.JCRCallback
import org.jahia.services.content.JCRNodeWrapper
import org.jahia.services.content.JCRSessionWrapper
import org.jahia.services.content.JCRTemplate

import javax.jcr.NodeIterator
import javax.jcr.RepositoryException
import javax.jcr.query.Query

// New jnt:condition nodes automatically get jmix:conditionPublicationInfo (declared with "extends"
// in definitions.cnd), which brings mix:lastModified + jmix:lastPublished. Existing conditions were
// created before that mixin existed, so this patch materialises the mixin on them (which autocreates
// jcr:lastModified) so their individual publication status can be computed in the visibility editor.
// j:lastPublished is populated naturally the next time each condition is published.
MIXIN = "jmix:conditionPublicationInfo"

def addMixinToExistingConditions() {
    JCRTemplate.getInstance().doExecuteWithSystemSession(new JCRCallback<Void>() {

        @Override
        Void doInJCR(JCRSessionWrapper session) throws RepositoryException {
            def queryManager = session.getWorkspace().getQueryManager()
            // Matches jnt:condition and all its subtypes (jnt:dayOfWeekCondition, jnt:startEndDateCondition, ...)
            NodeIterator it = queryManager
                    .createQuery("SELECT * FROM [jnt:condition]", Query.JCR_SQL2)
                    .execute()
                    .getNodes()

            int changed = 0
            while (it.hasNext()) {
                JCRNodeWrapper node = (JCRNodeWrapper) it.nextNode()
                try {
                    if (node.canAddMixin(MIXIN)) {
                        node.addMixin(MIXIN)
                        changed++
                        log.info("Added ${MIXIN} to ${node.getPath()}")
                    }
                } catch (RepositoryException e) {
                    log.error("Error adding ${MIXIN} to ${node.getPath()}", e)
                }
            }

            if (changed > 0) {
                session.save()
                log.info("${MIXIN} added to ${changed} existing jnt:condition node(s).")
            } else {
                log.info("No existing jnt:condition node needed ${MIXIN}.")
            }
            return null
        }
    })
}

addMixinToExistingConditions()
