import React from 'react';
import PropTypes from 'prop-types';
import {Breadcrumb, BreadcrumbItem, Dropdown} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {cmAddSelection} from '../../redux/selection.redux';
import {useDispatch} from 'react-redux';

export const Breadcrumbs = ({nodes, responsiveMode}) => {
    const {t} = useTranslation('jcontent');
    const dispatch = useDispatch();

    if (responsiveMode) {
        const data = nodes.map(n => ({
            label: n.name,
            value: n.path,
            image: <img alt={n.name} src={`${window.contextJsParameters.contextPath}${n.primaryNodeType.icon}.png`}/>
        }));

        return (
            <Dropdown data={data}
                      placeholder={t('jcontent:label.contentManager.pageBuilder.breadcrumbs.dropdownLabel')}
                      onChange={(e, v) => {
                          e.preventDefault();
                          e.stopPropagation();
                          dispatch(cmAddSelection(v.value));
                      }}
            />
        );
    }

    return (
        <Breadcrumb data-sel-role="pagebuilder-breadcrumb">
            {nodes.map(n => (
                <BreadcrumbItem key={n.path}
                                label={n.name}
                                icon={<img alt={n.name} src={`${window.contextJsParameters.contextPath}${n.primaryNodeType.icon}.png`}/>}
                                onClick={event => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    // Meta key works without issues, ctrl key has a conflict with contextmenu
                                    if (event.ctrlKey || event.metaKey) {
                                        dispatch(cmAddSelection(n.path));
                                    }

                                    return false;
                                }}
                />
            ))}
        </Breadcrumb>
    );
};

Breadcrumbs.propTypes = {
    responsiveMode: PropTypes.bool,
    nodes: PropTypes.array
};
