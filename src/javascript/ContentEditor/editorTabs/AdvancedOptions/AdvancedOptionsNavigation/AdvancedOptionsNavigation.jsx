import React, {useMemo} from 'react';
import styles from './AdvancedOptionsNavigation.scss';
import {DisplayActions, registry} from '@jahia/ui-extender';
import {Chip, MenuItem} from '@jahia/moonstone';
import PropTypes from 'prop-types';
import {useRegisterEngineTabActions} from './useRegisterEngineTabActions';
import {registerAdvancedOptionsActions} from './registerAdvancedOptionsActions';
import {useTranslation} from 'react-i18next';
import {LoaderOverlay} from '~/ContentEditor/DesignSystem/LoaderOverlay';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';
import {skipToken, useQuery} from '@apollo/client';
import {UsagesCountQuery} from '~/UsagesTable/UsagesTable.gql-queries';

const DEPRECATED_GWT_ACTIONS = ['seo', 'usages', 'channels', 'visibility'];

function getNodesCount(data) {
    const nodesCount = data?.jcr?.nodeByPath?.usages;
    if (nodesCount === undefined) {
        return '0';
    }

    return nodesCount > 100 ? '99+' : nodesCount;
}

const Renderer = ({activeOption, setActiveOption, buttonLabel, onClick, tabs}) => {
    const tab = tabs ? tabs[0] : 'technicalInformation';
    const {nodeData} = useContentEditorContext();

    const isHidden = useMemo(() => {
        if (tab === 'channels') {
            return true;
        }

        if (tab === 'usages' && nodeData.isSite) {
            return true;
        }

        return false;
    }, [tab, nodeData.isSite]);

    const {data} = useQuery(UsagesCountQuery, isHidden ? skipToken : {
        variables: {path: nodeData.path},
        fetchPolicy: 'cache-and-network'
    });

    if (isHidden) {
        return null;
    }

    if (tab === 'usages') {
        return (
            <MenuItem
                className={styles.menuItemWithChip}
                isSelected={activeOption === tab}
                label={buttonLabel}
                iconEnd={<Chip color={activeOption === tab ? 'light' : 'default'} label={getNodesCount(data)}/>}
                onClick={e => {
                    if (DEPRECATED_GWT_ACTIONS.includes(tab)) {
                        setActiveOption(tab);
                        return;
                    }

                    onClick(e);
                }}
            />
        );
    }

    return (
        <MenuItem
            isSelected={activeOption === tab}
            label={buttonLabel}
            onClick={e => {
                if (DEPRECATED_GWT_ACTIONS.includes(tab)) {
                    setActiveOption(tab);
                    return;
                }

                onClick(e);
            }}
        />
    );
};

Renderer.propTypes = {
    activeOption: PropTypes.string,
    buttonLabel: PropTypes.string,
    onClick: PropTypes.func,
    setActiveOption: PropTypes.func,
    tabs: PropTypes.array
};

export const AdvancedOptionsNavigation = ({activeOption, setActiveOption}) => {
    const {t} = useTranslation('jcontent');

    // Engines tabs need the node Data to be registered
    const {tabs, loading, error} = useRegisterEngineTabActions();
    registerAdvancedOptionsActions(registry, t);

    if (error) {
        const message = t(
            'jcontent:label.contentEditor.error.queryingContent',
            {details: error.message ? error.message : ''}
        );
        return <>{message}</>;
    }

    if (loading) {
        return <LoaderOverlay/>;
    }

    return (
        <div data-sel-role="advanced-options-nav" className={styles.container}>
            <ul>
                <DisplayActions activeOption={activeOption}
                                setActiveOption={setActiveOption}
                                target="AdvancedOptionsActions"
                                filter={action => {
                                    return action.shouldBeDisplayed(tabs, action.key);
                                }}
                                render={Renderer}
                />
            </ul>
        </div>
    );
};

AdvancedOptionsNavigation.propTypes = {
    activeOption: PropTypes.string.isRequired,
    setActiveOption: PropTypes.func.isRequired
};
