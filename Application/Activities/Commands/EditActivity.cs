using System;
using AutoMapper;
using Domain;
using MediatR;
using Persistence;

namespace Application.Activities.Commands;

public class EditActivity
{
    public class Command : IRequest
    {
        public required Activity Activity { get; set; }
    }

    // as we are injecting IMapper into our handler we need to add it as a servi
    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Command>
    {
        public async Task Handle(Command request, CancellationToken cancellationToken)
        {
            var activity = await context.Activities.FindAsync([request.Activity.Id], cancellationToken) 
            ?? throw new Exception("Cannot Find Activity"); // this is called coalesce and this is instead of if(x == null)

            mapper.Map(request.Activity, activity);
            
            await context.SaveChangesAsync(cancellationToken);
        }
    }
}
