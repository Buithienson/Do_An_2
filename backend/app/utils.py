from passlib.context import CryptContext

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password using bcrypt (truncate to 72 bytes — bcrypt limit)"""
    return pwd_context.hash(password.encode("utf-8")[:72])


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return pwd_context.verify(plain_password.encode("utf-8")[:72], hashed_password)
