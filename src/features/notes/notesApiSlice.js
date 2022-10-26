import { createSelector, createEntityAdapter } from '@reduxjs/toolkit'

import { apiSlice } from '../../app/api/apiSlice'

const notesAdapter = createEntityAdapter({
    sortComparer: (a, b) =>
        a.completed === b.completed ? 0 : a.completed ? 1 : -1,
})

const initialState = notesAdapter.getInitialState()

export const notesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getNotes: builder.query({
            query: () => '/notes',
            validateStatus: (response, result) => {
                return response.status === 200 && !result.isError
            },
            keepUnusedDataFor: 5,
            transformResponse: (responseData) => {
                const loadedNotes = responseData.map((user) => {
                    user.id = user._id
                    return user
                })
                return notesAdapter.setAll(initialState, loadedNotes)
            },
            providesTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        { type: 'User', id: 'LIST' },
                        ...result.ids.map((id) => ({ type: 'User', id })),
                    ]
                } else return [{ type: 'User', id: 'LIST' }]
            },
        }),
    }),
})

export const { useGetNotesQuery } = notesApiSlice

// returns the query result object
export const selectUserResult = notesApiSlice.endpoints.getnotes.select()

// creates memoized selector
const selectNotesData = createSelector(
    selectUserResult,
    (notesResult) => notesResult.data // normalized state object with ids  & entities
)

// getSelectors creates these selectors and we rename them with aliases using destructing
export const {
    selectAll: selectAllnotes,
    selectById: selectNoteById,
    selectIds: selectNoteIds,
    // Pass in a selector that returns the notes slice of state
} = notesAdapter.getSelectors((state) => selectNotesData(state) ?? initialState)
