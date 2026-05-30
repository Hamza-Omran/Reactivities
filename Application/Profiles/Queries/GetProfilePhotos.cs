using System;
using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Profiles.Queries;

public class GetProfilePhotos
{

    public class Query : IRequest<Result<List<Photo>>>
    {
        // this won't be gotten from our current user as other users can show other users photos and we gonna include the id in the api route
        public required string UserId { get; set; }
    }

    public class Handler(AppDbContext context) : IRequestHandler<Query, Result<List<Photo>>>
    {
        public async Task<Result<List<Photo>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var photos = await context.Users
                .Where(x => x.Id == request.UserId)
                .SelectMany(x => x.Photos)
                .ToListAsync(cancellationToken);

                return Result<List<Photo>>.Success(photos);
        }
    }
}

