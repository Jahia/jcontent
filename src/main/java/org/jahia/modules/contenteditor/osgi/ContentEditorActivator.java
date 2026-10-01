/*
 * MIT License
 *
 * Copyright (c) 2002 - 2022 Jahia Solutions Group. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
package org.jahia.modules.contenteditor.osgi;

import org.jahia.modules.contenteditor.migration.Migrator;
import org.jahia.modules.contenteditor.migration.VisibilityRetirement;
import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Content editor Activator, used to execute code when module is STARTING,
 * useful for migrating data before module startup
 */
public class ContentEditorActivator implements BundleActivator {

    private static final Logger logger = LoggerFactory.getLogger(ContentEditorActivator.class);

    @Override
    public void start(BundleContext bundleContext) {
        // First, and deliberately: this runs before SCR activates jContent's condition rules,
        // which is the only window in which the modules jContent takes the visibility conditions
        // over from can be removed without tearing those rules down again.
        //
        // Throwable, not Exception: anything escaping an activator aborts the bundle start, and
        // that includes the LinkageError a class this activator touches for the first time can
        // raise before its own handlers exist. A failed retirement must not take jContent down.
        try {
            VisibilityRetirement.retireSources(bundleContext);
        } catch (Throwable t) {  // NOSONAR - see above: jContent must start even if this fails
            logger.error("Could not retire the visibility source modules; jContent starts anyway", t);
        }
        Migrator.migrate();
    }

    @Override
    public void stop(BundleContext bundleContext) {
        // nothing to do
    }
}
