import z from "zod";
import { requiredString } from "../util/util";

export const activitySchema = z.object({
    // the min is to make it required
    title: requiredString('Title'),
    description: requiredString('Description'),
    category: requiredString('Category'),
    // the coerce function changes the date format from string to a date
    date: z.coerce.date({
        'message': 'Date is required'
    }),
    location: z.object({
        venue: requiredString('Venue'),
        city: z.string().optional(),
        latitude: z.coerce.number(),
        longitude: z.coerce.number()
    })
})

export type ActivitySchema = z.infer<typeof activitySchema>