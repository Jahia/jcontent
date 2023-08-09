import React, {useEffect, useState} from 'react';
import {DisplayAction} from '@jahia/ui-extender';

export const JContentApi = () => {
    const [params, setParams] = useState({actionKey: ''});
    const [onClick, setOnClick] = useState();

    useEffect(() => {
        window.CE_API = window.CE_API || {};
        window.CE_API.executeAction = setParams;
    }, [setParams]);

    useEffect(() => {
        if (onClick) {
            setParams({actionKey: ''});
            setOnClick(null);
            onClick();
        }
    }, [onClick]);

    return (
        <DisplayAction
            {...params}
            render={props => {
                // eslint-disable-next-line react/prop-types
                const {onClick, isVisible, enabled, isDisabled} = props;
                if (isVisible !== false && enabled !== false && !isDisabled) {
                    setOnClick(() => onClick);
                }

                return false;
            }}
            loading={() => {
                return false;
            }}
        />
    );
};
