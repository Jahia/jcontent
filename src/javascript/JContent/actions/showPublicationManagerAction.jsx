import React from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {isDefinitelyHidden} from './utils/nodeVisibilityUtils';

export const PublishManagerActionComponent = props => {
    const {id, path, paths, node: prefetchedNode, publicationNodeTypes, buttonIcon, buttonLabel, render: Render, loading: Loading} = props;
    const {language, siteKey} = useSelector(state => ({
        language: state.language,
        siteKey: state.site
    }));

    const {t} = useTranslation('jcontent');

    const skip = Boolean(paths) ||
        typeof window?.authoringApi?.showPublicationManager !== 'function' ||
        isDefinitelyHidden(prefetchedNode, {hideOnNodeTypes: ['jnt:category', 'jmix:markedForDeletion']});

    const res = useNodeChecks({path, language}, {
        skip,
        getDisplayName: true,
        // Read at onClick time as res.node.primaryNodeType.name; useNodeInfo only puts the field
        // in the query when this option is set, so without it the click throws.
        getPrimaryNodeType: true,
        getProperties: ['jcr:mixinTypes'],
        getSiteLanguages: true,
        getPermissions: ['publish', 'publication-start'],
        hideOnNodeTypes: ['jnt:category', 'jmix:markedForDeletion', 'jmix:nolive', 'jmix:autoPublish']
    });

    if (res.loading) {
        return (Loading && <Loading {...props}/>) || false;
    }

    if (skip) {
        return false;
    }

    const isVisible = !paths && res.checksResult && typeof window?.authoringApi?.showPublicationManager === 'function';
    // GetProperties(['jcr:mixinTypes']) delivers the mixins under properties, not as
    // node.mixinTypes - the same two shapes hasMixin() has to cope with. Reading node.mixinTypes
    // off a useNodeChecks result always yielded [], so the manager never saw the node's mixins.
    const mixinTypes = res.node?.properties?.find(prop => prop.name === 'jcr:mixinTypes')?.values ?? [];

    return (
        <Render
            {...props}
            buttonIcon={buttonIcon}
            buttonLabel={t(buttonLabel)}
            isVisible={isVisible}
            enabled={isVisible}
            onClick={() => {
                window.authoringApi.showPublicationManager(
                    id,
                    path,
                    res.node.displayName,
                    [res.node.primaryNodeType.name],
                    mixinTypes,
                    siteKey,
                    publicationNodeTypes,
                    res.node.site.languages.filter(l => l.activeInEdit));
            }}
        />
    );
};

PublishManagerActionComponent.propTypes = {
    id: PropTypes.string,
    path: PropTypes.string,
    paths: PropTypes.arrayOf(PropTypes.string),
    language: PropTypes.string,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func,
    buttonLabelShort: PropTypes.string,
    buttonLabel: PropTypes.string.isRequired,
    buttonIcon: PropTypes.node,
    isMediumLabel: PropTypes.bool,
    node: PropTypes.object,
    publicationNodeTypes: PropTypes.arrayOf(PropTypes.string)
};
