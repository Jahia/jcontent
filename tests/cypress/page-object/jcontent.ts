import {
  Accordion,
  BasePage,
  Button,
  Dropdown,
  MUIInput,
  MUIRadio,
  Pagination,
  SecondaryNav,
  Table,
} from "@jahia/cypress";

export class JContent extends BasePage {
    secondaryNav: SecondaryNav;
    accordion: Accordion;

    constructor() {
        super();
        this.secondaryNav = SecondaryNav.get();
        this.accordion = Accordion.get(this.secondaryNav);
    }

    static visit(site: string, language: string, path: string): JContent {
        cy.visit(`/jahia/jcontent/${site}/${language}/${path}`);
        return new JContent();
    }

    getTable(): Table {
        return Table.get(null, (el) => expect(el).to.be.visible);
    }

    getBasicSearch(): BasicSearch {
        return new BasicSearch(this);
    }

    select(accordion: string): void {
        this.accordion.click(accordion);
    }
}

export class BasicSearch extends BasePage {
    jcontent: JContent;
    open: boolean;

    constructor(jcontent: JContent) {
        super();
        this.jcontent = jcontent;
        this.open = true;
    }

    openSearch(): BasicSearch {
        Button.getByRole("open-search-dialog").click();
        this.open = true;
        return this;
    }

    editQuery(): BasicSearch {
        Button.getByRole("search").click();
        this.open = true;
        return this;
    }

    searchTerm(value: string): BasicSearch {
        MUIInput.getByRole("search-input-terms").clear().type(value);
        return this;
    }

    searchInWholeSite(): BasicSearch {
        MUIRadio.getByRole("search-whole-website").click();
        return this;
    }

    searchInCurrentPath(): BasicSearch {
        MUIRadio.getByRole("search-current-path").click();
        return this;
    }

    executeSearch(): BasicSearch {
        Button.getByRole("search-submit").click();
        this.open = false;
        // Wait for result
        this.jcontent.getTable().getRows((el) => expect(el).to.be.visible);
        return this;
    }

    verifyTotalCount(expectedTotalCount: number): BasicSearch {
        if (expectedTotalCount === 0) {
            Pagination.get(null, (el) => expect(el).to.not.exist);
        } else {
            Pagination.get(null, (el) => expect(el).to.be.visible)
                .getTotalRows()
                .should("eq", expectedTotalCount);
        }
        return this;
    }

    verifyResults(results: string[]): BasicSearch {
        this.jcontent.getTable().getRows((rows) => {
            expect(rows).to.have.length(results.length);
            for (let i = 0; i < results.length; i++) {
                expect(rows[i]).to.contain(results[i]);
            }
        });
        return this;
    }

    verifyResultType(typeName: string): BasicSearch {
        this.jcontent.getTable().getRows((rows) => {
            for (let i = 0; i < rows.length; i++) {
                expect(rows[i]).to.contain(typeName);
            }
        });
        return this;
    }

    selectContentType(contentType: string): BasicSearch {
        Dropdown.getByRole("content-type-dropdown").select(contentType);
        return this;
    }
}
