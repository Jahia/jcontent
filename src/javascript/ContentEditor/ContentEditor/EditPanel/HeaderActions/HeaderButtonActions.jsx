import React from 'react';
import {DisplayAction} from '@jahia/ui-extender';
import {getButtonRenderer} from '~/utils/getButtonRenderer';
import styles from './HeaderButtonActions.scss';
import {getButtonLimitValue, getMenuActions} from './utils.headerActions';

const ButtonRenderer = getButtonRenderer({
    defaultButtonProps: {
        variant: 'ghost',
        className: styles.button
    }
});

const HeaderButtonActions = () => {
    const limit = getButtonLimitValue();
    const actionsToDisplay = getMenuActions(0, limit);

    if (actionsToDisplay.length === 0) {
        return null;
    }

    const buttons = actionsToDisplay.map(actionKey => (
        <DisplayAction
            key={actionKey}
            actionKey={actionKey}
            render={ButtonRenderer}
            data-sel-role={`headerAction-${actionKey}`}
        />
    ));

    return (
        <div className={styles.container}>
            {buttons}
        </div>
    );
};

export default HeaderButtonActions;
