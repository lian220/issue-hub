package com.issuehub.domain.exception

sealed class DomainException(message: String) : RuntimeException(message) {
    class EntityNotFound(entity: String, id: Any) :
        DomainException("$entity not found: $id")

    class BusinessRuleViolation(rule: String) :
        DomainException("Business rule violated: $rule")

    class ValidationFailed(field: String, reason: String) :
        DomainException("Validation failed for $field: $reason")
}
