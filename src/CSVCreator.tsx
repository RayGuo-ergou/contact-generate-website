import React, { useReducer } from 'react';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

type StateType = {
    type: 'email' | 'sms';
    contactCount: number;
    invalidCount: number;
    firstName: string;
    lastName: string;
    baseEmail: string;
    tag: string; // new field
    tagAssignment: 'all' | 'random'; // new field
};

type ActionType = {
    type: 'setField';
    field: string;
    value: string | number;
};

const initialState: StateType = {
    type: 'email',
    contactCount: 1,
    invalidCount: 0,
    firstName: 'John',
    lastName: 'Doe',
    baseEmail: 'John',
    tag: '', // initial value for tag
    tagAssignment: 'all', // default to assign to all
};

function reducer(state: StateType, action: ActionType): StateType {
    switch (action.type) {
        case 'setField':
            return { ...state, [action.field]: action.value };
        default:
            throw new Error();
    }
}

function CSVCreator() {
    const [state, dispatch] = useReducer(reducer, initialState);

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        if (event.target.type === 'number') {
            dispatch({
                type: 'setField',
                field: event.target.name,
                value: parseInt(event.target.value, 10),
            });
            return;
        }

        dispatch({
            type: 'setField',
            field: event.target.name,
            value: event.target.value,
        });
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const data = Array.from(
            { length: state.contactCount + state.invalidCount },
            (_, i) => {
                if (i < state.contactCount) {
                    const row = {
                        [state.type === 'email' ? 'email' : 'phone']:
                            state.type === 'email'
                                ? `${state.baseEmail}${i + 1}@example.com`
                                : `+6141${Math.floor(
                                      1000000 + Math.random() * 9000000,
                                  )}`,
                        firstname: `${state.firstName}${i + 1}`,
                        lastname: state.lastName,
                    };

                    if (
                        state.tag &&
                        state.tagAssignment === 'all' // 50% chance to assign
                    ) {
                        const tags = state.tag.split(';');
                        const uniqueTags = new Set(tags);
                        tags.length = 0;
                        uniqueTags.forEach((tag) => {
                            if (tag) {
                                tags.push(tag);
                            }
                        });
                        row['tag'] = tags.join(';');
                    }
                    if (
                        state.tag &&
                        state.tagAssignment === 'random' &&
                        Math.random() > 0.5
                    ) {
                        const tags = state.tag.split(';');
                        const tagsToBeAssigned = tags.map((tag) => {
                            if (Math.random() > 0.5) {
                                return tag;
                            }
                        });

                        // remove duplicates and empty values
                        const uniqueTags = new Set(tagsToBeAssigned);
                        tagsToBeAssigned.length = 0;
                        uniqueTags.forEach((tag) => {
                            if (tag) {
                                tagsToBeAssigned.push(tag);
                            }
                        });
                        row['tag'] = tagsToBeAssigned.join(';');
                    }

                    if (!row['tag']) {
                        row['tag'] = '';
                    }
                    return row;
                }
                return {
                    [state.type === 'email' ? 'email' : 'phone']:
                        state.type === 'email'
                            ? `${state.baseEmail}${i + 1}`
                            : `+614${Math.floor(1000 + Math.random() * 9000)}`,
                    firstname: `${state.firstName}${i + 1}`,
                    lastname: state.lastName,
                    tag: state.tag,
                };
            },
        );

        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, 'contacts.csv');
    };

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            <h6 className="text-lg text-gray-900 dark:text-white text-center">
                Generate the contact to import.
            </h6>
            <div className="grid gap-6 mb-6 md:grid-cols-2">
                <div className="flex flex-col">
                    <label
                        htmlFor="type"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                        Contact Type:
                        <select
                            id="type"
                            name="type"
                            onChange={handleChange}
                            value={state.type}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            required
                        >
                            <option value="email">Email</option>
                            <option value="sms">SMS</option>
                        </select>
                    </label>
                </div>
                <div>
                    <label
                        htmlFor="contactCount"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                        Number of Contacts:
                        <input
                            type="number"
                            id="contactCount"
                            name="contactCount"
                            onChange={handleChange}
                            value={state.contactCount}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            required
                        />
                    </label>
                </div>
                <div>
                    <label
                        htmlFor="invalidCount"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                        Number of Invalid Contacts:
                        <input
                            type="number"
                            id="invalidCount"
                            name="invalidCount"
                            onChange={handleChange}
                            value={state.invalidCount}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            required
                        />
                    </label>
                </div>
                <div>
                    <label
                        htmlFor="firstName"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                        First Name:
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            onChange={handleChange}
                            value={state.firstName}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            required
                        />
                    </label>
                </div>
                <div>
                    <label
                        htmlFor="lastName"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                        Last Name:
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            onChange={handleChange}
                            value={state.lastName}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            required
                        />
                    </label>
                </div>
                {state.type === 'email' && (
                    <div>
                        <label
                            htmlFor="baseEmail"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                            Base Email:
                            <br />
                            <input
                                type="text"
                                id="baseEmail"
                                name="baseEmail"
                                onChange={handleChange}
                                value={state.baseEmail}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                required
                            />
                        </label>
                    </div>
                )}

                <div>
                    <label
                        htmlFor="tag"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                        Tag:
                        <input
                            type="text"
                            id="tag"
                            name="tag"
                            onChange={handleChange}
                            value={state.tag}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                    </label>
                </div>

                <div>
                    <label
                        htmlFor="tagAssignment"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                        Tag Assignment:
                        <select
                            id="tagAssignment"
                            name="tagAssignment"
                            onChange={handleChange}
                            value={state.tagAssignment}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        >
                            <option value="all">Assign to All</option>
                            <option value="random">Randomly Assign</option>
                        </select>
                    </label>
                </div>
                <button
                    type="submit"
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                    Save as CSV
                </button>
            </div>
        </form>
    );
}

export default CSVCreator;
