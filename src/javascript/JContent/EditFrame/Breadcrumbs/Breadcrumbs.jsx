import React, {useCallback} from 'react';
import PropTypes from 'prop-types';
import {Dropdown} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {shallowEqual, useSelector} from 'react-redux';
import {NodeIcon} from '~/utils';

export const Breadcrumbs = ({nodes, setCurrentElement, onSelect}) => {
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

    const data = nodes.toReversed().map((n, index) => ({
        label: n.name,
        value: n.path,
        image: <NodeIcon node={n} style={{marginLeft: 8 * index}}/>
    }));

    return (
        <Dropdown data={data}
                  data-sel-role="pagebuilder-itempath-dropdown"
                  placeholder={t('jcontent:label.contentManager.pageBuilder.breadcrumbs.dropdownLabel')}
                  onChange={(e, v) => {
                      handleItemOnClick(e, v.value);
                  }}
        />
    );
};

Breadcrumbs.propTypes = {
    nodes: PropTypes.array,
    setCurrentElement: PropTypes.func,
    onSelect: PropTypes.func
};
