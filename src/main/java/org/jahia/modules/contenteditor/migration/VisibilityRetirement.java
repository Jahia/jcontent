package org.jahia.modules.contenteditor.migration;

import org.jahia.osgi.FrameworkService;
import org.jahia.services.visibility.VisibilityConditionRule;
import org.jahia.services.visibility.VisibilityService;
import org.osgi.framework.Bundle;
import org.osgi.framework.BundleContext;
import org.osgi.framework.BundleEvent;
import org.osgi.framework.BundleListener;
import org.osgi.framework.InvalidSyntaxException;
import org.osgi.framework.ServiceReference;
import org.osgi.framework.SynchronousBundleListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.nio.charset.StandardCharsets;
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
 * <h2>Running on every start</h2>
 *
 * <p>This runs each time jContent starts, and it is written to be harmless when there is nothing
 * to do: with no source installed it walks the bundle list and returns. It is not guarded by a
 * "already migrated" flag on purpose. Such a flag would have to be shared across the cluster, and
 * a node that was down during the migration would then read the flag, skip, and come back up
 * still carrying the module the others have removed.
 *
 * <p>It therefore also removes a source that is installed <em>after</em> the migration. That is
 * deliberate rather than incidental: the two modules declare the same condition node types, so
 * only one of them can own them, and whichever registers second has its definitions ignored. They
 * do not coexist correctly, which is the whole reason this migration exists. The removal is
 * logged at WARN so it is never silent.
 *
 * <p>A source that arrives later is removed by {@link #watch(BundleContext)} rather than waiting
 * for the next start of jContent, and a source that is stopped rather than removed triggers a
 * re-registration of jContent's own condition rules. Both cover the same ground the separate
 * migrator module covered, and the second one matters because VisibilityService.removeCondition
 * matches on the node type name alone: stopping the source unregisters the rules jContent had
 * published under those names, and nothing else would put them back.
 *
 * <p>Once no supported upgrade path still has a source installed, this class and its call in the
 * activator can go.
 */
public final class VisibilityRetirement {

    private static final Logger logger = LoggerFactory.getLogger(VisibilityRetirement.class);

    /** The modules whose condition node types jContent takes over. */
    private static final List<String> SOURCES = Arrays.asList("advanced-visibility", "visibility");

    private static final String DEFINITIONS_ENTRY = "/META-INF/definitions.cnd";

    /**
     * One of the condition node types being taken over. Reading it out of jContent's own
     * definitions is what tells this code that this build is the one that owns them: a jContent
     * that does not declare them has no business removing the module that does.
     */
    private static final String MARKER_TYPE = "jnt:startEndDateCondition";

    /** The node types jContent takes over, and the only ones whose rules this repairs. */
    private static final List<String> CONDITION_TYPES = Arrays.asList(
            "jnt:timeOfDayCondition", "jnt:dayOfWeekCondition", "jnt:startEndDateCondition");

    private VisibilityRetirement() {
    }

    /**
     * Keep removing a source that turns up later, and repair the rules when one is stopped.
     *
     * <p>Synchronous on purpose: a source installed by FileInstall, by provisioning or by a
     * restore has to be gone before anything registers against it.
     *
     * @param context this bundle's context
     * @return the listener, so the activator can remove it on stop
     */
    public static BundleListener watch(BundleContext context) {
        BundleListener listener = (SynchronousBundleListener) event -> {
            Bundle bundle = event.getBundle();
            if (bundle == null || !SOURCES.contains(bundle.getSymbolicName())) {
                return;
            }
            try {
                if (event.getType() == BundleEvent.INSTALLED) {
                    logger.warn("{} was installed after jContent took over the visibility condition "
                            + "node types; removing it on this node", bundle.getSymbolicName());
                    uninstallLocally(bundle);
                } else if (event.getType() == BundleEvent.STOPPED) {
                    reregisterConditionRules();
                }
            } catch (RuntimeException e) {  // NOSONAR - throwing here aborts the framework's operation
                logger.error("Could not react to {} of {}", event.getType(), bundle.getSymbolicName(), e);
            }
        };
        context.addBundleListener(listener);
        return listener;
    }

    /**
     * Put jContent's own condition rules back after a source was stopped.
     *
     * <p>The extender unregisters a stopped module's conditions by node type name, and
     * VisibilityService.removeCondition does not check which module registered the one it removes.
     * So stopping a source takes jContent's rules with it, silently, and the conditions stop being
     * evaluated until jContent is restarted. Re-publishing what jContent still has registered as
     * OSGi services is what undoes that.
     */
    private static void reregisterConditionRules() {
        BundleContext systemContext = FrameworkService.getBundleContext();
        if (systemContext == null) {
            return;
        }
        int restored = 0;
        try {
            for (ServiceReference<VisibilityConditionRule> reference
                    : systemContext.getServiceReferences(VisibilityConditionRule.class, null)) {
                VisibilityConditionRule rule = systemContext.getService(reference);
                if (rule == null) {
                    continue;
                }
                try {
                    if (CONDITION_TYPES.contains(rule.getAssociatedNodeType())) {
                        VisibilityService.getInstance().addCondition(rule.getAssociatedNodeType(), rule);
                        restored++;
                    }
                } finally {
                    // getService bumps the use count, and this runs again on every stop.
                    systemContext.ungetService(reference);
                }
            }
        } catch (InvalidSyntaxException e) {
            logger.error("Cannot look up the published visibility condition rules", e);
        }
        if (restored > 0) {
            logger.warn("Re-registered {} visibility condition rule(s) that stopping a source module "
                    + "had removed", restored);
        }
    }

    /**
     * Remove the source modules from this node, if this jContent carries the condition types.
     *
     * @param context this bundle's context, as handed to the activator
     */
    public static void retireSources(BundleContext context) {
        try {
            if (!declaresConditionTypes(context.getBundle())) {
                logger.debug("This build of jContent does not declare {}, so it leaves {} alone",
                        MARKER_TYPE, SOURCES);
                return;
            }
            List<Bundle> present = findSources(context);
            if (present.isEmpty()) {
                return;
            }
            // WARN, not INFO: removing a module the operator may have installed on purpose is
            // not routine, and it must be visible in a log someone actually reads.
            logger.warn("Removing {} on this node before jContent registers its condition rules. "
                    + "jContent owns the visibility condition node types, so the two cannot both "
                    + "provide them.", names(present));
            for (Bundle source : present) {
                uninstallLocally(source);
            }
        } catch (Exception e) {  // NOSONAR - an activator that throws takes jContent down with it
            logger.error("Could not retire the visibility source modules; jContent starts anyway, "
                    + "and the condition rules may be torn down when they are next removed", e);
        }
    }

    private static boolean declaresConditionTypes(Bundle bundle) {
        URL definitions = bundle.getEntry(DEFINITIONS_ENTRY);
        if (definitions == null) {
            return false;
        }
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(definitions.openStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.contains(MARKER_TYPE)) {
                    return true;
                }
            }
        } catch (IOException e) {
            logger.warn("Cannot read {} of jContent; treating it as not carrying the condition "
                    + "node types, so nothing is removed", DEFINITIONS_ENTRY, e);
        }
        return false;
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

    private static List<Bundle> findSources(BundleContext context) {
        List<Bundle> found = new ArrayList<>();
        for (Bundle bundle : context.getBundles()) {
            if (SOURCES.contains(bundle.getSymbolicName()) && bundle.getState() != Bundle.UNINSTALLED) {
                found.add(bundle);
            }
        }
        return found;
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
