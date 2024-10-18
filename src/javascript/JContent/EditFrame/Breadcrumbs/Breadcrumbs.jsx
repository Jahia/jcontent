import React, {useCallback} from 'react';
import PropTypes from 'prop-types';
import {Breadcrumb, BreadcrumbItem, Dropdown} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {shallowEqual, useSelector} from 'react-redux';
import {NodeIcon} from '~/utils';

export const Breadcrumbs = ({nodes, setCurrentElement, onSelect, isResponsiveMode}) => {
    const {t} = useTranslation('jcontent');
    const {selection} = useSelector(state => ({
        selection: state.jcontent.selection
    }), shallowEqual);

    const handleItemOnClick = useCallback((event, path) => {
        event.preventDefault();
        event.stopPropagation();
        const element = event.target.ownerDocument.querySelector(`[jahiatype="module"][path="${path}"]`);
        if (element) {
            setCurrentElement({element, path, breadcrumb: true});
        }

        if (selection.length > 0) {
            onSelect(event, path);
        }

        return false;
    }, [onSelect, selection.length, setCurrentElement]);

    if (isResponsiveMode) {
        const data = nodes.map(n => ({
            label: n.name,
            value: n.path,
            image: <NodeIcon node={n}/>
        }));

        return (
            <Dropdown data={data}
                      placeholder={t('jcontent:label.contentManager.pageBuilder.breadcrumbs.dropdownLabel')}
                      onChange={(e, v) => {
                          handleItemOnClick(e, v.value);
                      }}
            />
        );
    }

    return (
        <Breadcrumb data-sel-role="pagebuilder-breadcrumb">
            {nodes.map(n => (
                <BreadcrumbItem key={n.path}
                                label={n.name}
                                icon={<NodeIcon node={n}/>}
                                onClick={event => handleItemOnClick(event, n.path)}
                />
            ))}
        </Breadcrumb>
    );
};

Breadcrumbs.propTypes = {
    nodes: PropTypes.array,
    setCurrentElement: PropTypes.func,
    onSelect: PropTypes.func,
    isResponsiveMode: PropTypes.bool
};
