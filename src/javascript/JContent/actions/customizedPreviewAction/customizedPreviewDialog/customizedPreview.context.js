import React, {useContext, useState} from 'react';
import dayjs from 'dayjs';
import {useSelector} from 'react-redux';
import PropTypes from 'prop-types';

const CustomizedPreviewContext = React.createContext({});
export const useCustomizedPreviewContext = () => useContext(CustomizedPreviewContext);

export const CustomizedPreviewContextProvider = ({children}) => {
    const [lang] = useSelector(state => [
        state.language
    ]);

    const [user, setUser] = useState('root');
    const [date, setDate] = useState();
    const [channel, setChannel] = useState('apple_iphone_ver1');
    const [variant, setVariant] = useState('landscape');

    const setDayJs = (val) => {
        val && setDate(dayjs(val));
    }

    const context = {lang, user, setUser, date, setDate: setDayJs, channel, setChannel, variant, setVariant};
    return (
        <CustomizedPreviewContext.Provider value={context}>
            {children}
        </CustomizedPreviewContext.Provider>
    );
};

CustomizedPreviewContextProvider.propTypes = {
    children: PropTypes.node.isRequired
};
