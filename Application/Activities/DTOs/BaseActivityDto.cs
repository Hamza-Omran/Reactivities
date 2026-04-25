using System;

namespace Application.Activities.DTOs;

public class BaseActivityDto
{
// we will keep the assignments so the warning of possibly being null is going 
    // and we shouldn't really care for that as our validator gonna check for it

    // // now our api controller is trying to create an object based on the json it is receivng and because of hte required keyword 
    // // it can't
    // // this way is called data annotation
    // [Required]
    public string Title { get; set; } = "";

    public DateTime Date { get; set; }
     
    // [Required] // this is for runtime validation while the other when we write required in the same line it is for compile time enforcement => so the compiler require the value to be set when instantiating the object
    public string Description { get; set; } = string.Empty;

    public string Category { get; set; } = "";
    
    // locations props
    public string City { get; set; } = "";

    public string Venue { get; set; } = "";

    public double Latitude { get; set; }

    public double Longitude { get; set; }
}