package org.moserp.common.json_schema.factories;

import org.moserp.common.json_schema.PropertyFactoryContext;
import org.moserp.common.json_schema.domain.EntityProperty;
import org.moserp.common.json_schema.domain.EntityPropertyType;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Component
public class DateJsonSchemaPropertyFactory extends BasicPropertyFactory {

    private static List<String> DATE_PACKAGES = Arrays.asList("java.time", "org.threeten.bp", "org.joda.time");

    @Override
    public boolean appliesTo(PropertyFactoryContext context) {
        return calculatePropertyType(context) != null;
    }

    @Override
    public EntityProperty create(PropertyFactoryContext context) {
        EntityProperty property = createPropertyWithBasicValues(context);
        property.setType(calculatePropertyType(context));
        property.setFormat(calculateFormat(context));
        return property;
    }

    private String calculateFormat(PropertyFactoryContext context) {
        Class<?> rawType = context.getDefinition().getAccessor().getRawType();
        if(Instant.class.equals(rawType)) {
            return "date-time";
        }
        if(LocalDate.class.equals(rawType)) {
            return "date";
        }
        return null;
    }

    private String calculatePropertyType(PropertyFactoryContext context) {
        Class<?> rawType = context.getDefinition().getAccessor().getRawType();
        for (String datePackage : DATE_PACKAGES) {
            if (rawType.getName().startsWith(datePackage)) {
                return EntityPropertyType.STRING;
            }
        }
        return null;
    }
}
