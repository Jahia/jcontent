import React from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import * as PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {useContentEditorApiContext} from '~/ContentEditor/contexts';

export const EditContentSource = ({
    path,
    usagesForPath,
    isFullscreen,
    editCallback,
    render: Render,
    loading: Loading,
    ...otherProps
}) => {
    useTranslation('jcontent');
    const api = useContentEditorApiContext();
    const language = useSelector(state => state.language);
    const res = useNodeChecks(
        {path: path, language: language},
        {getProperties: ['j:node'], ...otherProps, showOnNodeTypes: ['jmix:nodeReference'], hideOnNodeTypes: []}
    );

    const refUuid = res.node && res.node.properties.find(p => p.name === 'j:node')?.value;

    const res2 = useNodeChecks(
        {uuid: refUuid, language: language},
        {...otherProps},
        {skip: !refUuid}
    );

    if (Loading && (res.loading || res2.loading)) {
        return <Loading {...otherProps}/>;
    }

    // Offered from a list of what uses `usagesForPath`, the source is that node itself, so the
    // action would reopen the editor on what the reader is already looking at. Compared rather
    // than suppressed wholesale, because the same menu is shown elsewhere, where a reference's
    // source is somewhere the reader has not been.
    const leadsBackToTheNodeBeingViewed = Boolean(usagesForPath) && res2.node?.path === usagesForPath;

    return (
        <Render {...otherProps}
                isVisible={res.checksResult && res2.checksResult && refUuid && !leadsBackToTheNodeBeingViewed}
                onClick={() => api.edit({
                    uuid: refUuid,
                    lang: language,
                    isFullscreen,
                    editCallback,
                    ...otherProps.editConfig
                })}
        />
    );
};

EditContentSource.defaultProps = {
    loading: undefined,
    isFullscreen: false,
    editCallback: undefined
};

EditContentSource.propTypes = {
    path: PropTypes.string.isRequired,
    /** Set when the action is offered from the usages of a node, and holds that node's path. */
    usagesForPath: PropTypes.string,
    isFullscreen: PropTypes.bool,
    editCallback: PropTypes.func,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};

export const editContentSourceAction = {
    component: EditContentSource
};
