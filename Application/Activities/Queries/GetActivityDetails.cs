using System;
using Domain;
using MediatR;
using Persistence;

namespace Application.Activities.Queries;

public class GetActivityDetails
{
    public class Query : IRequest<Activity>
    {
        public required string Id { get; set; }
    }

    public class Handler(AppDbContext context) : IRequestHandler<Query, Activity>
    {
        // it is async as we calling the db
        public async Task<Activity> Handle(Query request, CancellationToken cancellationToken)
        {
            // when u see any 3 dots (recommendation) or any warning then hover on it 
            // and understand the function and what it takes actually 
            var activity = await context.Activities.FindAsync([request.Id], cancellationToken);

            // now we can't return not found since we don't have access to https responses, so we gonna use the mediator
            // for the short term we gonna threw a new exception
            if(activity == null) throw new Exception("Activity Not Found!");

            return activity;
        }
    }
}
