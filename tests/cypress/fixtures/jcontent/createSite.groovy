import org.jahia.services.sites.JahiaSite
import org.jahia.services.sites.JahiaSitesService
import org.jahia.services.sites.SiteCreationInfo

JahiaSitesService sitesService = JahiaSitesService.getInstance();
if (sitesService.getSiteByKey("SITEKEY") == null) {
    JahiaSite site = sitesService.addSite(SiteCreationInfo.builder().
            siteKey("SITEKEY").
            serverName("jahia").
            title("SITEKEY").
            templateSet("dx-base-demo-templates").
            modulesToDeploy(new String[]{"event", "bootstrap3-components", "article"}).
            locale("en").build())
}

