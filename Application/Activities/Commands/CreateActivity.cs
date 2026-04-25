using System;
using Application.Activities.DTOs;
using AutoMapper;
using Domain;
using FluentValidation;
using MediatR;
using Persistence;
using Application.Core;

namespace Application.Activities.Commands;

// typically and in theoritcal case we don't return anything but the IRequest here returns string because
// but in this command in this pattern we are allowed only in this case to return thing from the command
public class CreateActivity
{
    public class Command : IRequest<Result<String>>
    {
        public required CreateActivityDto ActivityDto { get; set; }
    }

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Command, Result<string>>
    {
        public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
        {

            var Activity = mapper.Map<Activity>(request.ActivityDto); // now the mapper will throw exception but we will handle this later

            // logic
            // why not using the AddAsync? because
            // Begins tracking the given entity, and any other reachable entities that are not already being tracked, 
            // in the Microsoft.EntityFrameworkCore.EntityState.Added state such that they will be inserted into the 
            // database when Microsoft.EntityFrameworkCore.DbContext.SaveChanges() is called.
            //This method is async only to allow special value generators, such as the one used by 
            // Microsoft.EntityFrameworkCore.Metadata.SqlServerValueGenerationStrategy.SequenceHiLo', 
            // to access the database asynchronously. For all other cases the non async method should be used.
            context.Activities.Add(Activity);

            var result = await context.SaveChangesAsync(cancellationToken) > 0;

            if(!result) return Result<string>.Failure("Failed to create the activity.", 400);

            return Result<string>.Success(Activity.Id);
        }
    }
}
