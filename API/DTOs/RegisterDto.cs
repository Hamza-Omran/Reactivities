using System;
using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class RegisterDto
{
    [Required]
    public string DisplayName { get; set; } = ""; // we set a default value because we want the validation error message to be standard without the json serialization kind of error

    [Required]
    [EmailAddress]
    public string Email { get; set; } = "";

    // for this the identity entity framework will force the validation for required and the strong password
    public string Password { get; set; } = null!;
}
