package org.jahia.modules.textfieldinitializer;

import org.jahia.services.content.decorator.validation.JCRNodeValidatorDefinition;
import org.osgi.service.component.annotations.Component;

import java.util.Map;

@Component(service = JCRNodeValidatorDefinition.class)
public class CustomValidators extends JCRNodeValidatorDefinition {

    @Override
    public Map<String, Class> getValidators() {
        Map<String, Class> nodeTypeValidatorMap = new java.util.HashMap<>();
        nodeTypeValidatorMap.put("cent:textFieldInitializer", TestNodeValidator.class);
        nodeTypeValidatorMap.put("jnt:file", UploadErrorValidator.class);
        return nodeTypeValidatorMap;
    }
}
