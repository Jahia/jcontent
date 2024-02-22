import org.jahia.services.content.JCRCallback
import org.jahia.services.content.JCRSessionWrapper
import org.jahia.services.content.JCRNodeWrapper
import org.jahia.services.content.JCRTemplate
import org.jahia.services.usermanager.JahiaUser
import org.jahia.registries.ServicesRegistry

import javax.jcr.RepositoryException

PAGE_NAME = "page"
DEPTH = 5
NUMBER_OF_PAGES = 5
NUMBER_OF_LIST_ITEMS = 5
SITE_PATH = "/sites/SITEKEY"

JahiaUser user = ServicesRegistry.getInstance().getJahiaUserManagerService().lookupRootUser().getJahiaUser()

def createContent(JCRNodeWrapper parent, int itemNumber) {

    if (!parent.hasNode("area-main")) {
        parent.addNode("area-main", "jnt:contentList")
    }

    parent = parent.getNode("area-main")

    (1..itemNumber).each {int i ->
        JCRNodeWrapper text = parent.addNode("bigText-" + i, "jnt:bigText")
        text.setProperty("text", "This is my big text number " + i)
    }

    (1..itemNumber).each {int i ->
        JCRNodeWrapper highs = parent.addNode("highlights-" + i, "jdnt:highlights")
        highs.setProperty("numColumns", 3)

        (1..itemNumber).each {int j ->
            JCRNodeWrapper high = highs.addNode("highlight-" + j, "jdnt:highlight")
            high.setProperty("jcr:title", "highlight-" + j)
            high.setProperty("description", "This is description for highlight " + j)
        }
    }
}

def createPages(JCRNodeWrapper parent, JCRSessionWrapper session, int pageNumber, int level) {
    if (level > DEPTH) {
        return
    }

    (1..pageNumber).each { int i ->
        def name = PAGE_NAME + "-" + i + "-" + level;
        JCRNodeWrapper page = parent.addNode(name, "jnt:page")
        page.setProperty("j:templateName", "home")
        page.setProperty("jcr:title", name)
        createContent(page, NUMBER_OF_LIST_ITEMS)
        session.save()
        session.refresh(false)
        createPages(page, session, NUMBER_OF_PAGES, level + 1)
    }
}

def initData = () -> {
    JCRTemplate.getInstance().doExecuteWithSystemSessionAsUser(user as JahiaUser, "default", Locale.ENGLISH, new JCRCallback<Void>() {
        @Override
        Void doInJCR(JCRSessionWrapper session) throws RepositoryException {
            System.out.println("************ Generating data");
            def home = session.getNode(SITE_PATH + "/home")
            createPages(home, session, NUMBER_OF_PAGES, 1)
            return null
        }
    })
}

initData()
