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
import org.jahia.services.channels.ChannelService;
import org.jahia.services.channels.Channel;

import java.util.LinkedList;
import java.util.List;
import java.util.Map;

/**
 * GqlChannel class to access channel information as taken from
 * ChannelHelper and CustomizedPreviewActionItem to build customized preview dialog
 */
@GraphQLDescription("Channel information")
public class GqlChannel {

    private final Channel channel;

    public GqlChannel(String channelName) {
        channel = ChannelService.getInstance().getChannel(channelName);
    }

    @GraphQLField
    @GraphQLName("name")
    @GraphQLDescription("Channel name/identifier")
    public String getName() {
        return channel.getIdentifier();
    }

    @GraphQLField
    @GraphQLName("displayName")
    @GraphQLDescription("Channel label (not localized)")
    public String getDisplayName() {
        return channel.getCapability("display-name");
    }

    @GraphQLField
    @GraphQLName("isVisible")
    @GraphQLDescription("Return true if channel is visible, otherwise false")
    public Boolean isVisible() {
        return channel.isVisible();
    }

    public Map<String, String> getCapabilities() {
        return channel.getCapabilities();
    }

    @GraphQLField
    @GraphQLName("variants")
    @GraphQLDescription("Return variants for this channel, if available")
    public List<GqlVariant> getVariants() {
        List<GqlVariant> variants = new LinkedList<>();

        String variantNames = channel.getCapability("variants");
        String variantDisplayNames = channel.getCapability("variants-displayNames");
        String imageSizes = channel.getCapability("decorator-image-sizes");

        if (variantNames != null) {
            String[] variantNameArray = variantNames.split(",");
            String[] variantDisplayNameArray = (variantDisplayNames != null) ?
                variantDisplayNames.split(",") : variantNameArray;
            String[] imageSizeArray = (imageSizes != null) ? imageSizes.split(",") : null;

            for (int i = 0; i < variantNameArray.length; i++) {
                GqlVariant gqlVariant = new GqlVariant(variantNameArray[i], variantDisplayNameArray[i]);
                if (imageSizeArray != null) {
                    gqlVariant.setImageSize(imageSizeArray[i]);
                }
                variants.add(gqlVariant);
            }
        }

        return variants;
    }

}
