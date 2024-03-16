import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  tagTypes: ["test"],
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:8001/api/test" }),
  endpoints: (builder) => ({
    fetchData: builder.query({
      query: () => "/show",
      providesTags: (result) =>
        result
          ? [...result.test.map(({ id }) => ({ type: "test", id })), "test"]
          : ["test"],
    }),
    addData: builder.mutation({
      query: (userData) => ({
        url: "/add",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: (arg) => [{ type: "test", id: arg.id }],
    }),
    delData: builder.mutation({
      query: (id) => ({
        url: `/delete/${id}`,
        method: "GET",
      }),
      invalidatesTags: (arg) => [{ type: "test", id: arg.id }],
    }),
  }),
});

export const { useFetchDataQuery, useAddDataMutation, useDelDataMutation } =
  api;
