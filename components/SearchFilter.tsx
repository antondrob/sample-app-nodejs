import {useState} from "react";
import {Button, Input} from "@bigcommerce/big-design";

const SearchFilter = ({}) => {
    const [value, setValue] = useState('');

    const handleChange = (event) => setValue(event.target.value);
    const search

    return (
        <>
            <Input
                label="Search products"
                type="text"
                value={value}
                onChange={handleChange}
                required
            />
            <Button onClick={ () => {

            }}>Search</Button>
        </>
    )
}

export default SearchFilter;