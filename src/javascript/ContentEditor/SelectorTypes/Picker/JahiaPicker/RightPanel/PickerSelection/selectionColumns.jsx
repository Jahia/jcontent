import {Button, Close, TableBodyCell} from '@jahia/moonstone';
import React from 'react';
import styles from './Selection.scss';
import {useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {cePickerRemoveSelection} from '~/ContentEditor/SelectorTypes/Picker/Picker.redux';
import {allColumnData} from '~/ContentEditor/SelectorTypes/Picker/reactTable/columns';
import {rowPropType} from '~/ContentEditor/SelectorTypes/Picker/reactTable/columns/rowPropType';

const ActionsCell = ({row}) => {
    const {t} = useTranslation('jcontent');
    const dispatch = useDispatch();
    return (
        <TableBodyCell className={styles.cellActions} data-cm-role="actions-cell">
            <Button variant="ghost"
                    icon={<Close/>}
                    aria-label={t('jcontent:label.contentManager.selection.removeFrom')}
                    onClick={() => dispatch(cePickerRemoveSelection(row.original.uuid))}/>
        </TableBodyCell>
    );
};

ActionsCell.propTypes = rowPropType;

export const selectionColumns = [
    ...allColumnData,
    {
        id: 'cellActions',
        Cell: ActionsCell
    }
];
