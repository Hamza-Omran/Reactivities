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
    }).refine((date) => date > new Date(), {
        message: 'Date must be in the future'
    }),
    location: z.object({
        venue: requiredString('Venue'),
        city: z.string().optional(),
        latitude: z.coerce.number(),
        longitude: z.coerce.number()
    })
})

// export type ActivitySchema = z.infer<typeof activitySchema>
export type ActivityFormValues = z.input<typeof activitySchema>;
export type ActivitySchema = z.output<typeof activitySchema>;

// // Because you're using:

// date: z.coerce.date()
// latitude: z.coerce.number()
// longitude: z.coerce.number()

// Zod creates different input and output types:

// // Input
// {
//   date: unknown;
//   latitude: unknown;
//   longitude: unknown;
// }

// // Output
// {
//   date: Date;
//   latitude: number;
//   longitude: number;
// }

// But you are doing:

// export type ActivitySchema = z.infer<typeof activitySchema>

// which is equivalent to:

// type ActivitySchema = z.output<typeof activitySchema>

// while useForm() expects the input type.