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

@GraphQLDescription("Variant information for a given channel")
public class GqlVariant {

    private final String name;
    private final String displayName;

    private GqlVariantDimension imageSize;

    public GqlVariant(String name, String displayName) {
        this.name = name;
        this.displayName = displayName;
    }
    @GraphQLField
    @GraphQLName("name")
    @GraphQLDescription("Variant name/identifier")
    public String getName() {
        return name;
    }

    @GraphQLField
    @GraphQLName("displayName")
    @GraphQLDescription("Variant display name/label (not localized)")
    public String getDisplayName() {
        return displayName;
    }

    public void setImageSize(String imageSize) {
        if (imageSize != null) {
            String[] wh = imageSize.split("x");
            this.imageSize = new GqlVariantDimension(wh[0], wh[1]);
        }
    }


    @GraphQLField
    @GraphQLName("imageSize")
    @GraphQLDescription("Variant dimension (width x height) if available")
    public GqlVariantDimension getImageSize() {
        return imageSize;
    }
}
