import org.jahia.osgi.BundleUtils
import org.osgi.service.cm.ConfigurationAdmin

def patchConfigForComponentVisibility() {

    def configAdmin = BundleUtils.getOsgiService(ConfigurationAdmin.class, null);
    def configs = configAdmin.listConfigurations("(service.pid=org.jahia.modules.jcontent)");

    if (configs == null || configs.length == 0) {
        log.warn("No JContent configuration found to update for component visibility.");
        return;
    }
    def config = configs[0];
    if (config != null) {
        log.info("Updating JContent configuration for component visibility...");
        def props = config.getProperties();
        if (props != null) {
            // Add or update the property for component visibility
            props.put("hideLegacyPageComposer", "true");
            props.put("showPageBuilder", "true");
            props.put("createChildrenDirectButtons.limit", "5");
            props.remove("showPageComposer");
            props.remove("showCatMan");

            config.update(props);
            log.info("JContent configuration updated for component visibility.");
        } else {
            log.warn("No properties found in JContent configuration to update.");
        }

    } else {
        log.warn("No JContent configuration found to update.");
    }
}

patchConfigForComponentVisibility()

