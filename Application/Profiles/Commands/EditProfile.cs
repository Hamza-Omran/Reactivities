using System;
using Application.Core;
using Application.Profiles.DTOs;
using AutoMapper;
using Domain;
using Infrastructure.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Http;
using Persistence;

namespace Application.Profiles.Commands;

public class EditProfile
{
    public class Command : IRequest<Result<Unit>>
    {
        public required EditProfileDto ProfileDto { get; set; }
    }

    public class Handler(IUserAccessor userAccessor, AppDbContext context, IMapper mapper) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var user = await userAccessor.GetUserAsync();

            if(user == null) return Result<Unit>.Failure("User not found.", 404);

            mapper.Map(request.ProfileDto, user);

            var result = await context.SaveChangesAsync(cancellationToken) > 0;

            if(!result) return Result<Unit>.Failure("Failed to udpate the profile.", 400);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
