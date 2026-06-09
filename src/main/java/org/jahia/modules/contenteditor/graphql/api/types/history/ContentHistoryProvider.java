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
import org.jahia.services.history.HistoryEntry;

import java.util.List;

/**
 * Interface for version-specific ContentHistoryService implementations.
 * 
 * @deprecated This interface will be removed when Jahia 8.2.4.0 becomes the minimum required version.
 */
@Deprecated(since = "jContent 3.x", forRemoval = true)
interface ContentHistoryProvider {

    /**
     * Get paginated history entries for a node.
     * 
     * @param node the JCR node
     * @param withLanguageNodes whether to include language-specific nodes
     * @param action filter by specific action (null for all actions)
     * @param offset number of entries to skip
     * @param limit maximum number of entries to return (-1 for all)
     * @return list of history entries
     */
    List<HistoryEntry> getHistory(JCRNodeWrapper node, boolean withLanguageNodes, String action, int offset, int limit);

    /**
     * Get total count of history entries for a node.
     * 
     * @param node the JCR node
     * @param withLanguageNodes whether to include language-specific nodes
     * @param action filter by specific action (null for all actions)
     * @return count of history entries
     */
    int getHistoryCount(JCRNodeWrapper node, boolean withLanguageNodes, String action);
}
