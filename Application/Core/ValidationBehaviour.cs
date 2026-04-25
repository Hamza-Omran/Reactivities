using System;
using FluentValidation;
using MediatR;

namespace Application.Core;

// this is going to be as a middle ware so we don't need to inject IValidator inside create activity or any handler
// as we already in the program.cs have made the services  being fetched from the assembly so they gonna be registered automatically
// as we did before we passed for hte IValidator the TRequest which is the Command so we gonna pass the TRequest as this gonna change
public class ValidationBehaviour<TRequest, TResponse>(IValidator<TRequest>? validator = null)
    : IPipelineBehavior<TRequest, TResponse> where TRequest : notnull
{
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        if(validator == null) return await next(); // this next is going to return it to the next piece of middleware in the mediator pipeline 

        var validationResult = await validator.ValidateAsync(request, cancellationToken);

        if(!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        return await next();
    }
}
