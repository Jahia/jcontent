import {BasePage} from '@jahia/cypress';

/**
 * The search box that sits above the pages tree in jContent's side panel.
 *
 * The status line is an aria-live region that is always mounted, so it reads as an empty string
 * before any search has run and again after a search the component decided not to send.
 */
export class ContentTreeSearch extends BasePage {
    static readonly inputSelector = 'input[data-sel-role="content-tree-search-input"]';
    static readonly buttonSelector = '[data-sel-role="content-tree-search-button"]';
    static readonly clearSelector = '[data-sel-role="content-tree-search-clear"]';
    static readonly statusSelector = '[data-sel-role="content-tree-search-result-count"]';

    /**
     * Types a term and runs the search.
     *
     * parseSpecialCharSequences is turned off so that a literal '%', '_', '(' or '{' reaches the
     * input as itself instead of being read by cypress as a key sequence - several of the tests
     * below exist precisely to send those characters through.
     * @param term the raw text to type in the box
     * @returns this page object
     */
    search(term: string): this {
        cy.get(ContentTreeSearch.inputSelector).should('not.be.disabled').clear();
        cy.get(ContentTreeSearch.inputSelector).type(term, {parseSpecialCharSequences: false});
        cy.get(ContentTreeSearch.buttonSelector).click();
        return this;
    }

    clear(): this {
        cy.get(ContentTreeSearch.clearSelector).click();
        return this;
    }

    getStatus() {
        return cy.get(ContentTreeSearch.statusSelector);
    }

    /**
     * Asserts the exact count the status line announces. The whole text is compared rather than a
     * substring, because 'contain' would let '11 results found' satisfy an expected '1 result'.
     * @param count the number of matches the search is expected to report
     * @returns this page object
     */
    shouldShowResultCount(count: number): this {
        const expected = count === 1 ? '1 result found' : `${count} results found`;
        this.getStatus().should('have.text', expected);
        return this;
    }

    shouldShowNoResults(): this {
        this.getStatus().should('have.text', 'No pages found');
        return this;
    }

    /**
     * Asserts the status line says nothing at all, which is what the component does when it
     * decides the input holds nothing a query can use and therefore sends no query.
     * @returns this page object
     */
    shouldShowNoStatus(): this {
        this.getStatus().should('have.text', '');
        return this;
    }
}
