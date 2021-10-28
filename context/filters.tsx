import {createContext} from "react";

export const FiltersContext = createContext<any>({
    search: '',
    attribute: '',
    category: '',
    page: 0
});