package org.jahia.modules.textfieldinitializer;

import org.hibernate.validator.constraints.Length;
import org.hibernate.validator.constraints.NotEmpty;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.decorator.validation.JCRNodeValidator;

public class TestNodeValidator implements JCRNodeValidator {

    private JCRNodeWrapper node;

    public TestNodeValidator(JCRNodeWrapper node) {
        this.node = node;
    }

    @NotEmpty
    public String getDefaultString() {
        return node.getPropertyAsString("defaultString");
    }

    @Length(min = 3)
    public String getDefaultI18nString() {
        return node.getPropertyAsString("defaultI18nString");
    }

}
