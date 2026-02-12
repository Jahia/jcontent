import org.jahia.services.content.decorator.JCRUserNode
import org.jahia.services.usermanager.JahiaUserManagerService

try {
    String username = "USERNAME"
    String preferredLang = "LANGUAGE"

    JCRUserNode user = JahiaUserManagerService.getInstance().lookupUser(username)
    if (user == null) {
        log.error("User {} not found", user)
        return
    }
    user.setProperty("preferredLanguage", preferredLang);
    user.getSession().save();
    log.info("Set user {} preferred language to {}", username, preferredLang)
} catch (Exception e) {
    log.error("Failed to set preferred language", e)
}
