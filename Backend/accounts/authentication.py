"""
Custom JWT authentication backend that reads the access token
from an HttpOnly cookie instead of the Authorization header.
"""
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework.exceptions import AuthenticationFailed


class CookieJWTAuthentication(JWTAuthentication):
    """
    Extends SimpleJWT's default authenticator to pull the access token
    from the `access_token` HttpOnly cookie rather than the
    `Authorization: Bearer <token>` header.
    """

    ACCESS_COOKIE = "access_token"

    def authenticate(self, request):
        raw_token = request.COOKIES.get(self.ACCESS_COOKIE)
        if raw_token is None:
            return None                        # No cookie → let DRF return 401 naturally

        try:
            validated_token = self.get_validated_token(raw_token)
        except (InvalidToken, TokenError) as exc:
            raise AuthenticationFailed(str(exc))

        return self.get_user(validated_token), validated_token