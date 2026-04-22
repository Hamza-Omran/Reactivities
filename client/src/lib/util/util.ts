import { format, type DateArg } from "date-fns";

//  date arg will accept any type of a date even if a string or js object
export function formatDate(date: DateArg<Date>) {
    return format(date, 'dd MMM yyyy h:mm a')
}