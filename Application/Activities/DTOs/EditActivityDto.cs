using System;

namespace Application.Activities.DTOs;

public class EditActivityDto : BaseActivityDto
{
    public string Id { get; set; } = ""; // this can be an empty string as we gonna validate it so we will catch this validation
}
