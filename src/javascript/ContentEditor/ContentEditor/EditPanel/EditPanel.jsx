import React from 'react';
import PropTypes from 'prop-types';
import {EditPanelFullscreen} from './EditPanelFullscreen';
import {useContentEditorConfigContext} from '~/ContentEditor/contexts';
import {WindowListeners} from '~/ContentEditor/ContentEditor/EditPanel/WindowListeners';
import {I18nContextHandler} from './I18nContextHandler';

export const EditPanel = React.memo(props => {
    const {layout, confirmationDialog} = useContentEditorConfigContext();
    const Layout = layout || EditPanelFullscreen;
    return (
        <>
            <Layout {...props}/>
            <WindowListeners/>
            {confirmationDialog}
            <I18nContextHandler/>
        </>
    );
});

EditPanel.propTypes = {
    title: PropTypes.string.isRequired
};
