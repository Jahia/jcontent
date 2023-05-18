import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Button, Cancel, Dropdown} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import {cmSwitchSelection} from '../../../../redux/selection.redux';
import {useNodeInfo} from '@jahia/data-helper';

export const Selection = ({paths, clear}) => {
    const [data, setData] = useState([{}]);
    const {t} = useTranslation('jcontent');
    const dispatch = useDispatch();
    const language = useSelector(state => state.language);
    const {nodes, loading} = useNodeInfo({paths, language}, {getDisplayName: true});

    const fillData = () => {
        setData(nodes.map(node => ({
            label: node.displayName, value: node.path
        })));
    };

    return (
        <div className="flexRow">
            <Dropdown label={t('jcontent:label.contentManager.selection.itemsSelected', {count: paths.length})}
                      data-sel-role="selection-infos"
                      data-sel-selection-size={paths.length}
                      hasSearch={false}
                      size="small"
                      data={data}
                      values={paths}
                      isDisabled={loading}
                      onFocus={fillData}
                      onBlur={() => {
                          // Required function to have onFocus work properly
                      }}
                      onChange={(e, item) => {
                          dispatch(cmSwitchSelection(item.value));
                      }}
            />
            <Button icon={<Cancel/>} label={t('label.contentManager.selection.clearMultipleSelection')} variant="ghost" size="default" data-sel-role="clearSelection" onClick={clear}/>
        </div>
    );
};

Selection.propTypes = {
    paths: PropTypes.array.isRequired,
    clear: PropTypes.func.isRequired
};
