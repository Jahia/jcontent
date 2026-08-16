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
package org.jahia.modules.contenteditor.graphql.extensions;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;
import graphql.annotations.annotationTypes.GraphQLNonNull;
import graphql.annotations.annotationTypes.GraphQLTypeExtension;
import org.apache.commons.lang.StringUtils;
import org.jahia.modules.contenteditor.graphql.api.types.GqlMissingMandatoryI18nProperties;
import org.jahia.modules.contenteditor.graphql.api.types.GqlMissingMandatoryI18nProperty;
import org.jahia.modules.graphql.provider.dxm.DataFetchingException;
import org.jahia.modules.graphql.provider.dxm.node.GqlJcrNode;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.nodetypes.ExtendedNodeType;
import org.jahia.services.content.nodetypes.ExtendedPropertyDefinition;
import org.jahia.utils.LanguageCodeConverters;

import javax.jcr.Node;
import javax.jcr.RepositoryException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Publication-related JCR Node extensions.
 */
@GraphQLTypeExtension(GqlJcrNode.class)
public class JCRNodePublicationExtensions {

    private final GqlJcrNode node;

    public JCRNodePublicationExtensions(GqlJcrNode node) {
        this.node = node;
    }

    /**
     * EXACT MIRROR OF A SERVER CHECK: this reproduces, property by property, the logic of
     * org.jahia.services.content.JCRNodeWrapperImpl.checkI18nAndMandatoryPropertiesForLocale (jahia core),
     * which makes a language unpublishable (MANDATORY_LANGUAGE_UNPUBLISHABLE): it iterates
     * getPrimaryNodeType().getPropertyDefinitionsAsMap().values() - the RESOLVED definition map where a
     * primary-type override of an inherited definition (e.g. jnt:page redeclaring jcr:title as mandatory)
     * wins - keeps the definitions that are isInternationalized() && isMandatory(), and requires the
     * j:translation node of the locale to exist and to hold each of them (a property present with an empty
     * value counts as present). Mixins are deliberately ignored, exactly like the server. If core ever
     * changes that check, this field must follow; the blocked verdict itself always stays server-computed
     * via aggregatedPublicationInfo.publicationStatus.
     *
     * Note: this cannot be derived client-side from graphql-core's primaryNodeType.properties, which is
     * backed by getPropertyDefinitions() (the raw array) and returns the non-overridden inherited
     * definition (jcr:title on jnt:page reported as non-mandatory) - hence this module-local extension.
     *
     * @param languages the language codes to check
     * @param uiLocale  optional locale used to resolve the property labels; the JCR name is used when absent
     * @return one entry per requested language, with the missing mandatory internationalized properties
     */
    @GraphQLField
    @GraphQLName("missingMandatoryI18nProperties")
    @GraphQLDescription("The mandatory internationalized properties missing on this node per language, making the language unpublishable; empty for a language when the node itself passes the check")
    public List<GqlMissingMandatoryI18nProperties> getMissingMandatoryI18nProperties(
        @GraphQLName("languages") @GraphQLNonNull @GraphQLDescription("The language codes to check") List<String> languages,
        @GraphQLName("uiLocale") @GraphQLDescription("Locale used to resolve the property labels, e.g. en, fr; the JCR property name is used when absent") String uiLocale
    ) {
        try {
            JCRNodeWrapper jcrNode = node.getNode();
            ExtendedNodeType primaryNodeType = jcrNode.getPrimaryNodeType();
            List<ExtendedPropertyDefinition> candidates = new ArrayList<>();
            for (ExtendedPropertyDefinition definition : primaryNodeType.getPropertyDefinitionsAsMap().values()) {
                if (definition.isInternationalized() && definition.isMandatory()) {
                    candidates.add(definition);
                }
            }

            Locale labelLocale = uiLocale != null ? LanguageCodeConverters.getLocaleFromCode(uiLocale) : null;
            List<GqlMissingMandatoryI18nProperties> result = new ArrayList<>();
            for (String language : languages) {
                Locale locale = LanguageCodeConverters.getLocaleFromCode(language);
                Node i18n = jcrNode.hasI18N(locale, false) ? jcrNode.getI18N(locale, false) : null;
                List<GqlMissingMandatoryI18nProperty> missing = new ArrayList<>();
                for (ExtendedPropertyDefinition definition : candidates) {
                    if (i18n == null || !i18n.hasProperty(definition.getName())) {
                        missing.add(new GqlMissingMandatoryI18nProperty(definition.getName(), resolveLabel(definition, labelLocale, primaryNodeType)));
                    }
                }

                result.add(new GqlMissingMandatoryI18nProperties(language, missing));
            }

            return result;
        } catch (RepositoryException e) {
            throw new DataFetchingException(e);
        }
    }

    private static String resolveLabel(ExtendedPropertyDefinition definition, Locale labelLocale, ExtendedNodeType primaryNodeType) {
        if (labelLocale == null) {
            return definition.getName();
        }

        String label = definition.getLabel(labelLocale, primaryNodeType);
        return StringUtils.isNotBlank(label) ? label : definition.getName();
    }
}
