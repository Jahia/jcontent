import React, {useCallback} from 'react';
import PropTypes from 'prop-types';
import {Breadcrumb, BreadcrumbItem, Dropdown} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';

export const Breadcrumbs = ({nodes, setCurrentElement, isResponsiveMode}) => {
    const {t} = useTranslation('jcontent');
    const dispatch = useDispatch();
    const {selection} = useSelector(state => ({
        selection: state.jcontent.selection
    }), shallowEqual);

    const handleItemOnClick = useCallback((event, path) => {
        event.preventDefault();
        event.stopPropagation();
        let element = event.target.ownerDocument.querySelector(`[jahiatype="module"][path="${path}"]`);
        if (element) {
            setCurrentElement(element);
        }

        return false;
    }, [setCurrentElement]);

    if (isResponsiveMode) {
        const data = nodes.map(n => ({
            label: n.name,
            value: n.path,
            image: <img alt={n.name} src={`${n.primaryNodeType.icon}.png`}/>
        }));

        return (
            <Dropdown data={data}
                      placeholder={t('jcontent:label.contentManager.pageBuilder.breadcrumbs.dropdownLabel')}
                      onChange={(e, v) => {
                          handleItemOnClick(selection, v.value, dispatch)(e);
                      }}
            />
        );
    }

    return (
        <Breadcrumb data-sel-role="pagebuilder-breadcrumb">
            {nodes.map(n => (
                <BreadcrumbItem key={n.path}
                                label={n.name}
                                icon={<img alt={n.name}
                                           src={`${n.primaryNodeType.icon}.png`}/>}
                                onClick={event => handleItemOnClick(event, n.path)}
                />
            ))}
        </Breadcrumb>
    );
};

Breadcrumbs.propTypes = {
    nodes: PropTypes.array,
    setCurrentElement: PropTypes.func,
    isResponsiveMode: PropTypes.bool
};
