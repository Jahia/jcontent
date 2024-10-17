import React from 'react';
import {shallowWithTheme} from '@jahia/test-framework';
import {dsGenericTheme} from '@jahia/design-system-kit';

import {ChoiceTree} from './ChoiceTree';
import {setQueryResult} from '@apollo/client';

jest.mock('@apollo/client', () => {
    let queryResultmock;
    return {
        useQuery: jest.fn(() => {
            return {data: queryResultmock, error: null, loading: false};
        }),
        setQueryResult: r => {
            queryResultmock = r;
        }
    };
});

describe('ChoiceTree component', () => {
    let props;
    const onChange = jest.fn();

    beforeEach(() => {
        props = {
            onChange,
            id: 'ChoiceTree',
            field: {
                displayName: 'ChoiceTree',
                name: 'myTree',
                readOnly: false,
                multiple: true,
                selectorType: 'choiceTree'
            },
            editorContext: {
                lang: 'en'
            },
            classes: {}
        };

        setQueryResult({
            jcr: {
                result: {
                    descendants: {
                        nodes: [
                            {
                                uuid: 'A',
                                parent: {
                                    uuid: 'root'
                                }
                            },
                            {
                                uuid: 'BG',
                                parent: {
                                    uuid: 'root'
                                }
                            },
                            {
                                uuid: 'Gauche',
                                parent: {
                                    uuid: 'root'
                                }
                            }
                        ]
                    }
                }
            }
        });
    });

    const buildComp = props => {
        return shallowWithTheme(<ChoiceTree {...props}/>, {}, dsGenericTheme);
    };

    it('should bind the id properly', () => {
        const cmp = buildComp(props);
        expect(cmp.props().id).toBe(props.id);
    });

    it('should set initial value', () => {
        const cmp = buildComp(props);
        expect(cmp.props().value).toBe(props.value);
    });
});
