import org.jahia.osgi.BundleUtils
import org.jahia.osgi.FrameworkService
import org.jahia.services.content.JCRStoreService
import org.jahia.services.content.nodetypes.ExtendedNodeType
import org.jahia.services.content.nodetypes.NodeTypeRegistry
import org.jahia.services.modulemanager.ModuleManager
import org.jahia.services.visibility.VisibilityConditionRule
import org.jahia.services.visibility.VisibilityService
import org.osgi.framework.Bundle

def source = ["advanced-visibility", "visibility"];
def target = "jcontent";
def toSwitch = ["jnt:timeOfDayCondition", "jnt:dayOfWeekCondition", "jnt:startEndDateCondition"];

// Check first if sources are present and nodetypes registered
// so we don't performance unncessary module operations if not needed
def liveSourceBundles = FrameworkService.getBundleContext().getBundles().findAll {
    source.contains(it.getSymbolicName()) && it.getState() != Bundle.UNINSTALLED
}.collect { it.getSymbolicName() };
def strandedTypes = NodeTypeRegistry.getInstance().getAllNodeTypes(source).findAll { toSwitch.contains(it.getName()) }.collect { it.getName() };
if (liveSourceBundles.isEmpty() && strandedTypes.isEmpty()) {
    log.info("Nothing to migrate to {}: no {} bundle installed and no nodetype still owned by one. Skipping.", target, source);
    return;
}
log.info("Migrating to {}: source bundles present={}, nodetypes still owned by a source={}", target, liveSourceBundles, strandedTypes);

// Bundle uninstall needs to happen cluster-wide if active but has a lock during jcontent install.
// This needs to happen after jcontent install
Thread.start {
    sleep(2000)

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

    // Re-register condition types
    // Used to run from TemplateRegistry when source modules are uninstalled before jcontent is activated
    // Now uninstall of source modules wipes out the visibility conditions in VisibilityConditionRule
    // ISSUE: code below runs only on processing/executing node. 
    // Options: start/stop jcontent to refresh beans, 
    // or add a listener for visibility uninstall to reregister the jcontent beans (but no guarantee when beans are available apparently)
    log.info("Re-registering visibility condition rules evicted by the uninstall of {}", source);
    def systemContext = FrameworkService.getBundleContext();
    def references = systemContext.getServiceReferences(VisibilityConditionRule.class, null);
    if (references.isEmpty()) {
        log.info("No VisibilityConditionRule service is published yet; the module's own components will register these conditions when they activate");
    }
    references.each { reference ->
        VisibilityConditionRule rule = systemContext.getService(reference);
        if (rule != null && toSwitch.contains(rule.getAssociatedNodeType())) {
            VisibilityService.getInstance().addCondition(rule.getAssociatedNodeType(), rule);
            log.info("Re-registered visibility condition rule {} for {}", rule.getClass().getName(), rule.getAssociatedNodeType());
        }
    }
}
