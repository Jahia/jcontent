import org.jahia.services.content.JCRCallback
import org.jahia.services.content.JCRSessionWrapper
import org.jahia.services.content.JCRTemplate
import org.jahia.services.content.decorator.JCRSiteNode
import org.jahia.services.sites.JahiaSite
import org.jahia.services.sites.JahiaSitesService
import org.jahia.services.sites.SiteCreationInfo
import org.jahia.services.usermanager.JahiaUserManagerService

import javax.jcr.RepositoryException

JCRTemplate.getInstance().doExecuteWithSystemSession(new JCRCallback() {
    @Override
    Object doInJCR(JCRSessionWrapper session) throws RepositoryException {
        JahiaUserManagerService userManagerService = JahiaUserManagerService.getInstance();
        userManagerService.createUser("CONTENT_EDITOR_EDITOR", null, "password", new java.util.Properties(), session);
        userManagerService.createUser("CONTENT_EDITOR_INCHIEF", null, "password", new java.util.Properties(), session);
        userManagerService.createUser("CONTENT_EDITOR_DE", null, "password", new java.util.Properties(), session);
        userManagerService.createUser("CONTENT_EDITOR_EN", null, "password", new java.util.Properties(), session);
        userManagerService.createUser("CONTENT_EDITOR_REVIEWER", null, "password", new java.util.Properties(),
                session);
        session.save();
    }
})

JahiaSitesService sitesService = JahiaSitesService.getInstance();
if (sitesService.getSiteByKey("SITEKEY") == null) {
    JahiaSite site = sitesService.addSite(SiteCreationInfo.builder().
            siteKey("SITEKEY").
            serverName("localhost").
            title("SITEKEY").
            templateSet("dx-base-demo-templates").
            modulesToDeploy(["qa-module"] as String[]).
            locale("en").build())

    JCRTemplate.getInstance().doExecuteWithSystemSession(new JCRCallback<Object>() {
        public Object doInJCR(JCRSessionWrapper session) throws RepositoryException {
            JCRSiteNode siteNode = sitesService.getSiteByKey("SITEKEY", session);
            siteNode.grantRoles("u:CONTENT_EDITOR_EDITOR", Collections.singleton("editor"));
            siteNode.grantRoles("u:CONTENT_EDITOR_INCHIEF", Collections.singleton("editor-in-chief"));
            siteNode.grantRoles("u:CONTENT_EDITOR_DE", Collections.singleton("translator-de"));
            siteNode.grantRoles("u:CONTENT_EDITOR_EN", Collections.singleton("translator-en"));
            siteNode.grantRoles("u:CONTENT_EDITOR_REVIEWER", Collections.singleton("reviewer"));
            siteNode.setProperty("j:languages", ["en"] as String[])
            session.save();
            return null;
        }
    });
}