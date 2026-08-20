import org.jahia.api.Constants
import org.jahia.services.content.JCRTemplate
import org.jahia.services.sites.JahiaSitesService
import org.jahia.services.usermanager.JahiaUserManagerService

// Defensive cleanup: removes the sites and users a previous run of this spec left behind, matched on
// its own naming prefix. A run whose teardown failed must not make the next one fail too, and the
// site key carries a random suffix, so only a prefix match can find the leftovers.
JCRTemplate.instance.doExecuteWithSystemSessionAsUser(
        JahiaUserManagerService.instance.lookupRootUser().jahiaUser, Constants.EDIT_WORKSPACE, Locale.ENGLISH, session -> {
    def prefix = "PREFIX"

    JahiaSitesService sites = JahiaSitesService.getInstance()
    sites.getSitesNodeList(session).each { site ->
        if (site.name.startsWith(prefix)) {
            sites.removeSite(site)
        }
    }

    def users = JahiaUserManagerService.instance
    session.getNode("/users").nodes.each { letter ->
        letter.nodes.each { sub ->
            sub.nodes.each { user ->
                if (user.name.startsWith(prefix)) {
                    users.deleteUser(user.path, session)
                }
            }
        }
    }
    session.save()
    return null
})
