using System;
using Application.Activities.Commands;
using Application.Activities.DTOs;
using FluentValidation;

namespace Application.Activities.Validators;

public class EditActivityValidator : BaseActivityValidators<EditActivity.Command, EditActivityDto>
{
    // Here's what it does:

// Calls the parent constructor (BaseActivityValidators)
// Passes a lambda expression x => x.ActivityDto that tells the parent validator: 
// "Extract the ActivityDto property from the EditActivity.Command object"
// The base class then uses this selector to validate all properties on the DTO (Title, Description, Date, Category, City, 
// Venue, Latitude, Longitude). Instead of validating those properties directly on the command object, it validates them through 
// the selector — so it accesses x.ActivityDto.Title, x.ActivityDto.Description, etc.
     public EditActivityValidator() : base(x => x.ActivityDto)
    {
        RuleFor(x => x.ActivityDto.Id)
            .NotEmpty().WithMessage("Id is required");
    }
}
