package org.jahia.modules.contenteditor.migration;

import org.osgi.framework.Bundle;
import org.osgi.framework.BundleContext;
import org.osgi.framework.BundleException;
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
 * instance is being unbound. Until now the answer was a separate migrator module installed
 * alongside.
 *
 * <p>Two properties make it possible to do it here instead.
 *
 * <p>The first is <em>when</em> this runs. jContent's condition rules are Declarative Services
 * components, and the service registry is what carries them to VisibilityService: an osgi:list on
 * VisibilityConditionRule binds each one through TemplatePackageRegistry, which calls addCondition
 * on bind and removeCondition on unbind. SCR activates those components once the bundle is ACTIVE,
 * which is after this activator returns. So at this point jContent has registered no rule yet, and
 * removing a source cannot take one down.
 *
 * <p>The second is <em>how</em> it removes them. Bundle.stop() and Bundle.uninstall() do not go
 * through ModuleManager, so there is no cluster operation to wait for. That matters beyond
 * tidiness: a clustered uninstall asked for from a module lifecycle callback does not complete,
 * because Jahia gives Karaf Cellar's event dispatcher a single worker thread and the caller is
 * occupying it. The local call has nothing to wait for. Every node runs its own activator, so
 * every node removes its own copy.
 *
 * <p>Local is not the same as invisible, and one effect does reach the cluster. The module
 * extender handles the uninstall synchronously, and on the processing server that schedules
 * clearModuleNodes for the removed module, which deletes its nodes in the shared repository. That
 * deletion is wanted, and it is the same one a clustered uninstall would produce. It runs on a
 * Quartz thread, so it is neither ordered against what follows here nor covered by the error
 * handling below.
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
 * <p>A source that cannot be removed is the other gap. Uninstalling needs the framework's global
 * lock, which Felix will not grant to a thread already holding a bundle lock, so a module install
 * running at the same moment can make the attempt fail. That contention is brief and the removal
 * is retried, but the retries are bounded because this runs inside jContent's own start. When they
 * are exhausted jContent starts with the source still in place, which is the situation this class
 * exists to avoid, so the failure is logged as an error naming the module and what to do about it.
 *
 * <p>Once no supported upgrade path still has a source installed, this class and its call in the
 * activator can go.
 */
public final class VisibilityRetirement {

    private static final Logger logger = LoggerFactory.getLogger(VisibilityRetirement.class);

    /**
     * The modules whose condition node types jContent takes over. Removal follows this list rather
     * than the framework's own order, so it does not depend on which module happened to be
     * installed first.
     */
    private static final List<String> SOURCES = Arrays.asList("advanced-visibility", "visibility");

    /**
     * Uninstalling needs the framework's global lock, and this thread holds jContent's bundle lock
     * while it asks. Felix refuses that combination rather than deadlocking, so a module install
     * running at the same moment can make one attempt fail. The contention is brief, hence the
     * retry; the attempts are few and the wait short, because this runs inside jContent's start.
     */
    private static final int ATTEMPTS = 3;
    private static final long BACKOFF_MS = 200L;

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

    /**
     * The installed sources, in SOURCES order. Iterating that list rather than the framework's
     * bundles is what makes the order fixed: getBundles() answers in bundle id order, which is
     * install order, so it would vary with how the environment was built.
     */
    private static List<Bundle> findSources(BundleContext context) {
        List<Bundle> found = new ArrayList<>();
        for (String name : SOURCES) {
            for (Bundle bundle : context.getBundles()) {
                if (name.equals(bundle.getSymbolicName()) && bundle.getState() != Bundle.UNINSTALLED) {
                    found.add(bundle);
                }
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
        // A failed stop must not skip the uninstall, because uninstall() stops an active bundle
        // itself. Giving up here would leave the source in place for the sake of a step it repeats.
        try {
            source.stop();
        } catch (BundleException | RuntimeException e) {
            logger.warn("Could not stop {} v{} on this node; uninstalling it anyway", name, version, e);
        }
        Exception last = null;
        for (int attempt = 1; attempt <= ATTEMPTS; attempt++) {
            try {
                source.uninstall();
                if (logger.isWarnEnabled()) {
                    logger.warn("Removed {} v{} on this node in {} ms", name, version,
                            (System.nanoTime() - began) / 1_000_000L);
                }
                return;
            } catch (BundleException | RuntimeException e) {
                last = e;
                if (attempt < ATTEMPTS) {
                    logger.warn("Attempt {} of {} to remove {} v{} failed; retrying", attempt,
                            ATTEMPTS, name, version, e);
                    sleep(BACKOFF_MS);
                }
            }
        }
        logger.error("Cannot remove {} v{} on this node after {} attempts. jContent starts, but the "
                + "condition rules will be torn down when {} is next stopped or removed. To recover, "
                + "uninstall {} and redeploy jContent.", name, version, ATTEMPTS, name, name, last);
    }

    private static void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
