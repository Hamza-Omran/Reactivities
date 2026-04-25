using System;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Application.Core;


namespace Application.Activities.Commands;

public class DeleteActivity
{
    // we make unit to say it is of the type void as we won't return anything and just pass the result object
    public class Command : IRequest<Result<Unit>>
    {
        public required string Id { get; set; }
    }
    public class Handler(AppDbContext context) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var activity = await context.Activities.FindAsync([request.Id], cancellationToken);

            if(activity == null) return Result<Unit>.Failure("Activity not found.", 404);

            context.Remove(activity); // this is just tracking in memory and nothing happens in the db so we need to save

            var result = await context.SaveChangesAsync(cancellationToken) > 0;

            if(!result) return Result<Unit>.Failure("Failed to delete the activity.", 400);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}

