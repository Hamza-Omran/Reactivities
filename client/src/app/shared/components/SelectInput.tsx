import { FormControl, FormHelperText, InputLabel, MenuItem, Select, type SelectProps } from "@mui/material";
import { useController, type FieldValues, type UseControllerProps } from "react-hook-form"

// here we are extending these props to our props
type Props<T extends FieldValues> = {
    items: {text: string, value: string}[],
    label: string
} & UseControllerProps<T> & SelectProps // this is for properities we wrote in the single input

// Partial<SelectProps> so this gonna make it optional even if its fields are required

export default function SelectInput<T extends FieldValues>(props: Props<T>) {

    const {field, fieldState} = useController({...props});

    return (
        <FormControl fullWidth error={!!fieldState.error}>
            <InputLabel>{props.label}</InputLabel>
            <Select value={field.value || ""} label={props.label} onChange={field.onChange}>
                {props.items.map(item => (
                    <MenuItem key={item.value} value={item.value}>
                        {item.text}
                    </MenuItem>
                ))}
            </Select>
            <FormHelperText>{fieldState.error?.message}</FormHelperText>
        </FormControl>
    )
}