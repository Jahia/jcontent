import org.jahia.osgi.FrameworkService
import org.jahia.services.content.JCRStoreService
import org.jahia.services.content.nodetypes.ExtendedNodeType
import org.jahia.services.content.nodetypes.NodeTypeRegistry
import org.osgi.framework.Bundle

def source = ["advanced-visibility", "visibility"];
def target = "jcontent";

log.info("Checking if bundle with symbolic name {} needs to be uninstalled", source);
Bundle[] bundles = FrameworkService.getBundleContext().getBundles();
for (Bundle bundle: bundles) {
    def symbolicName = bundle.getSymbolicName()
    if (source.contains(symbolicName)) {
        log.info("Bundle {} is present in version {}, uninstalling... ", symbolicName, bundle.getVersion().toString());
        bundle.uninstall();
        log.info("Successfully uninstalled bundle {}",symbolicName);
    }
}

def toSwitch = ["jnt:timeOfDayCondition", "jnt:dayOfWeekCondition", "jnt:startEndDateCondition"];

log.info("Check for nodetypes to switch from " + source + " to " + target + " (" + toSwitch.size() + " nodetypes to switch)");
NodeTypeRegistry nodeTypeRegistry = NodeTypeRegistry.getInstance();
nodeTypeRegistry.getAllNodeTypes(source).forEach { nodeType ->
    if (toSwitch.contains(nodeType.getName())) {
        log.info("Switch nodetype: {} to {}", nodeType.getName(), target);
        def field = ExtendedNodeType.getDeclaredField("systemId")
        field.setAccessible(true)
        try {
            field.set(nodeType, target);
        } finally {
            field.setAccessible(false);
        }
        log.info("Successfully switched nodetype: {} to {}",nodeType.getName(),nodeType.getSystemId());
    }
}

log.info("Undeploy definitions of {}", source);
JCRStoreService jcrStoreService = JCRStoreService.getInstance();
source.forEach { systemId ->
    jcrStoreService.undeployDefinitions(systemId);
    log.info("Successfully removed definitions for systemId: {}", systemId);
}

