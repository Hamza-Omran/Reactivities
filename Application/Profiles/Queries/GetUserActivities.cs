using System;
using Application.Core;
using Application.Profiles.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Infrastructure.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Profiles.Queries;

public class GetUserActivities
{
    public class Query : IRequest<Result<List<UserActivityDto>>>
    {
        public required string UserId { get; set; }
        public required string Filter { get; set; } // hosting, past, future
    }

    public class Handler(AppDbContext context, IMapper mapper)
        : IRequestHandler<Query, Result<List<UserActivityDto>>>
    {
        public async Task<Result<List<UserActivityDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var userActivities = context.ActivityAttendees
                .Where(x => x.UserId == request.UserId)
                .OrderBy(a => a.Activity.Date)
                .Select(x => x.Activity)
                .AsQueryable();

            if(!string.IsNullOrEmpty(request.Filter))
            {
                var today = DateTime.UtcNow;
                
// Start from ActivityAttendees so we're only querying
// activities that belong to the specified user.
                userActivities = request.Filter switch
                {
                    "past" => userActivities.Where(a => a.Date < today && a.Attendees.Any(x => x.UserId == request.UserId)),
                    "hosting" => userActivities.Where(x => x.Attendees.Any(x => x.UserId == request.UserId && x.IsHost)),
                    _ => userActivities.Where(a => a.Date >= today && a.Attendees.Any(x => x.UserId == request.UserId))
                };
            }

            var projectedActivities = await userActivities
                .ProjectTo<UserActivityDto>(mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

            return Result<List<UserActivityDto>>.Success(projectedActivities);
        }
    }
}
