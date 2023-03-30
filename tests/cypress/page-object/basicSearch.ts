import {
    BasePage,
    Button,
    Dropdown,
    getComponent,
    getComponentByRole,
    getComponentBySelector,
    MUIInput,
    MUIRadio,
    Pagination
} from '@jahia/cypress';
import {JContent} from './jcontent';

export class BasicSearch extends BasePage {
    jcontent: JContent;

    constructor(jcontent: JContent) {
        super();
        this.jcontent = jcontent;
    }

    openSearch(): BasicSearch {
        getComponentByRole(Button, 'open-search-dialog').click();
        return this;
    }

    editQuery(): BasicSearch {
        getComponentByRole(Button, 'search').click();
        return this;
    }

    searchTerm(value: string): BasicSearch {
        if (value) {
            getComponentBySelector(MUIInput, 'input[data-sel-role="search-input-terms"]').clear().type(value, {force: true});
        } else {
            getComponentBySelector(MUIInput, 'input[data-sel-role="search-input-terms"]').clear();
        }

        return this;
    }

    searchInWholeSite(): BasicSearch {
        getComponentByRole(MUIRadio, 'search-whole-website').click();
        return this;
    }

    searchInCurrentPath(): BasicSearch {
        getComponentByRole(MUIRadio, 'search-current-path').click();
        return this;
    }

    executeSearch(): BasicSearch {
        getComponentByRole(Button, 'search-submit').click();
        cy.get('.moonstone-loader').should('not.exist');
        return this;
    }

    verifyTotalCount(expectedTotalCount: number): BasicSearch {
        if (expectedTotalCount === 0) {
            // GetComponent seems to have issues with 'not exist' assertions
            cy.get('.moonstone-tablePagination').should('not.exist');
        } else {
            getComponent(Pagination, null, el => expect(el).to.be.visible)
                .getTotalRows()
                .should('eq', expectedTotalCount);
        }

        return this;
    }

    verifyResults(results: string[]): BasicSearch {
        this.jcontent.getTable().getRows(rows => {
            expect(rows).to.have.length(results.length);
            for (let i = 0; i < results.length; i++) {
                expect(rows[i]).to.contain(results[i]);
            }
        });
        return this;
    }

    verifyResultType(typeName: string): BasicSearch {
        this.jcontent.getTable().getRows(rows => {
            for (let i = 0; i < rows.length; i++) {
                expect(rows[i]).to.contain(typeName);
            }
        });
        return this;
    }

    selectContentType(contentType: string): BasicSearch {
        getComponentByRole(Dropdown, 'content-type-dropdown').select(contentType);
        return this;
    }

    reset(): BasicSearch {
        return this.searchTerm('').searchInCurrentPath().selectContentType('Any content');
    }
}
