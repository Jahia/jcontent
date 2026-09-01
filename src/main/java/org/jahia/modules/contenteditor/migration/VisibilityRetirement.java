package org.jahia.modules.contenteditor.migration;

import org.osgi.framework.Bundle;
import org.osgi.framework.BundleContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Removes the modules jContent takes the visibility conditions over from, on this node, before
 * jContent registers anything of its own.
 *
 * <p>05-migrateVisibilityConditions.resolved.groovy moves the condition node types to jContent,
 * and that part works. What it cannot do is remove the module they came from: uninstalling it
 * afterwards tears down the condition rules, the background actions and the rules package that
 * jContent has by then registered under the same node type names, because
 * VisibilityService.removeCondition matches on the node type name alone and does not check which
 * module registered it. Until now the answer was a separate migrator module installed alongside.
 *
 * <p>Two properties make it possible to do it here instead.
 *
 * <p>The first is <em>when</em> this runs. The module extender listens synchronously, so its
 * handling of a bundle event finishes before the framework moves on. By the time this activator
 * is called from inside Felix.startBundle, the extender has already handled RESOLVED: the package
 * is registered and the definitions are deployed. What it has NOT yet done is <em>start</em> the
 * module, and the condition rules are registered there, on the STARTED event that Felix fires
 * after this returns. The rules are the thing an uninstall of the source tears down, so this is
 * the last moment at which they are not yet at risk.
 *
 * <p>The second is <em>how</em> it removes them. Bundle.stop() and Bundle.uninstall() act on this
 * node only. They do not go through ModuleManager, so there is no cluster operation to wait for.
 * That matters beyond tidiness: a clustered uninstall asked for from a module lifecycle callback
 * does not complete, because Jahia gives Karaf Cellar's event dispatcher a single worker thread
 * and the caller is occupying it. The local call has nothing to wait for. Every node runs its own
 * activator, so every node removes its own copy.
 *
 * <p>Nothing here is allowed to throw. An exception escaping an activator aborts the bundle start,
 * which would leave jContent itself down.
 *
 * <p>The two halves of the migration do not run on the same nodes, which is deliberate and easy
 * to misread. 05-migrateVisibilityConditions.resolved.groovy is a patch script, and the extender
 * only runs those on the processing server; the definitions likewise reach a browsing node
 * through the database rather than through the bundle. This class runs on every node, because
 * every node has its own copy of the source bundle to remove. So a browsing node removes a module
 * whose node types it never re-owned locally, and that is correct.
 *
 * <h2>Running on every start, and what that does not cover</h2>
 *
 * <p>This runs each time jContent starts, and it is harmless when there is nothing to do: with no
 * source installed it walks the bundle list and returns. It is not guarded by an "already
 * migrated" flag on purpose. Such a flag would have to be shared across the cluster, and a node
 * that was down during the migration would then read the flag, skip, and come back up still
 * carrying the module the others have removed.
 *
 * <p>A source installed again after the migration is therefore removed at the next start of
 * jContent, not the moment it appears. In that window it is the source, not jContent, that
 * provides the condition rules, and stopping it there unregisters jContent's along with its own,
 * through the same name matching. Restarting jContent puts them back. Watching for the source
 * continuously would close the window, at the price of a permanent listener in jContent for a
 * state someone has to create deliberately, so it is left open and written down instead.
 *
 * <p>Once no supported upgrade path still has a source installed, this class and its call in the
 * activator can go.
 */
public final class VisibilityRetirement {

    private static final Logger logger = LoggerFactory.getLogger(VisibilityRetirement.class);

    /** The modules whose condition node types jContent takes over. */
    private static final List<String> SOURCES = Arrays.asList("advanced-visibility", "visibility");

    private VisibilityRetirement() {
    }

    /**
     * Remove the source modules from this node.
     *
     * @param context this bundle's context, as handed to the activator
     */
    public static void retireSources(BundleContext context) {
        try {
            List<Bundle> present = findSources(context);
            if (present.isEmpty()) {
                return;
            }
            // WARN, not INFO: removing a module the operator may have installed on purpose is not
            // routine, and it must be visible in a log someone actually reads.
            if (logger.isWarnEnabled()) {
                logger.warn("Removing {} on this node before jContent registers its condition rules. "
                        + "jContent owns the visibility condition node types, so the two cannot both "
                        + "provide them.", names(present));
            }
            for (Bundle source : present) {
                uninstallLocally(source);
            }
        } catch (Exception e) {  // NOSONAR - an activator that throws takes jContent down with it
            logger.error("Could not retire the visibility source modules; jContent starts anyway, "
                    + "and the condition rules may be torn down when they are next removed", e);
        }
    }

    private static List<Bundle> findSources(BundleContext context) {
        List<Bundle> found = new ArrayList<>();
        for (Bundle bundle : context.getBundles()) {
            if (SOURCES.contains(bundle.getSymbolicName()) && bundle.getState() != Bundle.UNINSTALLED) {
                found.add(bundle);
            }
        }
        return found;
    }

    private static String names(List<Bundle> bundles) {
        StringBuilder joined = new StringBuilder();
        for (Bundle bundle : bundles) {
            if (joined.length() > 0) {
                joined.append(", ");
            }
            joined.append(bundle.getSymbolicName()).append(" v").append(bundle.getVersion());
        }
        return joined.toString();
    }

    private static void uninstallLocally(Bundle source) {
        String name = source.getSymbolicName();
        String version = source.getVersion().toString();
        // nanoTime, not currentTimeMillis: this is a duration, and a wall-clock adjustment
        // mid-migration would print a negative one.
        long began = System.nanoTime();
        try {
            source.stop();
            source.uninstall();
            logger.info("Removed {} v{} on this node in {} ms", name, version,
                    (System.nanoTime() - began) / 1_000_000L);
        } catch (Exception e) {  // NOSONAR - one source failing must not stop the next
            logger.error("Cannot remove {} v{} on this node. jContent starts, but the condition "
                    + "rules will be torn down when {} is next stopped or removed.", name, version,
                    name, e);
        }
    }
}
