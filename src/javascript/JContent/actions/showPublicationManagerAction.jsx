import React from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';

export const PublishManagerActionComponent = props => {
    const {id, path, publicationNodeTypes, buttonIcon, buttonLabel, render: Render, loading: Loading} = props;
    const {language, siteKey} = useSelector(state => ({
        language: state.language,
        siteKey: state.site
    }));

    const {t} = useTranslation('jcontent');

    const res = useNodeChecks({path, language}, {
        getDisplayName: true,
        getProperties: ['jcr:mixinTypes'],
        getSiteLanguages: true,
        getPermissions: ['publish', 'publication-start'],
        hideOnNodeTypes: ['jnt:category', 'jmix:markedForDeletion']
    });

    if (res.loading) {
        return (Loading && <Loading {...props}/>) || false;
    }

    const isVisible = res.checksResult && typeof window?.authoringApi?.showPublicationManager === 'function';
    const mixinTypes = res.node?.mixinTypes ? res.node.mixinTypes.map(mixinType => mixinType.name) : [];

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
    publicationNodeTypes: PropTypes.arrayOf(PropTypes.string)
};
