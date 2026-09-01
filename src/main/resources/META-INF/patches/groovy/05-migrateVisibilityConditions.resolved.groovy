import org.jahia.osgi.FrameworkService
import org.jahia.services.content.JCRStoreService
import org.jahia.services.content.nodetypes.ExtendedNodeType
import org.jahia.services.content.nodetypes.NodeTypeRegistry
import org.osgi.framework.Bundle

def sources = ["advanced-visibility", "visibility"];
def target = "jcontent";
def toSwitch = ["jnt:timeOfDayCondition", "jnt:dayOfWeekCondition", "jnt:startEndDateCondition"];

/**
 * Moves the visibility condition node types over to jContent. Half of the migration: this part
 * changes who owns the definitions, and jContent's own activator removes the module they came
 * from, on every node, before jContent registers the condition rules.
 *
 * No prerequisite. Removing the source by hand beforehand also works, at the cost of a window in
 * which no visibility condition is evaluated; leaving it in place has no such window, because the
 * handover here and the removal there happen within the same bundle start.
 */

def liveSources = FrameworkService.getBundleContext().getBundles().findAll {
    sources.contains(it.getSymbolicName()) && it.getState() != Bundle.UNINSTALLED
}.collect { it.getSymbolicName() };

if (!liveSources.isEmpty()) {
    // Not a warning any more, and nothing for the reader to do. This script runs in the resolved
    // phase, and jContent's own activator removes the source a moment later, before jContent
    // registers the condition rules that uninstalling it would otherwise tear down. Saying so
    // here keeps the two halves legible to whoever reads the log in that order.
    log.info("Switching visibility condition nodetypes to {} while {} is still installed. jContent removes {} from this node as it starts, before registering its condition rules.",
            target, liveSources, liveSources);
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
