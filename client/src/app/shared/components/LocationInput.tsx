import { useEffect, useMemo, useState } from "react";
import { useController, type FieldValues, type UseControllerProps } from "react-hook-form"
import type { LocationIQSuggestion } from "../../../lib/types";
import { Box,debounce,List,ListItemButton,TextField, Typography } from "@mui/material";
import axios from "axios";


type Props<T extends FieldValues> = {label: string} & UseControllerProps<T> 

export default function LocationInput<T extends FieldValues>(props: Props<T>) {

    const {field, fieldState} = useController({...props});
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<LocationIQSuggestion[]>([]);
    const [inputValue, setInputValue] = useState(field.value || '');

    // is to have a side effect when the component loads
    useEffect(() => {
        // in case of edit mode
        if(field.value && typeof field.value === 'object') {
            setInputValue(field.value.venue || '')
        } else {
            setInputValue(field.value || '')
        }
    }, [field.value])

    // dedupe is to not have duplicatoin suggestions form the api and we will add & to add the query
    const locationUrl = 'your url!'
    // will only recompute the memorized value when one of the deps has changed
    // now this is going to be a function and function when our components are rerendered are executed again so this way it will not be executed again
    // now we should have used useCallback as our deps are not going to be changed by any way however it doesn't accepts a function as its parameter
    // and we could go around that with useCallback however the easiest way to go around this is to useMemo
    const fetchSuggestions = useMemo(
        () => debounce(async (query: string) => {
            if(!query || query.length < 3){
                setSuggestions([])
                return;
            }

            setLoading(true);

            try {
                // now we will use axios as our agent is setted by default to backend api
                const res = await axios.get<LocationIQSuggestion[]>(`${locationUrl}q=${query}`);
                setSuggestions(res.data)
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false);
            }
        }, 500), [locationUrl]
    )

    const handleChange = async (value : string) => {
        field.onChange(value);
        await fetchSuggestions(value)
    }

    const handleSelect = (location: LocationIQSuggestion) => {
        const city = location.address?.city || location.address?.town || location.address?.village;
        const venue = location.display_name;
        const latitude = location.lat;
        const longitude = location.lon;

        setInputValue(venue);
        field.onChange({city, venue, latitude, longitude});
        setSuggestions([]);
    }

    return (
        <Box>
            <TextField
                {...props}
                value={inputValue}
                onChange={(e) => handleChange(e.target.value)}
                fullWidth
                variant="outlined"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
            />
            {loading && <Typography>Loading...</Typography>}
            {suggestions.length > 0 && (
                <List sx={{border: 1}}>
                    {suggestions.map(suggestion => (
                        <ListItemButton divider key={suggestion.place_id} onClick={() => handleSelect(suggestion)}>
                            {suggestion.display_name}
                        </ListItemButton>
                    ))}
                </List>
            )}
        </Box>
    )
}