import React, {useContext, useEffect, useState} from 'react';
import dayjs from 'dayjs';
import {useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/client';
import {GET_CHANNEL_DATA} from '~/JContent/actions/customizedPreviewAction/channels.gql-queries';

const CustomizedPreviewContext = React.createContext({});
export const useCustomizedPreviewContext = () => useContext(CustomizedPreviewContext);

export const CustomizedPreviewContextProvider = ({children}) => {
    const jContentParams = useSelector(state => state.jcontent.params);
    const isOpen = jContentParams?.openDialog?.key === 'customizedPreview';
    const params = isOpen ? jContentParams?.openDialog.params : {};

    const [user, setUser] = useState(params.user);
    const [date, setDate] = useState(params.date && dayjs(params.date));
    const [channel, setChannel] = useState(params.channel);
    const [variant, setVariant] = useState(params.variant);

    const setDayJs = val => {
        if (val) {
            setDate(dayjs(val));
        }
    };

    const clearAll = () => {
        setUser(null);
        setDate(null);
        setChannel(null);
        setVariant(null);
    };

    const context = {isOpen, user, setUser, date, setDate: setDayJs, clearAll, channel, setChannel, variant, setVariant};
    return (
        <CustomizedPreviewContext.Provider value={context}>
            {children}
        </CustomizedPreviewContext.Provider>
    );
};

CustomizedPreviewContextProvider.propTypes = {
    children: PropTypes.node.isRequired
};
