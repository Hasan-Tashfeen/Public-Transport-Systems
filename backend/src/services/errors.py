"""Domain exceptions raised by services and translated by API endpoints."""


class NotFoundError(Exception):
    """A referenced entity does not exist."""


class ValidationError(Exception):
    """Input failed a business rule."""
