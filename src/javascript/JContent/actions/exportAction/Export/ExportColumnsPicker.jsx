import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Button, CheckboxItem, ChevronDown, ChevronUp} from '@jahia/moonstone';
import styles from './Export.scss';

const move = (ids, id, direction) => {
    const index = ids.indexOf(id);
    const next = index + direction;
    if (index === -1 || next < 0 || next >= ids.length) {
        return ids;
    }

    const reordered = [...ids];
    [reordered[index], reordered[next]] = [reordered[next], reordered[index]];
    return reordered;
};

/** The columns of a CSV or JSON export: the chosen ones first, in export order, then the others. */
export const ExportColumnsPicker = ({columns, chosen, labelOf, onChange}) => {
    const {t} = useTranslation('jcontent');
    const byId = new Map(columns.map(column => [column.id, column]));
    const others = columns.filter(column => !chosen.includes(column.id));

    return (
        <div className={styles.columns} data-cm-role="export-columns">
            {chosen.filter(id => byId.has(id)).map((id, index, list) => (
                <div key={id} className={styles.columnRow} data-cm-role="export-column" data-cm-column={id} data-cm-chosen="true">
                    <CheckboxItem checked
                                  id={`export-column-${id}`}
                                  value={id}
                                  label={labelOf(byId.get(id))}
                                  onChange={() => onChange(chosen.filter(candidate => candidate !== id))}
                    />
                    <div className={styles.columnOrder}>
                        <Button size="small"
                                variant="ghost"
                                icon={<ChevronUp/>}
                                aria-label={t('jcontent:label.contentManager.export.records.moveUp')}
                                isDisabled={index === 0}
                                data-cm-role="export-column-up"
                                onClick={() => onChange(move(chosen, id, -1))}
                        />
                        <Button size="small"
                                variant="ghost"
                                icon={<ChevronDown/>}
                                aria-label={t('jcontent:label.contentManager.export.records.moveDown')}
                                isDisabled={index === list.length - 1}
                                data-cm-role="export-column-down"
                                onClick={() => onChange(move(chosen, id, 1))}
                        />
                    </div>
                </div>
            ))}
            {others.map(column => (
                <div key={column.id} className={styles.columnRow} data-cm-role="export-column" data-cm-column={column.id} data-cm-chosen="false">
                    <CheckboxItem id={`export-column-${column.id}`}
                                  checked={false}
                                  value={column.id}
                                  label={labelOf(column)}
                                  onChange={() => onChange([...chosen, column.id])}
                    />
                </div>
            ))}
        </div>
    );
};

ExportColumnsPicker.propTypes = {
    columns: PropTypes.arrayOf(PropTypes.shape({id: PropTypes.string.isRequired})).isRequired,
    chosen: PropTypes.arrayOf(PropTypes.string).isRequired,
    labelOf: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired
};
