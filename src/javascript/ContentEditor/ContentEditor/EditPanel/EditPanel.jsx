import React from 'react';
import PropTypes from 'prop-types';
import {EditPanelFullscreen} from './EditPanelFullscreen';
import {useContentEditorConfigContext} from '~/ContentEditor/contexts';
import {WindowListeners} from '~/ContentEditor/ContentEditor/EditPanel/WindowListeners';

export const EditPanel = React.memo(props => {
    const {layout, confirmationDialog} = useContentEditorConfigContext();
    const Layout = layout || EditPanelFullscreen;
    return (
        <>
            <Layout {...props}/>
            <WindowListeners/>
            {confirmationDialog}
        </>
    );
});

EditPanel.propTypes = {
    title: PropTypes.string.isRequired
};
