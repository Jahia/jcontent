import React from 'react';
import {getButtonRenderer} from '~/utils/getButtonRenderer';
import {DisplayAction} from '@jahia/ui-extender';
import {shallowEqual, useSelector} from 'react-redux';
import styles from '~/JContent/ContentRoute/MainActionBar/MainActionBar.scss';

const ButtonRenderer = getButtonRenderer({defaultButtonProps: {size: 'big'}});

export const MainActionBar = () => {
    const {path, selection} = useSelector(state => ({path: state.jcontent.catManPath, selection: state.jcontent.selection}), shallowEqual);

    const isDisabled = selection && selection.length > 0;

    return (
        <div className={styles.root}>
            <DisplayAction actionKey="searchCatMan" path={path} isDisabled={isDisabled} render={ButtonRenderer} buttonProps={{variant: 'ghost', size: 'big', 'data-sel-role': 'open-search-dialog'}}/>
        </div>
    );
};

MainActionBar.propTypes = {};
