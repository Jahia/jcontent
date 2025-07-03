import React, {useState} from 'react';
import {DisplayAction, registry} from '@jahia/ui-extender';
import {Button, Menu, MoreVert} from '@jahia/moonstone';
import {MenuItemRenderer} from '~/JContent/MenuItemRenderer';
import PropTypes from 'prop-types';
import {Constants} from '~/ContentEditor/ContentEditor.constants';

const HeaderThreeDotsActions = ({limit, offset}) => {
    const menuContainerRef = React.useRef(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const actionsToDisplay = registry
        .find({type: 'action', target: 'content-editor/header/3dots'})
        .filter((action, index) =>
            index >= offset && index < (offset + limit))
        .map(action => action.key);

    if (actionsToDisplay.length === 0) {
        return null;
    }

    return (
        <div ref={menuContainerRef}>
            <Button
                variant="ghost"
                icon={<MoreVert/>}
                onClick={() => setAnchorEl(menuContainerRef)}
            />
            <Menu
                isDisplayed={Boolean(anchorEl)}
                anchorEl={anchorEl}
                transformElOrigin={{vertical: 'top', horizontal: 'right'}}
                onClose={() => setAnchorEl(null)}
            >
                {actionsToDisplay.map(actionKey => (
                    <DisplayAction
                        key={actionKey}
                        actionKey={actionKey}
                        render={MenuItemRenderer}
                        data-sel-role={`headerAction-${actionKey}`}
                    />
                ))}
            </Menu>
        </div>
    );
};

HeaderThreeDotsActions.propTypes = {
    // How many actions to skip
    offset: PropTypes.number,
    // How many actions to display in total
    limit: PropTypes.number
};

HeaderThreeDotsActions.defaultProps = {
    limit: Constants.editPanel.defaultHeaderButtonCount,
    offset: Constants.editPanel.defaultHeaderButtonCount
};

export default HeaderThreeDotsActions;
