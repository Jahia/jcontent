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

    if (loading) {
        return false;
    }

    let action = 'publish';

    if (node.jnt_folder || node.jnt_contentFolder) {
        action = 'publishAll';
    }

    let disabled = selection && selection.length > 0;

    return (
        <div className={styles.root}>
            <Separator variant="vertical"/>
            <DisplayAction actionKey="pageComposer" context={{path, disabled}} render={ButtonRenderer} size="big" variant="ghost" color="accent" className={styles.item}/>
            <DisplayAction actionKey="edit" context={{path, disabled}} render={ButtonRenderer} size="big" variant="outlined" className={styles.item}/>
            <ButtonGroup size="big" variant="default" color="accent" className={styles.item}>
                <DisplayAction actionKey={action} context={{path, disabled}} render={ButtonRendererShortLabel}/>
                <DisplayAction actionKey="publishDeletion" context={{path, disabled}} render={ButtonRendererShortLabel}/>
                <DisplayAction actionKey="deletePermanently" context={{path, disabled}} render={ButtonRendererShortLabel}/>
                <DisplayAction actionKey="publishMenu" context={{path, disabled, menuUseElementAnchor: true}} render={ButtonRendererNoLabel}/>
            </ButtonGroup>
        </div>
    );
};

MainActionBar.propTypes = {};
