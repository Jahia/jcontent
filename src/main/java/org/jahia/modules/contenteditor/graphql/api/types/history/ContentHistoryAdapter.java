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
package org.jahia.modules.contenteditor.graphql.api.types.history;

import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.history.ContentHistoryService;
import org.jahia.services.history.HistoryEntry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.reflect.Method;
import java.util.List;

/**
 * Adapter to handle version-specific ContentHistoryService method calls.
 * 
 * This class encapsulates version detection logic and delegates to the appropriate implementation:
 * - Jahia 8.2.4.0+: Uses {@link ModernContentHistoryAdapter} (optimized methods)
 * - Jahia 8.2.1.0-8.2.3.x: Uses {@link LegacyContentHistoryAdapter} (deprecated methods with stream pagination)
 * 
 * @since jContent 3.x
 * @deprecated This adapter will be removed when Jahia 8.2.4.0 becomes the minimum required version.
 *             Direct calls to ContentHistoryService optimized methods will be used instead.
 */
@Deprecated(since = "jContent 3.x", forRemoval = true)
public final class ContentHistoryAdapter {

    private static final Logger logger = LoggerFactory.getLogger(ContentHistoryAdapter.class);
    private static volatile ContentHistoryProvider provider;
    private static volatile boolean initialized = false;

    private ContentHistoryAdapter() {
        // Utility class
    }

    /**
     * Get paginated history entries for a node.
     * 
     * @param node the JCR node
     * @param withLanguageNodes whether to include language-specific nodes
     * @param action filter by specific action (null for all actions)
     * @param offset number of entries to skip
     * @param limit maximum number of entries to return
     * @return list of history entries
     */
    public static List<HistoryEntry> getHistory(JCRNodeWrapper node, boolean withLanguageNodes, String action, int offset, int limit) {
        return getProvider().getHistory(node, withLanguageNodes, action, offset, limit);
    }

    /**
     * Get total count of history entries for a node.
     * 
     * @param node the JCR node
     * @param withLanguageNodes whether to include language-specific nodes
     * @param action filter by specific action (null for all actions)
     * @return count of history entries
     */
    public static int getHistoryCount(JCRNodeWrapper node, boolean withLanguageNodes, String action) {
        return getProvider().getHistoryCount(node, withLanguageNodes, action);
    }

    private static ContentHistoryProvider getProvider() {
        if (!initialized) {
            synchronized (ContentHistoryAdapter.class) {
                if (!initialized) {
                    provider = detectProvider();
                    initialized = true;
                }
            }
        }
        return provider;
    }

    private static ContentHistoryProvider detectProvider() {
        if (hasModernMethods()) {
            logger.info("Detected Jahia 8.2.4.0+ - Using optimized ContentHistoryService methods");
            return new ModernContentHistoryAdapter();
        } else {
            logger.info("Detected Jahia 8.2.1.0-8.2.3.x - Using legacy ContentHistoryService methods with stream pagination");
            return new LegacyContentHistoryAdapter();
        }
    }

    private static boolean hasModernMethods() {
        try {
            Method paginatedMethod = ContentHistoryService.class.getMethod(
                    "getNodeHistory",
                    JCRNodeWrapper.class,
                    boolean.class,
                    int.class,
                    int.class
            );
            Method countMethod = ContentHistoryService.class.getMethod(
                    "getNodeHistoryCount",
                    JCRNodeWrapper.class,
                    boolean.class
            );
            return paginatedMethod != null && countMethod != null;
        } catch (NoSuchMethodException e) {
            return false;
        }
    }
}
