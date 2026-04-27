import { DateTimePicker, type DateTimePickerProps } from "@mui/x-date-pickers";
import { useController, type FieldValues, type UseControllerProps } from "react-hook-form"

type Props<T extends FieldValues> = {} & UseControllerProps<T> & DateTimePickerProps 

export default function DateTimeInput<T extends FieldValues>(props: Props<T>) {
    
    const {field, fieldState} = useController({...props});
  
    return (
    <DateTimePicker 
        value={field.value ? new Date(field.value) : null}
        onChange={value => {
            field.onChange(value ? new Date(value) : null)
        }}
        sx={{width: '100%'}}
        slotProps={{
            textField: {
                onBlur: field.onBlur,
                error: !!fieldState.error,
                helperText: fieldState.error?.message
            }}
        }
    />
  )
}