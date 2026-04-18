using System;
using Domain;
using MediatR;
using Persistence;

namespace Application.Activities.Commands;

// typically and in theoritcal case we don't return anything but the IRequest here returns string because
// but in this command in this pattern we are allowed only in this case to return thing from the command
public class CreateActivity
{
    public class Command : IRequest<string>
    {
        public required Activity Activity { get; set; }
    }

    public class Handler(AppDbContext context) : IRequestHandler<Command, string>
    {
        public async Task<string> Handle(Command request, CancellationToken cancellationToken)
        {
            // logic
            // why not using the AddAsync? because
            // Begins tracking the given entity, and any other reachable entities that are not already being tracked, 
            // in the Microsoft.EntityFrameworkCore.EntityState.Added state such that they will be inserted into the 
            // database when Microsoft.EntityFrameworkCore.DbContext.SaveChanges() is called.
            //This method is async only to allow special value generators, such as the one used by 
            // Microsoft.EntityFrameworkCore.Metadata.SqlServerValueGenerationStrategy.SequenceHiLo', 
            // to access the database asynchronously. For all other cases the non async method should be used.
            context.Activities.Add(request.Activity);

            await context.SaveChangesAsync(cancellationToken);

            return request.Activity.Id;
        }
    }
}
