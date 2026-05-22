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

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Modern implementation using Jahia 8.2.4.0+ optimized ContentHistoryService methods.
 * Uses reflection to maintain backward compatibility at compile time.
 *
 * TODO: When upgrading to Jahia 8.2.4.0+:
 *  1. Delete this class
 *  2. Delete {@link LegacyContentHistoryAdapter}
 *  3. Delete {@link ContentHistoryAdapter}
 *  4. Delete {@link ContentHistoryProvider}
 *  5. Update {@link org.jahia.modules.contenteditor.graphql.api.types.GqlContentHistory}
 *     to call ContentHistoryService methods directly
 *
 * @deprecated This class will be removed when Jahia 8.2.4.0 becomes the minimum required version.
 */
@Deprecated(since = "jContent 3.x", forRemoval = true)
class ModernContentHistoryAdapter implements ContentHistoryProvider {

    private static final Method paginatedMethod;
    private static final Method countMethod;

    static {
        try {
            paginatedMethod = ContentHistoryService.class.getMethod(
                "getNodeHistory",
                JCRNodeWrapper.class,
                boolean.class,
                int.class,
                int.class
            );
            countMethod = ContentHistoryService.class.getMethod(
                "getNodeHistoryCount",
                JCRNodeWrapper.class,
                boolean.class
            );
        } catch (NoSuchMethodException e) {
            throw new IllegalStateException("Modern methods not available - should use LegacyContentHistoryAdapter", e);
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<HistoryEntry> getHistory(JCRNodeWrapper node, boolean withLanguageNodes, String action, int offset, int limit) {
        try {
            List<HistoryEntry> entries;

            // If action filter is provided, get all entries and filter manually as the current API does not provide such capability
            // TODO: replace with a service implementation when jahia parent version >= 8.2.4.0
            if (action != null && !action.trim().isEmpty()) {
                entries = (List<HistoryEntry>) paginatedMethod.invoke(
                    ContentHistoryService.getInstance(),
                    node,
                    withLanguageNodes,
                    0,
                    -1
                );

                entries = entries.stream()
                    .filter(entry -> action.equals(entry.getAction()))
                    .collect(Collectors.toList());

                // Apply pagination after filtering
                if (offset > 0 || limit != -1) {
                    Stream<HistoryEntry> paginatedEntries = entries.stream();
                    if (offset > 0) {
                        paginatedEntries = paginatedEntries.skip(offset);
                    }
                    if (limit > 0) {
                        paginatedEntries = paginatedEntries.limit(limit);
                    }
                    entries = paginatedEntries.collect(Collectors.toList());
                }

                return entries;
            }

            // No action filter, use pagination directly
            return (List<HistoryEntry>) paginatedMethod.invoke(
                ContentHistoryService.getInstance(),
                node,
                withLanguageNodes,
                offset,
                limit
            );
        } catch (IllegalAccessException | InvocationTargetException e) {
            throw new RuntimeException("Failed to call getNodeHistory via reflection", e);
        }
    }

    @Override
    public int getHistoryCount(JCRNodeWrapper node, boolean withLanguageNodes, String action) {
        try {
            // If action filter is provided, get all entries and filter
            // TODO: replace with a service implementation
            if (action != null && !action.trim().isEmpty()) {
                @SuppressWarnings("unchecked")
                List<HistoryEntry> allEntries = (List<HistoryEntry>) paginatedMethod.invoke(
                    ContentHistoryService.getInstance(),
                    node,
                    withLanguageNodes,
                    0,
                    -1
                );

                return (int) allEntries.stream()
                    .filter(entry -> action.equals(entry.getAction()))
                    .count();
            }

            // No action filter, use count method directly
            return (Integer) countMethod.invoke(
                ContentHistoryService.getInstance(),
                node,
                withLanguageNodes
            );
        } catch (IllegalAccessException | InvocationTargetException e) {
            throw new RuntimeException("Failed to call getNodeHistoryCount via reflection", e);
        }
    }
}
