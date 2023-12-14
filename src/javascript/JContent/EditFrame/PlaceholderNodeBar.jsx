import React from 'react';
import PropTypes from 'prop-types';
import {Chip, Gravel, Typography} from '@jahia/moonstone';
import {useQuery} from '@apollo/client';
import gql from 'graphql-tag';
import {NodeIcon} from '~/utils';
import styles from '~/JContent/EditFrame/Box.scss';
import {DisplayAction} from '@jahia/ui-extender';
import {ButtonRenderer, ButtonRendererNoLabel} from '~/utils/getButtonRenderer';
import {headerButtonWrapper} from '~/JContent/EditFrame/DefaultBar';
import {useSelector} from 'react-redux';

export const PlaceholderNodeBar = ({element, width, currentFrameRef}) => {
    const WrappedButtonRendererNoLabel = headerButtonWrapper(ButtonRendererNoLabel, currentFrameRef);
    const WrappedButtonRenderer = headerButtonWrapper(ButtonRenderer, currentFrameRef);
    const uilang = useSelector(state => state.uilang);

    const displayLabels = width > 400;

    const content = JSON.parse(element.dataset.content);
    const {data} = useQuery(
        gql`query nt($name: String!, $lang: String!) { jcr {nodeTypeByName(name: $name) {displayName(language: $lang) name icon}}}`, {
            variables: {
                lang: uilang,
                name: content.nodeType
            }
        }
    );

    return (
        <>
            <NodeIcon node={{path: '', primaryNodeType: data?.jcr?.nodeTypeByName}}/>
            <Typography isNowrap className={styles.title} variant="caption">{content.name || data?.jcr?.nodeTypeByName.displayName}</Typography>
            <Chip label="Placeholder node" icon={<Gravel/>} color="reassuring" data-sel-role="content-status"/>
            <DisplayAction
                actionKey="createFromTemplate"
                content={content}
                render={displayLabels ? WrappedButtonRenderer : WrappedButtonRendererNoLabel}
                buttonProps={{variant: 'ghost', size: 'small'}}
            />
        </>
    );
};

PlaceholderNodeBar.propTypes = {
    currentFrameRef: PropTypes.any,

    width: PropTypes.number,

    element: PropTypes.any
};
