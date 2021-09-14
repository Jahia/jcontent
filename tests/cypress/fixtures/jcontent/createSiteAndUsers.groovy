import org.apache.log4j.Logger
import org.jahia.services.content.JCRSessionWrapper
import org.jahia.services.sites.JahiaSite
import org.jahia.services.sites.JahiaSitesService
import org.jahia.services.sites.SiteCreationInfo
import org.jahia.services.usermanager.JahiaUserManagerService

//
//JCRTemplate.getInstance().doExecuteWithSystemSession(new JCRCallback() {
//
//
//			@Override
//			Object doInJCR(JCRSessionWrapper session) throws RepositoryException {
//				createBasicUser("CONTENT_EDITOR_EDITOR", session);
//				createBasicUser("CONTENT_EDITOR_INCHIEF", session);
//				createBasicUser("CONTENT_EDITOR_DE",  session);
//				createBasicUser("CONTENT_EDITOR_EN",  session);
//				createBasicUser("CONTENT_EDITOR_REVIEWER", session);
//			}
//		}
//)

JahiaSitesService sitesService = JahiaSitesService.getInstance();
if (sitesService.getSiteByKey("SITEKEY") == null) {
    JahiaSite site = sitesService.addSite(SiteCreationInfo.builder().
            siteKey("SITEKEY").
            serverName("localhost").
            title("SITEKEY").
            templateSet("dx-base-demo-templates").
//			modulesToDeploy(["qa-module"] as String[]).
        locale("en").build())

//	JCRTemplate.getInstance().doExecuteWithSystemSession(new JCRCallback<Object>() {
//				public Object doInJCR(JCRSessionWrapper session) throws RepositoryException {
//					JCRSiteNode siteNode = sitesService.getSiteByKey("SITEKEY", session);
//					siteNode.grantRoles("u:CONTENT_EDITOR_EDITOR", Collections.singleton("editor"));
//					siteNode.grantRoles("u:CONTENT_EDITOR_INCHIEF", Collections.singleton("editor-in-chief"));
//					siteNode.grantRoles("u:CONTENT_EDITOR_DE", Collections.singleton("translator-de"));
//					siteNode.grantRoles("u:CONTENT_EDITOR_EN", Collections.singleton("translator-en"));
//					siteNode.grantRoles("u:CONTENT_EDITOR_REVIEWER", Collections.singleton("reviewer"));
//					siteNode.setProperty("j:languages", ["en","de"] as String[])
//					session.save();
//					return null;
//				}
//			});
}

def createBasicUser(String username, JCRSessionWrapper session) {
    try {
        JahiaUserManagerService userManagerService = JahiaUserManagerService.getInstance();
        userManagerService.createUser(username, null, "password", new java.util.Properties(), session);
        session.save();
    } catch (Exception e) {
        def log = Logger.getLogger("createSiteAndUsers.logger")
        log.debug "SITEKEY : error while creating user " + username + ". Exception : " + e.message;
    }
}
