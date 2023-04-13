import React from 'react';
import PropTypes from 'prop-types';
import {Button, Cancel, Typography} from '@jahia/moonstone';
import styles from '~/JContent/ContentRoute/ToolBar/ToolBar.scss';
import {useTranslation} from 'react-i18next';

export const Selection = ({paths, clear}) => {
    const {t} = useTranslation('jcontent');

    return (
        <div className="flexRow">
            <Typography variant="caption"
                        data-cm-role="selection-infos"
                        data-cm-selection-size={paths.length}
                        className={`${styles.selection}`}
            >
                {t('jcontent:label.contentManager.selection.itemsSelected', {count: paths.length})}
            </Typography>
            <div className={styles.spacer}/>
            <Button icon={<Cancel/>} variant="ghost" size="default" onClick={clear}/>
        </div>
    );
};

Selection.propTypes = {
    paths: PropTypes.array.isRequired,
    clear: PropTypes.func.isRequired
};
