import React from 'react';
import PropTypes from 'prop-types';
import {ButtonRendererShortLabel} from '~/utils/getButtonRenderer';
import {DisplayAction} from '@jahia/ui-extender';
import {Selection} from '~/JContent/ContentRoute/ToolBar/SelectionActionsBar/Selection';

export const NarrowHeaderActions = ({previewSelection, selection, path, clear}) => {
    if (!previewSelection && selection.length > 0) {
        return <NarrowHeaderSelectionActions selection={selection} clear={clear}/>;
    }

    const context = {path: path};

    return selection.length === 0 && (
        <DisplayAction hidePasteOnPage menuUseElementAnchor actionKey="narrowHeaderMenu" render={ButtonRendererShortLabel} buttonProps={{variant: 'ghost'}} {...context}/>
    );
};

NarrowHeaderActions.propTypes = {
    previewSelection: PropTypes.number,
    selection: PropTypes.array.isRequired,
    path: PropTypes.string,
    clear: PropTypes.func.isRequired
};

export const NarrowHeaderSelectionActions = ({selection, clear}) => {
    const context = selection.length === 1 ? {path: selection[0]} : {paths: selection};

    return (
        <>
            <Selection paths={selection} clear={clear}/>
            <DisplayAction menuUseElementAnchor actionKey="narrowHeaderSelectionMenu" render={ButtonRendererShortLabel} buttonProps={{variant: 'ghost'}} {...context}/>
        </>
    );
};

NarrowHeaderSelectionActions.propTypes = {
    selection: PropTypes.array.isRequired,
    clear: PropTypes.func.isRequired
};
