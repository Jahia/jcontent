package org.jahia.modules.contenteditor.migration;

import org.osgi.framework.Bundle;
import org.osgi.framework.BundleContext;
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
 * <p>The first is <em>when</em> this runs. A bundle's own activator is called from inside
 * Felix.startBundle, before the STARTED event that makes the Jahia module extender register the
 * package, its rules and its observers. So this is the last moment at which jContent has switched
 * the node types over and has still registered nothing that an uninstall could tear down.
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

    private VisibilityRetirement() {
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
        long began = System.currentTimeMillis();
        try {
            source.stop();
            source.uninstall();
            logger.info("Removed {} v{} on this node in {} ms", name, version,
                    System.currentTimeMillis() - began);
        } catch (Exception e) {  // NOSONAR - one source failing must not stop the next
            logger.error("Cannot remove {} v{} on this node. jContent starts, but the condition "
                    + "rules will be torn down when {} is next stopped or removed.", name, version,
                    name, e);
        }
    }
}
