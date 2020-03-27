import {cmGoto} from '../JContent.redux';
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';

export const RouterActionComponent = ({context, render: Render, loading: Loading}) => {
    const dispatch = useDispatch();
    const {language, site} = useSelector(state => ({language: state.language, site: state.site}));

    const res = useNodeChecks(
        {path: context.path},
        context
    );

    if (res.loading) {
        return (Loading && <Loading context={context}/>) || false;
    }

    return (
        <Render context={{
            ...context,
            isVisible: res.checksResult,
            enabled: res.checksResult,
            onClick: () => {
                const {mode, path} = context;
                dispatch(cmGoto({site, language, mode, path, params: context.urlParams ? context.urlParams : {}}));
                return null;
            }
        }}/>
    );
};

RouterActionComponent.propTypes = {
    context: PropTypes.object.isRequired,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
