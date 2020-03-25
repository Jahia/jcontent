import React from 'react';
import {Separator, ButtonGroup} from '@jahia/moonstone';
import {getButtonRenderer} from '~/utils/getButtonRenderer';
import {DisplayAction} from '@jahia/ui-extender';
import {useNodeInfo} from '@jahia/data-helper';
import {useSelector} from 'react-redux';
import styles from './MainActionBar.scss';

const ButtonRenderer = getButtonRenderer();
const ButtonRendererShortLabel = getButtonRenderer({labelStyle: 'short'});
const ButtonRendererNoLabel = getButtonRenderer({labelStyle: 'none'});

export const MainActionBar = () => {
    const {path, language, selection} = useSelector(state => ({path: state.jcontent.path, language: state.language, selection: state.jcontent.selection}));

    const {node, loading} = useNodeInfo({path, language}, {getIsNodeTypes: ['jnt:page', 'jnt:contentFolder', 'jnt:folder']});

    if (loading || !node) {
        return false;
    }

    const publishAction = node['jnt:folder'] || node['jnt:contentFolder'] ? 'publishAll' : 'publish';
    const disabled = selection && selection.length > 0;

    return (
        <div className={styles.root}>
            <DisplayAction actionKey="search" context={{path, disabled}} render={ButtonRenderer} size="big" variant="ghost" data-sel-role="open-search-dialog"/>
            <Separator variant="vertical" invisible="firstOrLastChild" className={styles.showSeparator}/>
            <DisplayAction actionKey="pageComposer" context={{path, disabled}} render={ButtonRenderer} size="big" variant="ghost" color="accent" className={styles.item}/>
            <DisplayAction actionKey="edit" context={{path, disabled}} render={ButtonRenderer} size="big" variant="outlined" className={styles.item}/>

            <ButtonGroup size="big" variant="default" color="accent" className={styles.item}>
                <DisplayAction actionKey={publishAction} context={{path, disabled}} render={ButtonRendererShortLabel}/>
                <DisplayAction actionKey="publishMenu" context={{path, disabled, menuUseElementAnchor: true}} render={ButtonRendererNoLabel}/>
            </ButtonGroup>
            <DisplayAction actionKey="publishDeletion" context={{path, disabled}} render={ButtonRendererShortLabel}/>
            <DisplayAction actionKey="deletePermanently" context={{path, disabled}} render={ButtonRendererShortLabel}/>
        </div>
    );
};

MainActionBar.propTypes = {};
