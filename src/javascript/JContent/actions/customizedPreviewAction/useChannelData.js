import React from 'react';
import {useQuery} from '@apollo/client';
import {GET_CHANNEL_DATA} from './channels.gql-queries';

export const useChannelData = () => {
    const {data, loading, error} = useQuery(GET_CHANNEL_DATA, {fetchPolicy: 'cache-and-network'});

    const channelData = data?.jcontent.channels.filter(c => c.isVisible) || [];
    const getChannel = channel => {
        return channelData.find(item => item.value === channel) || {};
    };

    const getVariant = (channel, variant) => {
        return getChannel(channel).variants?.find(v => v.value === variant);
    };

    return {
        channelData,
        loading,
        error,
        getChannel,
        getVariant,
    }

};
