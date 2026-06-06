using System;
using Application.Activities.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using Infrastructure.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Persistence;

namespace Application.Activities.Queries;

public class GetActivityList
{
    // now the way we structure mediator queries is that we need a class inside our class
    // the IRequest and IRequestHandler are provided by MediatR package
    // the api expecting a list of activities
    public class Query : IRequest<List<ActivityDto>>
    {
        // here we write the params
    }

    // here we injected our AppDbContext into this
    public class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor//, ILogger<GetActivityList> logger
    ) : IRequestHandler<Query, List<ActivityDto>>
    {
        // after implementing the interface we gonna make it an async task
        public async Task<List<ActivityDto>> Handle(Query request, CancellationToken cancellationToken)
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
            return await context.Activities
                .ProjectTo<ActivityDto>(mapper.ConfigurationProvider, new {currentUserId = userAccessor.GetUserId()})
                .ToListAsync(cancellationToken);
        }
    }
}
