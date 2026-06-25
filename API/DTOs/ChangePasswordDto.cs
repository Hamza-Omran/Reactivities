using System;
using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class ChangePasswordDto
{
    // we used the required annotations here since we are not in the mediator so we can use them
    [Required]
    public string CurrentPassword { get; set; } = "";
    [Required]
    public string NewPassword { get; set; } = "";
}
