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

public class GetActivityList
{
    // now the way we structure mediator queries is that we need a class inside our class
    // the IRequest and IRequestHandler are provided by MediatR package
    // the api expecting a list of activities
    public class Query : IRequest<Result<PagedList<ActivityDto, DateTime?>>>
    {
        public required ActivityParams Params { get; set; }
    }

    // here we injected our AppDbContext into this
    public class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor//, ILogger<GetActivityList> logger
    ) : IRequestHandler<Query, Result<PagedList<ActivityDto, DateTime?>>>
    {
        // after implementing the interface we gonna make it an async task
        public async Task<Result<PagedList<ActivityDto, DateTime?>>> Handle(Query request, CancellationToken cancellationToken)
        {
            // try
            // {
            //     for (int i = 0; i < 10; i++)
            //     {
            //         cancellationToken.ThrowIfCancellationRequested(); // so we gonna throw error if cancellation is requested

            //         await Task.Delay(1000, cancellationToken); 
            //         logger.LogInformation($"Task {i} has completed");
            //     }
            // }
            // catch (System.Exception)
            // {
            //     // we cann inject loger in our handler class of the type of the thing we are logging which is in this case GetActivityList
            //     logger.LogInformation("task of getting activity list was cancelled");
            //     throw;
            // }

            // Forward the 'cancellationToken' parameter to the 'ToListAsync' method 
            // or pass in 'CancellationToken.None' explicitly to indicate intentionally 
            // not propagating the tokenCA2016

            var query = context.Activities
                .OrderBy(x => x.Date)
                // to make it more efficient we will add an index in the db on this column
                .Where(x => x.Date >= (request.Params.Cursor ?? request.Params.StartDate))
                .AsQueryable();

            if(!string.IsNullOrEmpty(request.Params.Filter))
            {
                // this is called switch expression
                query = request.Params.Filter switch
                {
                    "isGoing" => query.Where(x => x.Attendees.Any(a => a.UserId == userAccessor.GetUserId())),
                    "isHost" => query.Where(x => x.Attendees.Any(a => a.IsHost && a.UserId == userAccessor.GetUserId())),
                    _ => query // the default
                };
            }

            // we should deal with projection after the where queries so we don't ask for data that is more than we need
            // as this way it will get the full activities

            var projectedActivites = query
                .ProjectTo<ActivityDto>(mapper.ConfigurationProvider, new {currentUserId = userAccessor.GetUserId()});

            var activities = await projectedActivites
                .Take(request.Params.PageSize + 1) //  the + 1 is to check if there is a next page and send it to the user so he sends it back when wants the next patch
                .ToListAsync(cancellationToken);

            DateTime? nextCursor = null;
            // so we know that we got more pages therefore we can set the next cursor
            if(activities.Count > request.Params.PageSize)
            {
                nextCursor = activities.Last().Date;
                activities.RemoveAt(activities.Count - 1);
            }

            return Result<PagedList<ActivityDto, DateTime?>>.Success(
                new PagedList<ActivityDto, DateTime?>
                {
                    Items = activities,
                    NextCursor = nextCursor
                }
            );
        }
    }
}
