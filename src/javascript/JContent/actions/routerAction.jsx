import {cmGoto} from '../redux/JContent.redux';
import React from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';

export const RouterActionComponent = ({path, mode, urlParams, render: Render, loading: Loading, ...others}) => {
    const dispatch = useDispatch();
    const {language, site} = useSelector(state => ({language: state.language, site: state.site}), shallowEqual);

    const res = useNodeChecks({path}, others);

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    return (
        <Render
            {...others}
            isVisible={res.checksResult}
            enabled={res.checksResult}
            onClick={() => {
                dispatch(cmGoto({site, language, mode, path, params: urlParams ? urlParams : {}}));
                return null;
            }}
        />
    );
};

RouterActionComponent.propTypes = {
    path: PropTypes.string,

    mode: PropTypes.string,

    urlParams: PropTypes.object,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
