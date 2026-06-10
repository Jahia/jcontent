package org.jahia.modules.textfieldinitializer;

import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.decorator.validation.JCRNodeValidator;

import javax.validation.constraints.NotEmpty;

/**
 * Validator for cent:noDefaultValidator. Validates a property that has no default value, using a
 * custom validation message (regression test for jcontent#2374).
 */
public class NoDefaultValidator implements JCRNodeValidator {

    private JCRNodeWrapper node;

    public NoDefaultValidator(JCRNodeWrapper node) {
        this.node = node;
    }

    @NotEmpty(message = "noDefaultString must not be empty")
    public String getNoDefaultString() {
        return node.getPropertyAsString("noDefaultString");
    }

}
