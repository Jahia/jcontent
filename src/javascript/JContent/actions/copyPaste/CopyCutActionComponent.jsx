import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useApolloClient} from '@apollo/client';
import {useNodeChecks} from '@jahia/data-helper';
import copyPasteConstants from './copyPaste.constants';
import {getName, hasMixin} from '~/JContent/JContent.utils';
import {setLocalStorage} from './localStorageHandler';
import {copypaste} from './copyPaste.redux';
import PropTypes from 'prop-types';
import React from 'react';
import {ACTION_PERMISSIONS} from '../actions.constants';
import {withNotifications} from '@jahia/react-material';
import {useTranslation} from 'react-i18next';
import {JahiaAreasUtil} from '../../JContent.utils';

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

    const subPagesCondition = (others.hideIfHasNoSubPages) ? {getSubNodesCount: ['jnt:page', 'jmix:navMenuItem']} : {};

    const res = useNodeChecks(
        {path, paths, language, displayLanguage},
        {
            getPrimaryNodeType: true,
            getDisplayName: true,
            requiredPermission: type === copyPasteConstants.COPY ? ['jcr:read'] : ['jcr:removeNode'],
            requiredSitePermission: type === copyPasteConstants.CUT ? [ACTION_PERMISSIONS.cutAction] : [ACTION_PERMISSIONS.copyAction],
            getProperties: ['jcr:mixinTypes'],
            ...subPagesCondition,
            ...others
        }
    );

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    const isVisible = res.checksResult && !JahiaAreasUtil.isJahiaArea(path || paths) &&
        (res.node ?
            !hasMixin(res.node, 'jmix:markedForDeletionRoot') :
            res.nodes?.reduce((acc, node) => acc && !hasMixin(node, 'jmix:markedForDeletionRoot'), true)
        );
    const isEnabled = !others.hideIfHasNoSubPages || (res.node?.['subNodesCount_jnt:page'] + res.node?.['subNodesCount_jmix:navMenuItem']) !== 0;

    return (
        <Render
            {...others}
            isVisible={isVisible}
            enabled={isVisible && isEnabled}
            onClick={() => {
                const nodes = res.node ? [res.node] : res.nodes;
                setLocalStorage(type, nodes, client);
                const message = nodes.length === 1 ?
                    t('jcontent:label.contentManager.copyPaste.stored.one', {name: getName(nodes[0])}) :
                    t('jcontent:label.contentManager.copyPaste.stored.many', {size: nodes.length});
                notificationContext.notify(message, ['closeButton', 'closeAfter5s']);
                dispatch(copypaste({type, nodes}));
            }}
        />
    );
});

CopyCutActionComponent.propTypes = {
    path: PropTypes.string,

    paths: PropTypes.arrayOf(PropTypes.string),

    copyCutType: PropTypes.oneOf([copyPasteConstants.COPY, copyPasteConstants.COPY_PAGE, copyPasteConstants.CUT]),

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
