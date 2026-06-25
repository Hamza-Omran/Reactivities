import { TextField, type TextFieldProps } from "@mui/material";
import { useController, useFormContext, type FieldValues, type UseControllerProps } from "react-hook-form"

// here we are extending these props to our props
type Props<T extends FieldValues> = {} & UseControllerProps<T> & TextFieldProps // this is for properities we wrote in the single input

export default function TextInput<T extends FieldValues>({control, ...props}: Props<T>) {

    // we did add the control so it catch it from the account form wrapper as it is passed automatically
    const formContext = useFormContext<T>();
    const effectiveControl = control || formContext?.control;

    if(!effectiveControl) throw new Error('Text input must be used within a form provider or passed as props')

    const {field, fieldState} = useController({...props, control: effectiveControl});

    return (
        // without this value={field.value || ''} it will show in the client console changing from uncontrolled input to controlled input
        <TextField {...props} {...field} value={field.value || ''} fullWidth variant="outlined" error={!!fieldState.error} helperText={fieldState.error?.message}/>
    )
}