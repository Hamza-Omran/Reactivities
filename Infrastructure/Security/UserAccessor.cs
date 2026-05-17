using System;
using System.Security.Claims;
using Domain;
using Infrastructure.Interfaces;
using Microsoft.AspNetCore.Http;
using Persistence;

namespace Infrastructure.Security;

public class UserAccessor(IHttpContextAccessor httpContextAccessor, AppDbContext dbcontext) : IUserAccessor
{
    public async Task<User> GetUserAsync()
    {
        return await dbcontext.Users.FindAsync(GetUserId())
            ?? throw new UnauthorizedAccessException("No user is logged in");
    }

    public string GetUserId()
    {
        return httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new Exception("No User Found");
    }
}
