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
    const {path} = useSelector(state => ({path: state.jcontent.path}));

    return (
        <div className={styles.root}>
            <Separator variant="vertical"/>
            <DisplayAction actionKey="pageComposer" context={{path}} render={ButtonRenderer} size="big" variant="ghost" color="accent" className={styles.item}/>
            <DisplayAction actionKey="edit" context={{path}} render={ButtonRenderer} size="big" variant="outlined" className={styles.item}/>
            <ButtonGroup size="big" variant="default" color="accent" className={styles.item}>
                <DisplayAction actionKey="publish" context={{path}} render={ButtonRendererShortLabel}/>
                <DisplayAction actionKey="publishMenu" context={{path, menuFilter: ctx => ctx.key !== 'publish'}} render={ButtonRendererNoLabel}/>
            </ButtonGroup>
        </div>
    );
};

MainActionBar.propTypes = {};
