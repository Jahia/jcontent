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

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Legacy implementation for Jahia 8.2.1.0-8.2.3.x using deprecated ContentHistoryService methods.
 * Implements pagination using Java streams.
 *
 * TODO: When upgrading to Jahia 8.2.4.0+:
 *  1. Delete this class
 *  2. Delete {@link ModernContentHistoryAdapter}
 *  3. Delete {@link ContentHistoryAdapter}
 *  4. Delete {@link ContentHistoryProvider}
 *  5. Update {@link org.jahia.modules.contenteditor.graphql.api.types.GqlContentHistory}
 *     to call ContentHistoryService methods directly
 *
 * @deprecated This class will be removed when Jahia 8.2.4.0 becomes the minimum required version.
 */
@Deprecated(since = "jContent 3.x", forRemoval = true)
class LegacyContentHistoryAdapter implements ContentHistoryProvider {

    @Override
    public List<HistoryEntry> getHistory(JCRNodeWrapper node, boolean withLanguageNodes, String action, int offset, int limit) {
        @SuppressWarnings("deprecation")
        List<HistoryEntry> allEntries = ContentHistoryService.getInstance()
                .getNodeHistory(node, withLanguageNodes);

        // Apply action filter if provided
        if (action != null && !action.trim().isEmpty()) {
            allEntries = allEntries.stream()
                    .filter(entry -> action.equals(entry.getAction()))
                    .collect(Collectors.toList());
        }

        Stream<HistoryEntry> stream = allEntries.stream()
                .sorted(Comparator.comparingLong((HistoryEntry e) -> e.getDate() != null ? e.getDate() : 0L).reversed());

        if (offset > 0) {
            stream = stream.skip(offset);
        }

        if (limit > 0) {
            stream = stream.limit(limit);
        }

        return stream.collect(Collectors.toList());
    }

    @Override
    public int getHistoryCount(JCRNodeWrapper node, boolean withLanguageNodes, String action) {
        @SuppressWarnings("deprecation")
        List<HistoryEntry> allEntries = ContentHistoryService.getInstance()
                .getNodeHistory(node, withLanguageNodes);

        // Apply action filter if provided
        if (action != null && !action.trim().isEmpty()) {
            return (int) allEntries.stream()
                    .filter(entry -> action.equals(entry.getAction()))
                    .count();
        }

        return allEntries.size();
    }
}
