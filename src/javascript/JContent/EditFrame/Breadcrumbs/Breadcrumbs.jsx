import React from 'react';
import PropTypes from 'prop-types';
import {Breadcrumb, BreadcrumbItem, Dropdown} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {cmAddSelection, cmClearSelection, cmRemoveSelection} from '../../redux/selection.redux';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {batchActions} from 'redux-batched-actions';
import {isDescendant} from '~/JContent/JContent.utils';

const handleItemOnClick = (selection, path, dispatch) => {
    return event => {
        event.preventDefault();
        event.stopPropagation();
        const isSelected = selection.includes(path);
        // Meta key works without issues, ctrl key has a conflict with contextmenu
        if (event.ctrlKey || event.metaKey) {
            if (isSelected) {
                dispatch(cmRemoveSelection(path));
            } else if (!selection.some(element => isDescendant(path, element))) {
                // Ok so no parent is already selected we can add ourselves
                let actions = [];
                actions.push(cmAddSelection(path));
                // Now we need to remove children if there was any selected as we do not allow multiple selection of parent/children
                selection.filter(element => isDescendant(element, path)).forEach(selectedChild => actions.push(cmRemoveSelection(selectedChild)));
                dispatch(batchActions(actions));
            }
        } else if (!isSelected) {
            dispatch(batchActions([cmClearSelection(), cmAddSelection(path)]));
        }

        return false;
    };
};

export const Breadcrumbs = ({nodes, isResponsiveMode}) => {
    const {t} = useTranslation('jcontent');
    const dispatch = useDispatch();
    const {selection} = useSelector(state => ({
        selection: state.jcontent.selection
    }), shallowEqual);
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
                                onClick={handleItemOnClick(selection, n.path, dispatch)}
                />
            ))}
        </Breadcrumb>
    );
};

Breadcrumbs.propTypes = {
    isResponsiveMode: PropTypes.bool,
    nodes: PropTypes.array
};
