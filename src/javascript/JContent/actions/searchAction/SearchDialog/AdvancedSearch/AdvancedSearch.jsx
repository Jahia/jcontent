import React from 'react';
import PropTypes from 'prop-types';
import Sql2Input from './Sql2Input';
import {connect} from 'react-redux';
import {Trans} from 'react-i18next';
import {DxContext} from '@jahia/react-material';
import {compose} from '~/utils';
import {cmGoto} from '~/JContent/JContent.redux';
import JContentConstants from '~/JContent/JContent.constants';
import styles from './AdvancedSearch.scss';
import SearchLocation from '../SearchLocation';
import {Typography} from '@jahia/moonstone';

export class AdvancedSearch extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    static getDerivedStateFromProps(props, state) {
        let {params} = props;
        if (state.ongoingSearch && (state.ongoingSearch.sql2SearchWhere !== params.sql2SearchWhere || state.ongoingSearch.sql2SearchFrom !== params.sql2SearchFrom)) {
            // Props have changed compared to previous search, override the current state
            return {
                sql2SearchWhere: params.sql2SearchWhere !== undefined ? params.sql2SearchWhere : '',
                sql2SearchFrom: params.sql2SearchFrom !== undefined ? params.sql2SearchFrom : '',
                ongoingSearch: params
            };
        }

        return {
            sql2SearchWhere: state.sql2SearchWhere !== undefined ? state.sql2SearchWhere : (params.sql2SearchWhere ? params.sql2SearchWhere : ''),
            sql2SearchFrom: state.sql2SearchFrom !== undefined ? state.sql2SearchFrom : (params.sql2SearchFrom ? params.sql2SearchFrom : ''),
            ongoingSearch: params
        };
    }

    onSearch(sql2SearchFrom, sql2SearchWhere) {
        let {path, search} = this.props;

        let params = {sql2SearchFrom, sql2SearchWhere};

        search(JContentConstants.mode.SQL2SEARCH, path, params);
    }

    render() {
        let {searchPath, handleSearchChanges} = this.props;
        let {sql2SearchFrom, sql2SearchWhere} = this.state;

        return (
            <>
                <div className={styles.fieldset}>
                    <SearchLocation searchPath={searchPath} handleSearchChanges={handleSearchChanges}/>
                </div>
                <div className={styles.fieldset}>
                    <Typography variant="caption" weight="semiBold" className={styles.label}>SELECT * FROM</Typography>
                    <Sql2Input
                        maxLength={100}
                        size={15}
                        value={sql2SearchFrom}
                        cmRole="sql2search-input-from"
                        onChange={event => {
                            this.setState({sql2SearchFrom: event.target.value});
                        }}
                        onSearch={() => this.onSearch(sql2SearchFrom, sql2SearchWhere)}
                    />
                </div>
                <div className={styles.fieldset}>
                    <Typography variant="caption" weight="semiBold" className={styles.label}>WHERE ISDESCENDANTNODE(*Current location) AND</Typography>
                    <Sql2Input
                        maxLength={2000}
                        value={sql2SearchWhere}
                        cmRole="sql2search-input-where"
                        onChange={event => {
                            this.setState({sql2SearchWhere: event.target.value});
                        }}
                        onSearch={() => this.onSearch(sql2SearchFrom, sql2SearchWhere)}
                    />

                    <DxContext.Consumer>
                        {dxContext => (
                            <Typography variant="caption" className={styles.academyLink}>
                                <Trans i18nKey="jcontent:label.contentManager.search.sql2Prompt"
                                       components={[
                                           <a key="sql2Prompt"
                                              href={dxContext.config.sql2CheatSheetUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                           >
                                               univers
                                           </a>
                                       ]}
                                />
                            </Typography>
                        )}
                    </DxContext.Consumer>
                </div>
            </>
        );
    }
}

const mapStateToProps = state => ({
    path: state.jcontent.path,
    params: state.jcontent.params
});

const mapDispatchToProps = dispatch => {
    return {
        search: (mode, path, params) => dispatch(cmGoto({mode, path, params}))
    };
};

AdvancedSearch.propTypes = {
    path: PropTypes.string.isRequired,
    searchPath: PropTypes.string.isRequired,
    params: PropTypes.object.isRequired,
    search: PropTypes.func.isRequired,
    handleSearchChanges: PropTypes.func.isRequired
};

export default compose(
    connect(mapStateToProps, mapDispatchToProps)
)(AdvancedSearch);
