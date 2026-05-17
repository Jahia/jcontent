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
 * UUID-based implementation using Jahia 8.2.4.0+ ContentHistoryService methods.
 * Uses {@code getNodeHistoryByUuid} which resolves all historical paths a node has ever had
 * (handles moves), sets {@code childNodeType} and {@code subNodeName}, supports native action
 * filtering, native DESC sort, and native pagination.
 * Uses reflection to maintain backward compatibility at compile time.
 *
 * TODO: When the UUID-based API becomes part of the minimum required Jahia version, collapse
 *  this class and its siblings into a direct service call in GqlContentHistory.
 *
 * @deprecated This class will be removed when the UUID-based API becomes the minimum required version.
 */
@Deprecated(since = "jContent 3.x", forRemoval = true)
class ModernContentHistoryAdapter implements ContentHistoryProvider {

    private static final Method getByUuid;
    private static final Method getByUuidFiltered;
    private static final Method countByUuid;
    private static final Method countByUuidFiltered;

    static {
        Method byUuid = null;
        Method byUuidFiltered = null;
        Method count = null;
        Method countFiltered = null;
        try {
            byUuid = ContentHistoryService.class.getMethod(
                    "getNodeHistoryByUuid", String.class, int.class, int.class);
            byUuidFiltered = ContentHistoryService.class.getMethod(
                    "getNodeHistoryByUuid", String.class, Collection.class, int.class, int.class);
            count = ContentHistoryService.class.getMethod(
                    "getNodeHistoryByUuidCount", String.class);
            countFiltered = ContentHistoryService.class.getMethod(
                    "getNodeHistoryByUuidCount", String.class, Collection.class);
        } catch (NoSuchMethodException e) {
            // Older Jahia version — will not be instantiated
        }
        getByUuid = byUuid;
        getByUuidFiltered = byUuidFiltered;
        countByUuid = count;
        countByUuidFiltered = countFiltered;
    }

    static boolean isAvailable() {
        return getByUuid != null && countByUuid != null;
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<HistoryEntry> getHistory(JCRNodeWrapper node, boolean withLanguageNodes, String action, int offset, int limit) {
        try {
            String uuid = node.getIdentifier();
            boolean hasFilter = action != null && !action.trim().isEmpty();
            if (hasFilter) {
                return (List<HistoryEntry>) getByUuidFiltered.invoke(
                        ContentHistoryService.getInstance(),
                        uuid, Collections.singletonList(action), offset, limit);
            }
            return (List<HistoryEntry>) getByUuid.invoke(
                    ContentHistoryService.getInstance(), uuid, offset, limit);
        } catch (IllegalAccessException | InvocationTargetException | javax.jcr.RepositoryException e) {
            throw new RuntimeException("Failed to call getNodeHistoryByUuid via reflection", e);
        }
    }

    @Override
    public int getHistoryCount(JCRNodeWrapper node, boolean withLanguageNodes, String action) {
        try {
            String uuid = node.getIdentifier();
            boolean hasFilter = action != null && !action.trim().isEmpty();
            if (hasFilter) {
                return (Integer) countByUuidFiltered.invoke(
                        ContentHistoryService.getInstance(),
                        uuid, Collections.singletonList(action));
            }
            return (Integer) countByUuid.invoke(ContentHistoryService.getInstance(), uuid);
        } catch (IllegalAccessException | InvocationTargetException | javax.jcr.RepositoryException e) {
            throw new RuntimeException("Failed to call getNodeHistoryByUuidCount via reflection", e);
        }
    }
}
