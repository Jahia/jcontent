import React, {useContext, useState} from 'react';
import dayjs from 'dayjs';
import {useSelector} from 'react-redux';
import PropTypes from 'prop-types';

const CustomizedPreviewContext = React.createContext({});
export const useCustomizedPreviewContext = () => useContext(CustomizedPreviewContext);

export const channelData = [
    {
        label: 'Generic',
        value: 'generic'
    },
    {
        label: 'Phone: android',
        value: 'generic_android',
        variant: [
            {label: 'Portrait', value: 'portrait'},
            {label: 'Landscape', value: 'landscape'}
        ]
    },
    {
        label: 'Phone: iPhone',
        value: 'apple_iphone_ver1',
        variant: [
            {label: 'Portrait', value: 'portrait'},
            {label: 'Landscape', value: 'landscape'}
        ]
    },
    {
        label: 'Tablet: iPad',
        value: 'apple_ipad_ver1',
        variant: [
            {label: 'Portrait', value: 'portrait'},
            {label: 'Landscape', value: 'landscape'}
        ]
    },
    {
        label: 'Tablet: android',
        value: 'android_tablet',
        variant: [
            {label: 'Portrait', value: 'portrait'},
            {label: 'Landscape', value: 'landscape'}
        ]
    },
];

export const CustomizedPreviewContextProvider = ({children}) => {
    const [lang] = useSelector(state => [
        state.language
    ]);
    const jcontentParams = useSelector(state => state.jcontent.params) || {};
    const params = (jcontentParams.openDialog?.key === 'customizedPreview') ? jcontentParams.openDialog.params : {};

    const [user, setUser] = useState(params.user || 'root'); // TODO remove default value
    const [date, setDate] = useState(params.date && dayjs(params.date));
    const [channel, setChannel] = useState(params.channel);
    const [variant, setVariant] = useState(params.variant);

    const setDayJs = (val) => {
        val && setDate(dayjs(val));
    }

    const channelContext = {
        channelData,
        channel,
        setChannel,
        variant,
        setVariant,
        getChannel(channel) {
            return channelData.find(item => item.value === channel) || {};
        }
    }

    const clearAll = () => {
        setUser(null);
        setDate(null);
        setChannel(null);
        setVariant(null);
    };

    const context = {lang, user, setUser, date, setDate: setDayJs, clearAll, channelContext};
    return (
        <CustomizedPreviewContext.Provider value={context}>
            {children}
        </CustomizedPreviewContext.Provider>
    );
};

CustomizedPreviewContextProvider.propTypes = {
    children: PropTypes.node.isRequired
};
