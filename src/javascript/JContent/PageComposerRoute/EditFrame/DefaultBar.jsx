import {NodeIcon} from '~/utils';
import styles from '~/JContent/PageComposerRoute/EditFrame/Box.scss';
import {Typography} from '@jahia/moonstone';
import {DisplayAction} from '@jahia/ui-extender';
import {ButtonRenderer, ButtonRendererNoLabel} from '~/utils/getButtonRenderer';
import {includes} from 'lodash';
import React from 'react';
import ContentStatuses from '~/JContent/ContentRoute/ContentStatuses/ContentStatuses';
import PropTypes from 'prop-types';

export const DefaultBar = ({node, language, displayLanguage, width, currentFrameRef, isActionsHidden}) => {
    // eslint-disable-next-line react/prop-types
    const wrap = Renderer => ({onClick, ...props}) => (
        <Renderer
            onClick={(item, event) => onClick(item, {
                ...event,
                currentTarget: {
                    ...event.currentTarget,
                    getBoundingClientRect: () => {
                        const boundingClientRect = event.currentTarget.getBoundingClientRect();
                        const frameRect = currentFrameRef.current.getBoundingClientRect();
                        return new DOMRect(boundingClientRect.x + frameRect.x, boundingClientRect.y + frameRect.y, boundingClientRect.width, boundingClientRect.height);
                    }
                }}
            )}
            {...props}
        />
    );
    const WrappedButtonRendererNoLabel = wrap(ButtonRendererNoLabel);
    const WrappedButtonRenderer = wrap(ButtonRenderer);

    const displayLabels = width > 400;
    return (
        <>
            <NodeIcon node={node} className={styles.icon}/>
            <Typography isNowrap className="flexFluid" variant="caption">{node.displayName}</Typography>

            <ContentStatuses node={node}
                             hasLabel={displayLabels}
                             uilang={displayLanguage}
                             language={language}
                             renderedStatuses={['locked', 'warning', 'workInProgress', 'published', 'modified', 'markedForDeletion']}/>

            {!isActionsHidden && (
                <>
                    <DisplayAction
                        actionKey="edit"
                        path={node.path}
                        render={displayLabels ? WrappedButtonRenderer : WrappedButtonRendererNoLabel}
                        buttonProps={{variant: 'ghost', size: 'small'}}
                    />

                    <DisplayAction
                        actionKey="contentMenu"
                        path={node.path}
                        menuFilter={value => !includes(['edit'], value.key)}
                        render={WrappedButtonRendererNoLabel}
                        buttonProps={{variant: 'ghost', size: 'small'}}
                    />
                </>
            )}
        </>
    );
};

DefaultBar.propTypes = {
    node: PropTypes.object,

    language: PropTypes.string,

    displayLanguage: PropTypes.string,

    width: PropTypes.number,

    currentFrameRef: PropTypes.any,

    isActionsHidden: PropTypes.bool
};
