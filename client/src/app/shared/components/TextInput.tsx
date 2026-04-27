import { TextField, type TextFieldProps } from "@mui/material";
import { useController, type FieldValues, type UseControllerProps } from "react-hook-form"

// here we are extending these props to our props
type Props<T extends FieldValues> = {} & UseControllerProps<T> & TextFieldProps // this is for properities we wrote in the single input

export default function TextInput<T extends FieldValues>(props: Props<T>) {

    const {field, fieldState} = useController({...props});

    return (
        // without this value={field.value || ''} it will show in the client console changing from uncontrolled input to controlled input
        <TextField {...props} {...field} value={field.value || ''} fullWidth variant="outlined" error={!!fieldState.error} helperText={fieldState.error?.message}/>
    )
}