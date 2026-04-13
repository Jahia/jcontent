import React from 'react';
import PropTypes from 'prop-types';
import {Typography} from '@jahia/moonstone';
import styles from './DateTime.scss';

export const RenderCondition = ({rule, updateRules, isNew}) => {
    function getTypography(prop) {
        // Check if there is an updated rule with rule.uuid in updateRules if yes get the value of the property from this rule instead of the one from the original rule
        const updatedRule = updateRules ? updateRules.find(r => r.uuid === rule.uuid) : null;
        const value = updatedRule && updatedRule[prop.name] !== undefined ? updatedRule[prop.name] : (prop.values !== null ? prop.values : prop.value);
        if (Array.isArray(value)) {
            return value.join(', ');
        }
        return value;
    }

    if (isNew) {
        return <div className={styles.row}>
            {Object.keys(rule).filter(key => key !== 'type').map(key => {
                return (
                    <div key={key} className={styles.row}>
                        <Typography variant="caption">{key}:</Typography>
                        <Typography>{rule[key]}</Typography>
                    </div>
                );
            })}
        </div>;
    }

    return <div className={styles.row}>
        {rule.properties.map(prop => {
            if (prop.name !== 'jcr:primaryType' && prop.name !== 'jcr:uuid') {
                return (
                    <div key={prop.name} className={styles.row}>
                        <Typography variant="caption">{prop.name}:</Typography>
                        <Typography>{getTypography(prop)}</Typography>
                    </div>
                );
            }
            return null;
        })}
    </div>;
};

RenderCondition.propTypes = {
    updateRules: PropTypes.array,
    rule: PropTypes.object,
    isNew: PropTypes.bool
};

