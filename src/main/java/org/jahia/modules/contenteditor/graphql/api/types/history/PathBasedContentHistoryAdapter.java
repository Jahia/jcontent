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
import java.util.Collection;
import java.util.Collections;
import java.util.List;

/**
 * Path-based implementation using {@code ContentHistoryService.getNodeHistoryByPath} methods.
 * <p>
 * This adapter is preferred over the node-based adapters because the path-based API:
 * <ul>
 *   <li>Requires no JCR session access (operates entirely on the history table).</li>
 *   <li>Includes sub-node history (i18n, ACL, visibility, vanity-URL children) via a single
 *       efficient database query.</li>
 *   <li>Exposes {@link HistoryEntry#getChildNodeType()} for each returned entry.</li>
 * </ul>
 * Uses reflection to maintain backward compatibility at compile time.
 */
class PathBasedContentHistoryAdapter implements ContentHistoryProvider {

    private static final Method getByPathMethod;
    private static final Method countByPathMethod;

    static {
        Method getMethod = null;
        Method countMethod = null;
        try {
            getMethod = ContentHistoryService.class.getMethod(
                    "getNodeHistoryByPath",
                    String.class,
                    Collection.class,
                    int.class,
                    int.class
            );
            countMethod = ContentHistoryService.class.getMethod(
                    "getNodeHistoryByPathCount",
                    String.class,
                    Collection.class
            );
        } catch (NoSuchMethodException e) {
            // Older Jahia version — path-based API not available; isAvailable() will return false
        }
        getByPathMethod = getMethod;
        countByPathMethod = countMethod;
    }

    /**
     * Returns {@code true} when the required path-based methods are available on
     * {@link ContentHistoryService}.
     */
    static boolean isAvailable() {
        return getByPathMethod != null && countByPathMethod != null;
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<HistoryEntry> getHistory(JCRNodeWrapper node, boolean withLanguageNodes, String action, int offset, int limit) {
        Collection<String> actions = toActionsCollection(action);
        try {
            return (List<HistoryEntry>) getByPathMethod.invoke(
                    ContentHistoryService.getInstance(),
                    node.getPath(),
                    actions,
                    offset,
                    limit
            );
        } catch (IllegalAccessException | InvocationTargetException e) {
            throw new RuntimeException("Failed to call getNodeHistoryByPath via reflection", e);
        }
    }

    @Override
    public int getHistoryCount(JCRNodeWrapper node, boolean withLanguageNodes, String action) {
        Collection<String> actions = toActionsCollection(action);
        try {
            return (Integer) countByPathMethod.invoke(
                    ContentHistoryService.getInstance(),
                    node.getPath(),
                    actions
            );
        } catch (IllegalAccessException | InvocationTargetException e) {
            throw new RuntimeException("Failed to call getNodeHistoryByPathCount via reflection", e);
        }
    }

    private static Collection<String> toActionsCollection(String action) {
        if (action == null || action.trim().isEmpty()) {
            return null;
        }
        return Collections.singletonList(action);
    }
}
