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
package org.jahia.modules.contenteditor.graphql.api.types;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;
import org.jahia.services.history.HistoryEntry;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

/**
 * GraphQL representation of a content history entry
 */
@GraphQLDescription("Represents a content change event entry")
public class GqlContentHistoryEntry {

    private final HistoryEntry historyEntry;

    public GqlContentHistoryEntry(HistoryEntry historyEntry) {
        this.historyEntry = historyEntry;
    }

    @GraphQLField
    @GraphQLDescription("The unique identifier of the history entry")
    public String getId() {
        return historyEntry.getId();
    }

    @GraphQLField
    @GraphQLDescription("The timestamp of the history entry in ISO 8601 format")
    public String getDate() {
        if (historyEntry.getDate() == null) {
            return null;
        }
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
        return sdf.format(new Date(historyEntry.getDate()));
    }

    @GraphQLField
    @GraphQLDescription("The timestamp of the history entry as milliseconds since epoch")
    public Long getTimestamp() {
        return historyEntry.getDate();
    }

    @GraphQLField
    @GraphQLDescription("The path of the node at the time of the event")
    public String getPath() {
        return historyEntry.getPath();
    }

    @GraphQLField
    @GraphQLDescription("The UUID of the node")
    public String getUuid() {
        return historyEntry.getUuid();
    }

    @GraphQLField
    @GraphQLDescription("The action performed (e.g., created, updated, deleted, published)")
    public String getAction() {
        return historyEntry.getAction();
    }

    @GraphQLField
    @GraphQLDescription("The property name if the action was on a specific property")
    public String getPropertyName() {
        return historyEntry.getPropertyName();
    }

    @GraphQLField
    @GraphQLDescription("The user key who performed the action")
    public String getUserKey() {
        return historyEntry.getUserKey();
    }

    @GraphQLField
    @GraphQLDescription("Additional message about the event")
    public String getMessage() {
        return historyEntry.getMessage();
    }

    @GraphQLField
    @GraphQLName("language")
    @GraphQLDescription("The language code if the entry is for a language-specific node")
    public String getLanguage() {
        return historyEntry.getLocale() != null ? historyEntry.getLocale().toString() : null;
    }
}
