import React from 'react';
import {DisplayAction} from '@jahia/ui-extender';
import {getButtonRenderer} from '~/utils/getButtonRenderer';
import styles from './HeaderButtonActions.scss';
import {getButtonLimitValue, getMenuActions} from './utils.headerActions';
import PropTypes from 'prop-types';

const ButtonRenderer = getButtonRenderer({
    defaultButtonProps: {
        variant: 'ghost',
        className: styles.button
    }
});

const HeaderButtonActions = ({targetActionKey}) => {
    const limit = getButtonLimitValue();
    const actionsToDisplay = getMenuActions(0, limit, targetActionKey);

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

HeaderButtonActions.propTypes = {
    targetActionKey: PropTypes.string.isRequired
};

export default HeaderButtonActions;
