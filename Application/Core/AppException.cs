using System;

namespace Application.Core;

// the details is typically  the development as we gonna send the stack trace while in production we won't use it
// so we will use details to send back to the client the stack trace
public class AppException(int statusCode, string message, string? details)
{
    public int StatusCode { get; set; } = statusCode;
    public string Message { get; set; } = message;
    public string? Details { get; set; } = details;
}
