import React from 'react';
import InputBase from '@material-ui/core/InputBase';
import {shallowWithTheme} from '@jahia/test-framework';
import {dsGenericTheme} from '@jahia/design-system-kit';
import {useLazyQuery} from '@apollo/client';
import {useDispatch} from 'react-redux';
import {ContentTreeSearch} from './ContentTreeSearch';
import {cmOpenPaths} from '~/JContent/redux/JContent.redux';

jest.mock('@apollo/client', () => ({
    useLazyQuery: jest.fn()
}));
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn()
}));

describe('ContentTreeSearch', () => {
    let search;
    let dispatch;
    let onMatchedPaths;
    let defaultProps;

    beforeEach(() => {
        search = jest.fn().mockResolvedValue({data: {jcr: {nodesByCriteria: {nodes: []}}}});
        dispatch = jest.fn();
        onMatchedPaths = jest.fn();

        useLazyQuery.mockReturnValue([search, {loading: false}]);
        useDispatch.mockReturnValue(dispatch);

        defaultProps = {
            rootPath: '/sites/testsite',
            language: 'en',
            onMatchedPaths
        };
    });

    const typeValue = (cmp, value) => {
        cmp.find(InputBase).props().onChange({target: {value}});
        cmp.update();
    };

    it('should not trigger a search on every keystroke', () => {
        const cmp = shallowWithTheme(<ContentTreeSearch {...defaultProps}/>, {}, dsGenericTheme);
        typeValue(cmp, 'about');

        expect(search).not.toHaveBeenCalled();
    });

    it('should trigger a search when Enter is pressed', () => {
        const cmp = shallowWithTheme(<ContentTreeSearch {...defaultProps}/>, {}, dsGenericTheme);
        typeValue(cmp, 'about');
        cmp.find(InputBase).props().onKeyUp({key: 'Enter'});

        expect(search).toHaveBeenCalledWith({
            variables: {
                rootPath: '/sites/testsite',
                nodeType: 'jnt:page',
                searchTerm: '%about%',
                language: 'en',
                limit: 50
            }
        });
    });

    it('should not trigger a search on keys other than Enter', () => {
        const cmp = shallowWithTheme(<ContentTreeSearch {...defaultProps}/>, {}, dsGenericTheme);
        typeValue(cmp, 'about');
        cmp.find(InputBase).props().onKeyUp({key: 'a'});

        expect(search).not.toHaveBeenCalled();
    });

    it('should trigger a search when the search button is clicked', () => {
        const cmp = shallowWithTheme(<ContentTreeSearch {...defaultProps}/>, {}, dsGenericTheme);
        typeValue(cmp, 'About');
        cmp.find('[data-sel-role="content-tree-search-button"]').props().onClick();

        expect(search).toHaveBeenCalledWith({
            variables: expect.objectContaining({searchTerm: '%about%'})
        });
    });

    it('should not search and should clear matches when triggered with an empty value', () => {
        const cmp = shallowWithTheme(<ContentTreeSearch {...defaultProps}/>, {}, dsGenericTheme);
        cmp.find('[data-sel-role="content-tree-search-button"]').props().onClick();

        expect(search).not.toHaveBeenCalled();
        expect(onMatchedPaths).toHaveBeenCalledWith([], '');
    });

    it('should not show a clear button when the input is empty', () => {
        const cmp = shallowWithTheme(<ContentTreeSearch {...defaultProps}/>, {}, dsGenericTheme);

        expect(cmp.find('[data-sel-role="content-tree-search-clear"]').length).toBe(0);
    });

    it('should reset the input and matches when the clear button is clicked', () => {
        const cmp = shallowWithTheme(<ContentTreeSearch {...defaultProps}/>, {}, dsGenericTheme);
        typeValue(cmp, 'about');
        cmp.find('[data-sel-role="content-tree-search-clear"]').props().onClick();
        cmp.update();

        expect(onMatchedPaths).toHaveBeenCalledWith([], '');
        expect(cmp.find(InputBase).props().value).toBe('');
    });

    it('should expand ancestors of every match and report matched paths once results arrive', async () => {
        search = jest.fn().mockResolvedValue({
            data: {
                jcr: {
                    nodesByCriteria: {
                        nodes: [
                            {uuid: '1', path: '/sites/testsite/home/about'},
                            {uuid: '2', path: '/sites/testsite/home/contact'}
                        ]
                    }
                }
            }
        });
        useLazyQuery.mockReturnValue([search, {loading: false}]);

        const cmp = shallowWithTheme(<ContentTreeSearch {...defaultProps}/>, {}, dsGenericTheme);
        typeValue(cmp, 'a');
        await cmp.find('[data-sel-role="content-tree-search-button"]').props().onClick();

        expect(dispatch).toHaveBeenCalledWith(cmOpenPaths(['/sites/testsite/home', '/sites/testsite']));
        expect(onMatchedPaths).toHaveBeenCalledWith(['/sites/testsite/home/about', '/sites/testsite/home/contact'], 'a');
    });

    it('should show a "no results" message when the search returns no matches', async () => {
        const cmp = shallowWithTheme(<ContentTreeSearch {...defaultProps}/>, {}, dsGenericTheme);
        typeValue(cmp, 'nomatch');
        await cmp.find('[data-sel-role="content-tree-search-button"]').props().onClick();
        cmp.update();

        expect(cmp.find('[data-sel-role="content-tree-search-no-results"]').length).toBe(1);
    });
});
