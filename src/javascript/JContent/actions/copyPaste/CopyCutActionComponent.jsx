import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useApolloClient} from '@apollo/react-hooks';
import {useNodeChecks} from '@jahia/data-helper';
import copyPasteConstants from './copyPaste.constants';
import {getName, hasMixin} from '~/JContent/JContent.utils';
import {setLocalStorage} from './localStorageHandler';
import {copypasteCopy, copypasteCut} from './copyPaste.redux';
import PropTypes from 'prop-types';
import React from 'react';
import {ACTION_PERMISSIONS, PATH_CONTENTS_ITSELF, PATH_FILES_ITSELF} from '../actions.constants';
import {withNotifications} from '@jahia/react-material';
import {useTranslation} from 'react-i18next';

export const CopyCutActionComponent = withNotifications()(({
    path,
    paths,
    copyCutType,
    render: Render,
    loading: Loading,
    notificationContext,
    ...others
}) => {
    const {language, displayLanguage} = useSelector(state => ({
        language: state.language,
        displayLanguage: state.uilang
    }), shallowEqual);
    const client = useApolloClient();
    const dispatch = useDispatch();
    const {t} = useTranslation('jcontent');

    const type = copyCutType || copyPasteConstants.COPY;

    const res = useNodeChecks(
        {path, paths, language, displayLanguage},
        {
            getPrimaryNodeType: true,
            getDisplayName: true,
            requiredPermission: type === copyPasteConstants.COPY ? ['jcr:read'] : ['jcr:removeNode'],
            requiredSitePermission: type === copyPasteConstants.COPY ? [ACTION_PERMISSIONS.copyAction] : [ACTION_PERMISSIONS.cutAction],
            getProperties: ['jcr:mixinTypes'],
            hideOnNodeTypes: ['jnt:virtualsite'],
            hideForPaths: [PATH_FILES_ITSELF, PATH_CONTENTS_ITSELF]
        }
    );

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    let isVisible = res.checksResult && (res.node ? !hasMixin(res.node, 'jmix:markedForDeletionRoot') : res.nodes.reduce((acc, node) => acc && !hasMixin(node, 'jmix:markedForDeletionRoot'), true));

    return (
        <Render
            {...others}
            isVisible={isVisible}
            enabled={isVisible}
            onClick={() => {
                let nodes = res.node ? [res.node] : res.nodes;
                setLocalStorage(type, nodes, client);
                notificationContext.notify(nodes.length === 1 ? t('jcontent:label.contentManager.copyPaste.stored.one', {name: getName(nodes[0])}) : t('jcontent:label.contentManager.copyPaste.stored.many', {size: nodes.length}), ['closeButton']);
                dispatch(type === 'copy' ? copypasteCopy(nodes) : copypasteCut(nodes));
            }}
        />
    );
});

CopyCutActionComponent.propTypes = {
    path: PropTypes.string,

    paths: PropTypes.arrayOf(PropTypes.string),

    copyCutType: PropTypes.oneOf([copyPasteConstants.COPY, copyPasteConstants.CUT]),

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
