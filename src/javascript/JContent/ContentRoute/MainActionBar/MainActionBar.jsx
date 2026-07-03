import React from 'react';
import {ButtonGroup, ChevronDown, Separator} from '@jahia/moonstone';
import {getButtonRenderer} from '~/utils/getButtonRenderer';
import {DisplayAction} from '@jahia/ui-extender';
import {useNodeInfo} from '@jahia/data-helper';
import {shallowEqual, useSelector} from 'react-redux';
import styles from './MainActionBar.scss';

const ButtonRenderer = getButtonRenderer({defaultButtonProps: {size: 'big'}});
const ButtonRendererNoLabel = getButtonRenderer({labelStyle: 'none', defaultButtonProps: {size: 'big'}});
const ButtonRendererShortLabel = getButtonRenderer({labelStyle: 'short', defaultButtonProps: {size: 'big'}});

export const MainActionBar = () => {
    const {path, language, selection} = useSelector(state => ({
        path: state.jcontent.path,
        language: state.language,
        selection: state.jcontent.selection
    }), shallowEqual);
    const {node, loading} = useNodeInfo(
        {path, language},
        {getIsNodeTypes: ['jnt:page', 'jnt:contentFolder', 'jnt:folder']}
    );

    if (loading || !node) {
        return null;
    }

    const isFolder = node['jnt:folder'] || node['jnt:contentFolder'];
    const publishAction = isFolder ? 'publishAll' : 'publish';
    const isDisabled = selection?.length > 0;

    return (
        <div className={styles.root}>
            <DisplayAction actionKey="search" path={path} isDisabled={isDisabled} render={ButtonRenderer} buttonProps={{variant: 'ghost', size: 'big', 'data-sel-role': 'open-search-dialog'}}/>
            <Separator variant="vertical" invisible="firstOrLastChild"/>

            { !isFolder && (
                <ButtonGroup size="big" variant="outlined" color="default" className={styles.item}>
                    <DisplayAction isMediumLabel actionKey="openInPreview" path={path} isDisabled={isDisabled} render={ButtonRendererShortLabel} buttonProps={{className: styles.item}}/>
                    <DisplayAction menuUseElementAnchor actionKey="openInPreviewMenu" path={path} isDisabled={isDisabled} render={ButtonRendererNoLabel} buttonProps={{icon: <ChevronDown/>}}/>
                </ButtonGroup>)}

            <DisplayAction actionKey="openInLive" path={path} isDisabled={isDisabled} render={ButtonRenderer} buttonProps={{variant: 'outlined', size: 'big', color: 'accent', className: styles.item}}/>
            <ButtonGroup size="big" variant="default" color="accent" className={styles.item}>
                <DisplayAction isMediumLabel actionKey={publishAction} path={path} isDisabled={isDisabled} render={ButtonRendererShortLabel} buttonProps={{variant: 'default', size: 'big', color: 'accent'}}/>
                <DisplayAction menuUseElementAnchor actionKey="publishMenu" path={path} isDisabled={isDisabled} render={ButtonRendererNoLabel} buttonProps={{variant: 'default', size: 'big', color: 'accent', icon: <ChevronDown/>}}/>
            </ButtonGroup>
            <DisplayAction actionKey="publishDeletion" path={path} isDisabled={isDisabled} render={ButtonRendererShortLabel}/>
            <DisplayAction actionKey="deletePermanently" path={path} isDisabled={isDisabled} render={ButtonRendererShortLabel}/>
        </div>
    );
};

MainActionBar.propTypes = {};
