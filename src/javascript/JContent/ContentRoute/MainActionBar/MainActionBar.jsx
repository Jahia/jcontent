import React from 'react';
import {Separator, ButtonGroup} from '@jahia/moonstone';
import {getButtonRenderer} from '~/utils/getButtonRenderer';
import {DisplayAction} from '@jahia/ui-extender';
import {useSelector} from 'react-redux';
import styles from './MainActionBar.scss';

const ButtonRenderer = getButtonRenderer();
const ButtonRendererShortLabel = getButtonRenderer({labelStyle: 'short'});
const ButtonRendererNoLabel = getButtonRenderer({labelStyle: 'none'});

export const MainActionBar = () => {
    const {path, selection} = useSelector(state => ({path: state.jcontent.path, selection: state.jcontent.selection}));
    let editPath = (selection && selection.length === 0) ? path : selection[0];
    let enabled = selection.length < 2;
    return (
        <div className={styles.root}>
            <Separator variant="vertical"/>
            <DisplayAction actionKey="pageComposer" context={{path: editPath}} render={ButtonRenderer} size="big" variant="ghost" color="accent" className={styles.item}/>
            <DisplayAction actionKey="edit" context={{path: editPath, enabled: enabled}} render={getButtonRenderer({enabled: enabled})} size="big" variant="outlined" className={styles.item}/>
            <ButtonGroup size="big" variant="default" color="accent" className={styles.item}>
                <DisplayAction actionKey="publish" context={{path}} render={ButtonRendererShortLabel}/>
                <DisplayAction actionKey="publishMenu" context={{path, menuFilter: ctx => ctx.key !== 'publish'}} render={ButtonRendererNoLabel}/>
            </ButtonGroup>
        </div>
    );
};

MainActionBar.propTypes = {};
