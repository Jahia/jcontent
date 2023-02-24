import React from 'react';
import PropTypes from 'prop-types';
import {ButtonRendererNoLabel, ButtonRendererShortLabel} from '~/utils/getButtonRenderer';
import {ButtonGroup} from '@jahia/moonstone';
import {DisplayAction} from '@jahia/ui-extender';
import {Selection} from '../../ContentRoute/ToolBar/SelectionActionsBar/Selection';

export const NarrowHeaderActions = ({previewSelection, selection, path, clear}) => {
    if (!previewSelection && selection.length > 0) {
        return <NarrowHeaderSelectionActions selection={selection} clear={clear}/>;
    }

    const context = {path: path};

    return selection.length === 0 && (
        <ButtonGroup size="default" variant="ghost">
            <DisplayAction menuUseElementAnchor actionKey="narrowHeaderMenu" render={ButtonRendererShortLabel} buttonProps={{variant: 'ghost', icon: null}} {...context}/>;
            <DisplayAction menuUseElementAnchor actionKey="narrowHeaderMenu" render={ButtonRendererNoLabel} buttonProps={{variant: 'ghost'}} {...context}/>;
        </ButtonGroup>
    );
};

NarrowHeaderActions.propTypes = {
    previewSelection: PropTypes.number,
    selection: PropTypes.array.isRequired,
    path: PropTypes.string.isRequired,
    clear: PropTypes.func.isRequired
};

export const NarrowHeaderSelectionActions = ({selection, clear}) => {
    const context = selection.length === 1 ? {path: selection[0]} : {paths: selection};

    return (
        <>
            <Selection paths={selection} clear={clear}/>
            <ButtonGroup size="default" variant="ghost">
                <DisplayAction menuUseElementAnchor actionKey="narrowHeaderSelectionMenu" render={ButtonRendererShortLabel} buttonProps={{variant: 'ghost', icon: null}} {...context}/>
                <DisplayAction menuUseElementAnchor actionKey="narrowHeaderSelectionMenu" render={ButtonRendererNoLabel} buttonProps={{variant: 'ghost'}} {...context}/>
            </ButtonGroup>
        </>
    );
};

NarrowHeaderSelectionActions.propTypes = {
    selection: PropTypes.array.isRequired,
    clear: PropTypes.func.isRequired
};
