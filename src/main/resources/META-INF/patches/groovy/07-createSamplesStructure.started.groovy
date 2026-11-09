import org.jahia.services.content.JCRCallback
import org.jahia.services.content.JCRSessionWrapper
import org.jahia.services.content.JCRTemplate

import javax.jcr.NodeIterator
import javax.jcr.RepositoryException

SITES_ROOT = "/sites"
SITE_TYPE = "jnt:virtualsite"
SYSTEM_SITE = "systemsite"

SAMPLES_NODE = "samples"
SAMPLES_TYPE = "jnt:samplesFolder"
CATEGORY_TYPE = "jnt:samplesCategory"

// The two categories a sample can land in. Saving a sample picks one by node type, so these are a
// fixed part of the structure rather than something an author creates.
CATEGORIES = ["pages": "Pages", "components": "Components"]

/**
 * Create a child if it is missing. If something of another type already holds the name, leave it
 * alone and say so: silently skipping would leave a branch that looks right and does not work.
 */
def ensureChild(parent, String name, String type, String title) {
    if (parent.hasNode(name)) {
        def existing = parent.getNode(name)
        if (!existing.isNodeType(type)) {
            log.warn("${existing.getPath()} exists but is a ${existing.getPrimaryNodeTypeName()}, expected ${type} - leaving it untouched, samples there will not behave correctly")
        }

        return null
    }

    def created = parent.addNode(name, type)
    if (title != null) {
        created.setProperty("jcr:title", title)
    }

    log.info("Created ${created.getPath()}")
    return created
}

def createSamplesFolders() {
    JCRTemplate.getInstance().doExecuteWithSystemSession(null, "default", Locale.ENGLISH, new JCRCallback<Void>() {

        @Override
        Void doInJCR(JCRSessionWrapper session) throws RepositoryException {
            if (!session.nodeExists(SITES_ROOT)) {
                log.warn("${SITES_ROOT} not found - skipping ${SAMPLES_NODE} folder creation")
                return null
            }

            log.info("Creating the ${SAMPLES_NODE} structure on every site...")
            int created = 0
            NodeIterator it = session.getNode(SITES_ROOT).getNodes()
            while (it.hasNext()) {
                def site = it.nextNode()
                try {
                    if (!site.isNodeType(SITE_TYPE) || site.getName() == SYSTEM_SITE) {
                        continue
                    }

                    if (ensureChild(site, SAMPLES_NODE, SAMPLES_TYPE, null) != null) {
                        created++
                    }

                    if (!site.hasNode(SAMPLES_NODE)) {
                        continue
                    }

                    def samples = site.getNode(SAMPLES_NODE)
                    CATEGORIES.each { name, title ->
                        if (ensureChild(samples, name, CATEGORY_TYPE, title) != null) {
                            created++
                        }
                    }
                } catch (RepositoryException e) {
                    log.error("Error creating the ${SAMPLES_NODE} structure under site: ${site.getPath()}", e)
                }
            }

            if (created > 0) {
                session.save()
                log.info("${SAMPLES_NODE} structure: ${created} node(s) created.")
            } else {
                log.info("No site needed a ${SAMPLES_NODE} structure.")
            }

            return null
        }
    })
}

createSamplesFolders()
