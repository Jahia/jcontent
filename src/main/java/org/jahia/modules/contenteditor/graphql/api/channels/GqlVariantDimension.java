/*
 * ==========================================================================================
 * =                            JAHIA'S ENTERPRISE DISTRIBUTION                             =
 * ==========================================================================================
 *
 *                                  http://www.jahia.com
 *
 * JAHIA'S ENTERPRISE DISTRIBUTIONS LICENSING - IMPORTANT INFORMATION
 * ==========================================================================================
 *
 *     Copyright (C) 2002-2024 Jahia Solutions Group. All rights reserved.
 *
 *     This file is part of a Jahia's Enterprise Distribution.
 *
 *     Jahia's Enterprise Distributions must be used in accordance with the terms
 *     contained in the Jahia Solutions Group Terms &amp; Conditions as well as
 *     the Jahia Sustainable Enterprise License (JSEL).
 *
 *     For questions regarding licensing, support, production usage...
 *     please contact our team at sales@jahia.com or go to http://www.jahia.com/license.
 *
 * ==========================================================================================
 */
package org.jahia.modules.contenteditor.graphql.api.channels;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;

@GraphQLDescription("Represents dimensions (width, height) of a variant")
public class GqlVariantDimension {

    private final String width;

    private final String height;

    public GqlVariantDimension(String width, String height) {
        this.width = width;
        this.height = height;
    }

    @GraphQLField
    @GraphQLName("height")
    @GraphQLDescription("Variant height")
    public String getHeight() {
        return height;
    }

    @GraphQLField
    @GraphQLName("width")
    @GraphQLDescription("Variant width")
    public String getWidth() {
        return width;
    }
}
