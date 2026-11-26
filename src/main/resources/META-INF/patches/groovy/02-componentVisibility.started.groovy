import org.jahia.osgi.BundleUtils
import org.osgi.service.cm.ConfigurationAdmin

def patchConfigForComponentVisibility() {

    def configAdmin = BundleUtils.getOsgiService(ConfigurationAdmin.class, null);
    def configs = configAdmin.listConfigurations("(service.pid=org.jahia.modules.jcontent)");

    // Nothing to migrate is the normal case on a fresh install: the configuration the module
    // ships already carries these values, and never carried the keys removed below.
    if (configs == null || configs.length == 0) {
        log.info("No existing JContent configuration to migrate for component visibility.");
        return;
    }

    log.info("Updating JContent configuration for component visibility...");
    def props = configs[0].getProperties();
    if (props == null) {
        log.warn("No properties found in JContent configuration to update.");
        return;
    }

    // Add or update the property for component visibility
    props.put("hideLegacyPageComposer", "true");
    props.put("showPageBuilder", "true");
    props.put("createChildrenDirectButtons.limit", "5");
    props.remove("showPageComposer");
    props.remove("showCatMan");

    configs[0].update(props);
    log.info("JContent configuration updated for component visibility.");
}

patchConfigForComponentVisibility()

