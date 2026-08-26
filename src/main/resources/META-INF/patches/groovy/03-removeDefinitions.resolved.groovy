import org.jahia.osgi.BundleUtils
import org.jahia.services.content.JCRStoreService
import org.jahia.services.content.nodetypes.ExtendedNodeType
import org.jahia.services.content.nodetypes.NodeTypeRegistry
import org.jahia.services.modulemanager.ModuleManager
import org.osgi.framework.Bundle

def source = ["advanced-visibility", "visibility"];
def target = "jcontent";
def toSwitch = ["jnt:timeOfDayCondition", "jnt:dayOfWeekCondition", "jnt:startEndDateCondition"];

// This script runs synchronously inside jahiamodule-extender's Activator, holding its
// bundle-lifecycle monitor (resolve() -> handlePatches()). ModuleManager.uninstall() blocks
// waiting for the cluster-wide operation to complete, and completing it locally requires that
// same monitor on a different thread (to deliver the resulting UNINSTALLED event) - calling it
// synchronously here deadlocks. Deferring the whole body to a new thread lets this method
// return and release the monitor first; the sleep gives a wide margin over that (a couple of
// synchronized-method returns) before the cluster round-trip could possibly need the monitor back.
Thread.start {
    sleep(2000)

    // Switch the nodetypes BEFORE uninstalling the source bundles. Uninstalling a module bundle
    // already unregisters its own CND-declared nodetypes as ordinary cleanup - when nothing has
    // this type in use, that housekeeping wipes the very types below before we get a chance to
    // relabel them, and "Switch nodetype:" silently never happens (only survives today when JCR's
    // in-use protection happens to block that unregister on content still using the old type).
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

    log.info("Checking if bundle with symbolic name {} needs to be uninstalled", source);
    ModuleManager moduleManager = BundleUtils.getOsgiService(ModuleManager.class, null);
    source.forEach { symbolicName ->
        Bundle bundle = BundleUtils.getBundleBySymbolicName(symbolicName, null);
        if (bundle != null) {
            log.info("Bundle {} is present in version {}, uninstalling... ", symbolicName, bundle.getVersion().toString());
            moduleManager.uninstall(symbolicName, null);
            log.info("Successfully uninstalled bundle {}",symbolicName);
        }
    }

    log.info("Undeploy definitions of {}", source);
    JCRStoreService jcrStoreService = JCRStoreService.getInstance();
    source.forEach { systemId ->
        jcrStoreService.undeployDefinitions(systemId);
        log.info("Successfully removed definitions for systemId: {}", systemId);
    }

    // The nodetype migrations above only happens in the current (processing) node in a cluster.
    // Propagate to the rest of cluster nodes through jcrStoreService.deployDefinitions which reloads 
    // node type registry for all nodes.
    log.info("Redeploy definitions of {} to propagate switched nodetypes cluster-wide", target);
    jcrStoreService.deployDefinitions(target);
    log.info("Successfully redeployed definitions for systemId: {}", target);
}

