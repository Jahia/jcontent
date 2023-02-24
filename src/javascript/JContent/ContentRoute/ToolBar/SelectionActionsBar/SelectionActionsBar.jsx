import React from 'react';
import {useNodeInfo} from '@jahia/data-helper';
import {ButtonGroup, Separator} from '@jahia/moonstone';
import {DisplayAction, DisplayActions} from '@jahia/ui-extender';
import PropTypes from 'prop-types';
import {ButtonRenderer, ButtonRendererNoLabel, ButtonRendererShortLabel} from '~/utils/getButtonRenderer';
import {Selection} from './Selection';

export const SelectionActionsBar = ({paths, clear}) => {
    const {nodes} = useNodeInfo({paths}, {getIsNodeTypes: ['jnt:page', 'jnt:contentFolder', 'jnt:folder']});

    let publishAction;
    if (nodes) {
        const canPublish = nodes && nodes.map(n => n['jnt:page'] || !(n['jnt:contentFolder'] || n['jnt:folder'])).reduce((v, a) => v && a, true);
        publishAction = canPublish ? 'publish' : 'publishAll';
    }

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
            <Separator variant="vertical" invisible="onlyChild"/>
            <ButtonGroup size="default" variant="outlined" color="accent">
                {publishAction &&
                    <DisplayAction actionKey={publishAction}
                                   {...context}
                                   isMediumLabel
                                   render={ButtonRendererShortLabel}/>}
                <DisplayAction menuUseElementAnchor
                               actionKey="publishMenu"
                               {...context}
                               render={ButtonRendererNoLabel}/>
            </ButtonGroup>
            <DisplayAction actionKey="publishDeletion" {...context} render={ButtonRendererShortLabel}/>
            <DisplayAction actionKey="deletePermanently" {...context} render={ButtonRendererShortLabel}/>
        </>
    );
};

SelectionActionsBar.propTypes = {
    paths: PropTypes.arrayOf(PropTypes.string),
    clear: PropTypes.func
};
