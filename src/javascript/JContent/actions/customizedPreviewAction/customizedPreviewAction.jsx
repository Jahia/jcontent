import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import {useQuery} from '@apollo/client';
import {OpenInActionQuery} from '~/JContent/actions/openInAction/openInAction.gql-queries';
import {ComponentRendererContext} from '@jahia/ui-extender';
import {CustomizedPreviewDialog} from './customizedPreviewDialog';

export const CustomizedPreviewActionComponent = ({path, render: Render, loading: Loading, ...others}) => {
    const componentRenderer = useContext(ComponentRendererContext);
    const language = useSelector(state => state.language);
    const res = useQuery(OpenInActionQuery, {
        variables: {path, language, workspace: 'EDIT'},
        skip: !path
    });

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    const node = res?.data?.jcr.result;
    const enabled = !res.error && (node?.previewAvailable || node?.displayableNode !== null);

    return (
        <Render
            {...others}
            enabled={enabled}
            onClick={() => {
                componentRenderer.render('customizedPreview', CustomizedPreviewDialog, {
                        isOpen: true,
                        path: node.path,
                        onClose: () => {
                            componentRenderer.setProperties('customizedPreview', {isOpen: false});
                        },
                        onExited: () => {
                            componentRenderer.destroy('customizedPreview');
                        }
                    }
                );
            }}
        />
    );
};

CustomizedPreviewActionComponent.propTypes = {
    path: PropTypes.string.isRequired,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};
