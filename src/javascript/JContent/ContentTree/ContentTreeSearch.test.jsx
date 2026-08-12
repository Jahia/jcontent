import React from 'react';
import InputBase from '@material-ui/core/InputBase';
import {shallowWithTheme} from '@jahia/test-framework';
import {dsGenericTheme} from '@jahia/design-system-kit';
import {useLazyQuery} from '@apollo/client';
import {useDispatch} from 'react-redux';
import {ContentTreeSearch} from './ContentTreeSearch';
import {buildTitleSearchConstraint} from './ContentTreeSearch.utils';
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
        search = jest.fn().mockResolvedValue({
            data: {
                jcr: {
                    pages: {nodes: []},
                    menuTitles: {nodes: []},
                    internalLinks: {nodes: []},
                    externalLinks: {nodes: []}
                }
            }
        });
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
                nodeConstraint: buildTitleSearchConstraint('about'),
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
            variables: expect.objectContaining({nodeConstraint: buildTitleSearchConstraint('About')})
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
                    pages: {
                        nodes: [
                            {uuid: '1', path: '/sites/testsite/home/about'},
                            {uuid: '2', path: '/sites/testsite/home/contact'}
                        ]
                    },
                    menuTitles: {nodes: []},
                    internalLinks: {nodes: []},
                    externalLinks: {nodes: []}
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

    it('should merge matches from pages, menu titles, internal links and external links', async () => {
        search = jest.fn().mockResolvedValue({
            data: {
                jcr: {
                    pages: {nodes: [{uuid: '1', path: '/sites/testsite/home/about'}]},
                    menuTitles: {nodes: [{uuid: '2', path: '/sites/testsite/home/menu'}]},
                    internalLinks: {nodes: [{uuid: '3', path: '/sites/testsite/home/internal-link'}]},
                    externalLinks: {nodes: [{uuid: '4', path: '/sites/testsite/home/external-link'}]}
                }
            }
        });
        useLazyQuery.mockReturnValue([search, {loading: false}]);

        const cmp = shallowWithTheme(<ContentTreeSearch {...defaultProps}/>, {}, dsGenericTheme);
        typeValue(cmp, 'a');
        await cmp.find('[data-sel-role="content-tree-search-button"]').props().onClick();

        expect(onMatchedPaths).toHaveBeenCalledWith([
            '/sites/testsite/home/about',
            '/sites/testsite/home/menu',
            '/sites/testsite/home/internal-link',
            '/sites/testsite/home/external-link'
        ], 'a');
    });

    it('should announce a "no results" message when the search returns no matches', async () => {
        const cmp = shallowWithTheme(<ContentTreeSearch {...defaultProps}/>, {}, dsGenericTheme);
        typeValue(cmp, 'nomatch');
        await cmp.find('[data-sel-role="content-tree-search-button"]').props().onClick();
        cmp.update();

        const resultCount = cmp.find('[data-sel-role="content-tree-search-result-count"]');
        expect(resultCount.props()['aria-live']).toBe('polite');
        expect(resultCount.text()).toContain('jcontent:label.contentManager.tree.search.noResults');
    });

    it('should announce the number of results when the search returns matches', async () => {
        search = jest.fn().mockResolvedValue({
            data: {
                jcr: {
                    pages: {nodes: [{uuid: '1', path: '/sites/testsite/home/about'}]},
                    menuTitles: {nodes: []},
                    internalLinks: {nodes: []},
                    externalLinks: {nodes: []}
                }
            }
        });
        useLazyQuery.mockReturnValue([search, {loading: false}]);

        const cmp = shallowWithTheme(<ContentTreeSearch {...defaultProps}/>, {}, dsGenericTheme);
        typeValue(cmp, 'about');
        await cmp.find('[data-sel-role="content-tree-search-button"]').props().onClick();
        cmp.update();

        const resultCount = cmp.find('[data-sel-role="content-tree-search-result-count"]');
        expect(resultCount.text()).toContain('jcontent:label.contentManager.tree.search.resultsFound');
    });

    it('should render an empty, but always-mounted result-count region before any search runs', () => {
        const cmp = shallowWithTheme(<ContentTreeSearch {...defaultProps}/>, {}, dsGenericTheme);

        const resultCount = cmp.find('[data-sel-role="content-tree-search-result-count"]');
        expect(resultCount.length).toBe(1);
        expect(resultCount.text()).toBe('');
    });
});
