import React from 'react';
import {DisplayAction, registry} from '@jahia/ui-extender';
import {getButtonRenderer} from '~/utils/getButtonRenderer';
import styles from './HeaderButtonActions.scss';
import PropTypes from 'prop-types';
import {Constants} from '~/ContentEditor/ContentEditor.constants';

const ButtonRenderer = getButtonRenderer({
    defaultButtonProps: {
        variant: 'ghost',
        className: styles.button
    }
});

const HeaderButtonActions = ({limit, offset}) => {
    const actionsToDisplay = registry
        .find({type: 'action', target: 'content-editor/header/3dots'})
        .filter((action, index) =>
            index >= offset && index < (offset + limit))
        .map(action => action.key);

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
    // How many actions to skip
    offset: PropTypes.number,
    // How many actions to display in total
    limit: PropTypes.number
};

HeaderButtonActions.defaultProps = {
    limit: Constants.editPanel.defaultHeaderButtonCount,
    offset: 0
};

export default HeaderButtonActions;
