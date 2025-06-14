import {Chip, TableBodyCell, Typography} from '@jahia/moonstone';
import React from 'react';
import {DisplayAction} from '@jahia/ui-extender';
import {Tooltip} from '@material-ui/core';
import styles from './Cells.scss';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {ButtonRendererIconButton} from '~/utils/getButtonRenderer';

const MAX_BADGES = 3;

export const LocationCell = ({row, column}) => {
    const {t} = useTranslation();
    const sortedLanguages = row.original.locales.indexOf(null) >= 0 ? [t('jcontent:label.contentEditor.edit.sharedLanguages')] : row.original.locales.map(l => l.toUpperCase()).sort();
    const sortedLanguagesLength = sortedLanguages.length;
    sortedLanguages.splice(MAX_BADGES);

    return (
        <TableBodyCell data-cm-role="location-cell" className={styles.cellLocation} width={column.width}>
            <div className={styles.location}>
                <Tooltip title={row.original.path} classes={{tooltip: styles.cellTooltip}}>
                    <Typography isNowrap className={styles.text} variant="body">{row.original.path}</Typography>
                </Tooltip>
                <div className="flexFluid"/>
                <div className={styles.badges}>
                    {sortedLanguages.map(l => <Chip key={l} color="accent" label={l}/>)}
                    {sortedLanguagesLength > sortedLanguages.length && <Chip color="accent" label={'+' + (sortedLanguagesLength - sortedLanguages.length)}/>}
                </div>
                <div data-cm-role="table-usages-cell-actions" className={styles.buttons}>
                    <DisplayAction
                        actionKey="previewInNewTab"
                        path={row.original.path}
                        render={ButtonRendererIconButton}
                        buttonProps={{variant: 'ghost', size: 'big'}}
                    />
                    <DisplayAction
                        actionKey="openInNewTab"
                        path={row.original.path}
                        render={ButtonRendererIconButton}
                        buttonProps={{variant: 'ghost', size: 'big'}}
                    />
                </div>
            </div>
        </TableBodyCell>
    );
};

LocationCell.propTypes = {
    column: PropTypes.object,
    row: PropTypes.object
};
