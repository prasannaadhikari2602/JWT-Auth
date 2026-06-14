import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ── Base query with cookie forwarding ─────────────────────────────────────────
const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:8000/api/auth",
  credentials: "include", // send & receive HttpOnly cookies on every request
});

/**
 * Wraps the base query to silently refresh the access token on 401 and retry.
 * If the refresh itself fails the user is considered logged out.
 */
async function baseQueryWithReauth(args, api, extraOptions) {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    // Try to get a new access token via the refresh cookie
    const refreshResult = await baseQuery(
      { url: "/token/refresh/", method: "POST" },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      // Retry the original request with the fresh access token cookie
      result = await baseQuery(args, api, extraOptions);
    }
    // If refresh also fails, leave the 401 so callers can handle logout
  }

  return result;
}

// ── API service ────────────────────────────────────────────────────────────────
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Me"],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/login/",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Me"],
    }),

    register: builder.mutation({
      query: (data) => ({
        url: "/register/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Me"],
    }),

    logout: builder.mutation({
      query: () => ({
        url: "/logout/",
        method: "POST",
      }),
      invalidatesTags: ["Me"],
    }),

    getMe: builder.query({
      query: () => "/me/",
      providesTags: ["Me"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetMeQuery,
} = authApi;