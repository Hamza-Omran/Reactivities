using System;
using Application.Activities.DTOs;
using Application.Core;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using Infrastructure.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities.Queries;

public class GetActivityDetails
{
    public class Query : IRequest<Result<ActivityDto>>
    {
        public required string Id { get; set; }
    }

    public class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor) : IRequestHandler<Query, Result<ActivityDto>>
    {
        // it is async as we calling the db
        public async Task<Result<ActivityDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            // when u see any 3 dots (recommendation) or any warning then hover on it 
            // and understand the function and what it takes actually 
            var activity = await context.Activities
                // we get this from automapper which is a project to queryable extension and now it gets only the sepcific 
                // properties we are going to use
                .ProjectTo<ActivityDto>(mapper.ConfigurationProvider, new {currentUserId = userAccessor.GetUserId()})
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            // now we can't return not found since we don't have access to https responses, so we gonna use the mediator
            // for the short term we gonna threw a new exception
            if(activity == null) return Result<ActivityDto>.Failure("Activity not found", 404);

            return Result<ActivityDto>.Success(activity);
        }
    }
}
