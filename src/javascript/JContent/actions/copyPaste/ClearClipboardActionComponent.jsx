import {useDispatch, useSelector} from 'react-redux';
import {useApolloClient} from '@apollo/client';
import copyPasteConstants from './copyPaste.constants';
import {setLocalStorage} from './localStorageHandler';
import {copypasteClear} from './copyPaste.redux';
import PropTypes from 'prop-types';
import React from 'react';
import {withNotifications} from '@jahia/react-material';
import {useTranslation} from 'react-i18next';

export const ClearClipboardActionComponent = withNotifications()(({render: Render, notificationContext, ...others}) => {
    const client = useApolloClient();
    const dispatch = useDispatch();
    const {t} = useTranslation('jcontent');
    const copyPaste = useSelector(state => state.jcontent.copyPaste);
    const {nodes} = copyPaste;

    let isVisible = nodes.length > 0;

    return (
        <Render
            {...others}
            isVisible={isVisible}
            enabled={isVisible}
            onClick={() => {
                dispatch(copypasteClear());
                setLocalStorage(copyPasteConstants.COPY, [], client);
                notificationContext.notify(t('jcontent:label.contentManager.copyPaste.clear'), ['closeButton', 'closeAfter5s']);
            }}
        />
    );
});

ClearClipboardActionComponent.propTypes = {
    render: PropTypes.func.isRequired
};
