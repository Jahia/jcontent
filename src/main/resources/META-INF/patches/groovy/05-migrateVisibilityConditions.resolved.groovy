import org.jahia.osgi.FrameworkService
import org.jahia.services.content.JCRStoreService
import org.jahia.services.content.nodetypes.ExtendedNodeType
import org.jahia.services.content.nodetypes.NodeTypeRegistry
import org.osgi.framework.Bundle

def sources = ["advanced-visibility", "visibility"];
def target = "jcontent";
def toSwitch = ["jnt:timeOfDayCondition", "jnt:dayOfWeekCondition", "jnt:startEndDateCondition"];

/** 
 * Prerequisite: uninstall sources modules prior to  execution of this script.
 * Can be done either manually or done automatically by installing visibility-migrator beforehand.
 * Note that uninstalling sources manually before installing means no visibility conditions are enabled between the transitions
 */

def liveSources = FrameworkService.getBundleContext().getBundles().findAll {
    sources.contains(it.getSymbolicName()) && it.getState() != Bundle.UNINSTALLED
}.collect { it.getSymbolicName() };

if (!liveSources.isEmpty()) {
    // Warn rather than stop. Core unregisters condition rules, background actions and rules
    // packages by NAME, so uninstalling a source module later drops jContent's registrations
    // alongside its own - a hazard this script cannot prevent and must not hide.
    log.warn("Switching visibility condition nodetypes to {} while {} is still installed. Conditions keep working, but uninstalling {} will clear {}'s condition rules, background actions and rules package. Install visibility-migrator, which removes the source before {} registers anything.",
            target, liveSources, liveSources, target, target);
}

def stranded = NodeTypeRegistry.getInstance().getAllNodeTypes(sources).findAll { toSwitch.contains(it.getName()) };
if (stranded.isEmpty()) {
    log.info("Nothing to switch to {}: no nodetype is still owned by {}.", target, sources);
    return;
}

log.info("Switch {} nodetype(s) over to {}: {}", stranded.size(), target, stranded.collect { it.getName() });
def field = ExtendedNodeType.getDeclaredField("systemId");
field.setAccessible(true);
try {
    stranded.each { nodeType ->
        field.set(nodeType, target);
        log.info("Switched nodetype {} to systemId {}", nodeType.getName(), nodeType.getSystemId());
    }
} finally {
    field.setAccessible(false);
}

// Deploy definitions cluster-wide
def jcrStoreService = JCRStoreService.getInstance();
jcrStoreService.deployDefinitions(target);
log.info("Redeployed definitions for {}", target);
def nodeTypeRegistry = NodeTypeRegistry.getInstance();
sources.each { systemId ->
    jcrStoreService.undeployDefinitions(systemId);
    log.info("Removed definitions for {}", systemId);

    // Clear stale entry in memory (should only be systemID without defs by this point)
    if (!nodeTypeRegistry.getAllNodeTypes([systemId]).hasNext()) {
        nodeTypeRegistry.unregisterNodeTypes(systemId);
        log.info("Pruned the stale {} entry from the nodetype registry", systemId);
    } else {
        log.warn("Not pruning {}: nodetypes still report it as their systemId", systemId);
    }
}
