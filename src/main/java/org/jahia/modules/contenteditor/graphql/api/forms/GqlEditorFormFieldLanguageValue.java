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
package org.jahia.modules.contenteditor.graphql.api.forms;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import org.jahia.modules.contenteditor.api.forms.model.FieldLanguageValue;

import java.util.List;
import java.util.stream.Collectors;

public class GqlEditorFormFieldLanguageValue {
    private final FieldLanguageValue fieldLanguageValue;

    public GqlEditorFormFieldLanguageValue(FieldLanguageValue fieldLanguageValue) {
        this.fieldLanguageValue = fieldLanguageValue;
    }

    @GraphQLField
    @GraphQLDescription("The language (locale code) this value belongs to")
    public String getLanguage() {
        return fieldLanguageValue.getLanguage();
    }

    @GraphQLField
    @GraphQLDescription("The field's value(s) in this language")
    public List<GqlEditorFormValue> getValues() {
        return fieldLanguageValue.getValues().stream().map(GqlEditorFormValue::new).collect(Collectors.toList());
    }

    @GraphQLField
    @GraphQLDescription("True if the current user cannot edit this field in this language (locked or missing permission)")
    public Boolean getReadOnly() {
        return fieldLanguageValue.isReadOnly();
    }
}
