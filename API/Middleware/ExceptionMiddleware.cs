using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using Application.Core;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using ValidationException = FluentValidation.ValidationException;

namespace API.Middleware;

// now the application is still going to return exceptions, but because the API is where our HTTP responses so we gonna make it 
// have the middleware that handles these exceptions

// now we don't need to implement the IMiddleware and it will work but using this gonna not allow us doing mistakes and another thing we will mention

// this is going to be responsible for any http comes in or out
// we don't to do anyting in this course with ILogger so we gonna just use it for the console.writeline however we typically use it so we can in the future replace it with any logger system we want to
public class ExceptionMiddleware(ILogger<ExceptionMiddleware> logger, IHostEnvironment env) : IMiddleware
{
    // http context will give us access to http request and http response
    // and the requestdelegate is the next piece of middleware that we are going to pass our request into
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        try
        {
            await next(context);
        }
        catch (ValidationException ex)
        {
            await HandleValidationException(context, ex);
        }
        catch (Exception ex)
        {
            await HandleException(context, ex);
        }
    }

    private async Task HandleException(HttpContext context, Exception ex)
    {
        logger.LogError(ex, ex.Message);
        
        context.Response.ContentType = "application/json"; // we are going to return the exception in a json format to the client
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;

        var response = env.IsDevelopment()
            ? new AppException(context.Response.StatusCode, ex.Message, ex.StackTrace)
            : new AppException(context.Response.StatusCode, ex.Message, null);

        var options = new JsonSerializerOptions{PropertyNamingPolicy = JsonNamingPolicy.CamelCase}; // now we don't need to specify this property in API controller as it does that by default however here we aren't in an API controller, otherwise it is going to use Pascal Case for the json which is not the correct format we should return json in

        var json = JsonSerializer.Serialize(response, options);
        
        await context.Response.WriteAsync(json);
    }

    private static async Task HandleValidationException(HttpContext context, ValidationException ex)
    {
        var validationErrors = new Dictionary<string, string[]>();

        if(ex.Errors is not null)
        {
            foreach (var error in ex.Errors)
            {
                if(validationErrors.TryGetValue(error.PropertyName, out var exisitingErrors))
                {
                    validationErrors[error.PropertyName] = exisitingErrors.Append(error.ErrorMessage).ToArray();
                }
                else
                {
                    validationErrors[error.PropertyName] = [error.ErrorMessage];
                }
            }
        }

        context.Response.StatusCode = StatusCodes.Status400BadRequest;

        // this is basically what is returned from the framework if we left it handle the validation
        var validationProblemDetails = new ValidationProblemDetails(validationErrors)
        {
            Status = StatusCodes.Status400BadRequest,
            Type = "ValidationFailure",
            Title = "Validation Error",
            Detail = "one or more validation errors has occurred"
        };

        await context.Response.WriteAsJsonAsync(validationProblemDetails);
    }
}
