from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.tokens import RefreshToken

from .Serializers import RegisterSerializer, UserSerializer

User = get_user_model()

# ── Cookie helpers ─────────────────────────────────────────────────────────────
ACCESS_COOKIE = "access_token"
REFRESH_COOKIE = "refresh_token"

COOKIE_DEFAULTS = dict(
    httponly=True,
    secure=settings.COOKIE_SECURE,   # True in production (HTTPS)
    samesite="Lax",
    path="/",
)


def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie(
        ACCESS_COOKIE,
        str(access_token),
        max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()),
        **COOKIE_DEFAULTS,
    )
    response.set_cookie(
        REFRESH_COOKIE,
        str(refresh_token),
        max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
        **COOKIE_DEFAULTS,
    )


def delete_auth_cookies(response: Response):
    response.delete_cookie(ACCESS_COOKIE, path="/")
    response.delete_cookie(REFRESH_COOKIE, path="/")


# ── Views ──────────────────────────────────────────────────────────────────────

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        response = Response(
            {"user": UserSerializer(user).data, "message": "Account created successfully."},
            status=status.HTTP_201_CREATED,
        )
        set_auth_cookies(response, refresh.access_token, refresh)
        return response


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        password = request.data.get("password", "")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.check_password(password):
            return Response(
                {"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {"detail": "Account is disabled."}, status=status.HTTP_403_FORBIDDEN
            )

        refresh = RefreshToken.for_user(user)
        # Embed role in the token payload for quick client-side reads
        refresh["role"] = user.role
        refresh.access_token["role"] = user.role

        response = Response(
            {"user": UserSerializer(user).data, "message": "Login successful."},
            status=status.HTTP_200_OK,
        )
        set_auth_cookies(response, refresh.access_token, refresh)
        return response


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.COOKIES.get(REFRESH_COOKIE)
        response = Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)

        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()           # requires ROTATE_REFRESH_TOKENS + blacklist app
            except (TokenError, InvalidToken):
                pass                        # already invalid — still clear cookies

        delete_auth_cookies(response)
        return response


class RefreshTokenView(APIView):
    """Silent token refresh — called automatically by the frontend."""
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get(REFRESH_COOKIE)
        if not refresh_token:
            return Response({"detail": "No refresh token."}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            refresh = RefreshToken(refresh_token)
            access_token = refresh.access_token
        except (TokenError, InvalidToken):
            response = Response(
                {"detail": "Refresh token expired or invalid."}, status=status.HTTP_401_UNAUTHORIZED
            )
            delete_auth_cookies(response)
            return response

        response = Response({"message": "Token refreshed."}, status=status.HTTP_200_OK)
        response.set_cookie(
            ACCESS_COOKIE,
            str(access_token),
            max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()),
            **COOKIE_DEFAULTS,
        )
        return response


class MeView(APIView):
    """Return the currently authenticated user's profile."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)