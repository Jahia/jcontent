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

import java.util.List;

/**
 * Adapter to handle version-specific ContentHistoryService method calls.
 *
 * <p>Provider selection order (first match wins):
 * <ol>
 *   <li>{@link PathBasedContentHistoryAdapter} – preferred; uses
 *       {@code ContentHistoryService.getNodeHistoryByPath(String, Collection, int, int)} which
 *       covers sub-node history in a single DB query without requiring a JCR session.</li>
 *   <li>{@link ModernContentHistoryAdapter} – UUID-based; uses
 *       {@code ContentHistoryService.getNodeHistoryByUuid(String, Collection, int, int)} which
 *       resolves historical paths across node moves and sets {@code childNodeType}/{@code subNodeName}.</li>
 *   <li>{@link LegacyContentHistoryAdapter} – Jahia 8.2.1.0–8.2.3.x; uses deprecated node-based
 *       methods with in-memory stream pagination.</li>
 * </ol>
 *
 * @since jContent 3.x
 * @deprecated This adapter will be removed when the path-based API becomes part of the minimum
 *             required Jahia version. Direct calls to ContentHistoryService methods will be used
 *             instead.
 */
@Deprecated(since = "jContent 3.x", forRemoval = true)
public final class ContentHistoryAdapter {

    private static final Logger logger = LoggerFactory.getLogger(ContentHistoryAdapter.class);
    private static volatile ContentHistoryProvider provider;
    private static volatile boolean initialized = false;

    /**
     * Maximum number of entries that may be requested in a single page.
     * Mirrors {@code ContentHistoryService.MAX_HISTORY_PAGE_SIZE} when available;
     * falls back to {@link Integer#MAX_VALUE} on older Jahia versions that have no cap.
     */
    public static final int MAX_PAGE_SIZE;

    static {
        int cap = Integer.MAX_VALUE;
        try {
            cap = ContentHistoryService.class.getField("MAX_HISTORY_PAGE_SIZE").getInt(null);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            // Older Jahia version — no cap enforced by the service
        }
        MAX_PAGE_SIZE = cap;
    }

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
        if (PathBasedContentHistoryAdapter.isAvailable()) {
            logger.info("Detected path-based ContentHistoryService API - Using PathBasedContentHistoryAdapter");
            return new PathBasedContentHistoryAdapter();
        } else if (ModernContentHistoryAdapter.isAvailable()) {
            logger.info("Detected UUID-based ContentHistoryService API - Using ModernContentHistoryAdapter");
            return new ModernContentHistoryAdapter();
        } else {
            logger.info("Detected legacy ContentHistoryService API - Using LegacyContentHistoryAdapter");
            return new LegacyContentHistoryAdapter();
        }
    }
}
