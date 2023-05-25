import React from 'react';
import PropTypes from 'prop-types';
import {ButtonRenderer} from '~/utils/getButtonRenderer';
import {Selection} from '~/JContent/ContentRoute/ToolBar/SelectionActionsBar/Selection';
import {Separator} from '@jahia/moonstone';
import {DisplayActions} from '@jahia/ui-extender';

export const SelectionActionsBar = ({paths, clear}) => {
    let context = paths.length === 1 ? {path: paths[0]} : {paths};

    return (
        <>
            <Selection paths={paths} clear={clear}/>
            <div className="flexRow">
                <Separator variant="vertical" invisible="onlyChild"/>
                <DisplayActions
                    target="selectedContentActions"
                    {...context}
                    filter={action => action.key !== 'deletePermanently' && action.key.indexOf('publish') === -1}
                    buttonProps={{size: 'default', variant: 'ghost'}}
                    render={ButtonRenderer}
                />
            </div>
        </>
    );
};

SelectionActionsBar.propTypes = {
    paths: PropTypes.arrayOf(PropTypes.string),
    clear: PropTypes.func
};
